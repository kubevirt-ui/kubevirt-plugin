import { ConsoleRoutes } from '@/utils/console-routes';
import { pollUntil } from '@/utils/poll-until';
import { fillLabelsModalInput, openResourceLabelsEditor } from '@/utils/resource-summary';
import { MINUTE, TestTimeouts } from '@/utils/test-config';
import type { Locator } from '@playwright/test';

import { ResourceListPage } from './resource-list-page';

export type TemplateYamlCreateTarget = { name: string; namespace: string };

const templateDetailUrlPattern =
  /template\.openshift\.io~v1~Template\/[^/]+(?:\/|$)|\/templates\/[^/]+(?:\/|$)/;

export class TemplatesPage extends ResourceListPage {
  readonly listPath = '/k8s/all-namespaces/template.openshift.io~v1~Template';

  columnManagementButton(): Locator {
    return this.page.locator('button[aria-label="Column management"]');
  }

  columnManagementDialogHeading(): Locator {
    return this.page.getByRole('heading', { name: /Manage columns/i });
  }

  commonTemplateAlert(): Locator {
    return this.page.getByTestId('common-template-alert');
  }

  async createFromYaml(manifestYaml?: string, target?: TemplateYamlCreateTarget): Promise<void> {
    await this.waitForListLoaded(TestTimeouts.LONG_OPERATION);
    await this.openCreateDropdown(/Create Template/i);
    await this.createFromYamlAndSubmit(manifestYaml);

    const onDetail = await pollUntil(async () => templateDetailUrlPattern.test(this.page.url()), {
      message: 'Template detail URL after YAML import',
      timeout: TestTimeouts.RESOURCE_CREATION,
    })
      .then(() => true)
      .catch(() => false);

    if (!onDetail && target) {
      await this.openPluginTemplate(target.namespace, target.name);
    } else if (!onDetail) {
      await this.waitForResourceDetailUrl(templateDetailUrlPattern, TestTimeouts.ELEMENT_WAIT);
    }

    const heading = target
      ? this.pluginTemplateHeading(target.name).or(this.resourceDetailHeading(target.name))
      : this.page.getByRole('heading', { level: 1 }).first();
    await heading.first().waitFor({ state: 'visible', timeout: TestTimeouts.RESOURCE_CREATION });
  }

  async deleteFromDetail(name?: string): Promise<void> {
    const actions = this.page
      .getByRole('button', { name: /^Actions$/i })
      .or(this.page.locator('[data-test-id="action-items"] button').first());
    const deleteItem = () =>
      this.visibleActionsMenu()
        .getByRole('menuitem', { name: /^Delete/i })
        .first();
    const toggle = actions.first();
    // A click can land on a menu rendered before the detail page settles (data/watch refresh)
    // and no dialog appears — click Delete, then require the confirmation dialog, retrying.
    await pollUntil(
      async () => {
        const dialog = this.deleteConfirmationDialog();
        if (await dialog.isVisible().catch(() => false)) {
          return true;
        }
        if ((await toggle.getAttribute('aria-expanded').catch(() => null)) !== 'true') {
          await this.robustClick(toggle).catch(() => undefined);
        }
        if (
          !(await deleteItem()
            .isVisible()
            .catch(() => false))
        ) {
          return false;
        }
        await this.robustClick(deleteItem()).catch(() => undefined);
        return dialog
          .waitFor({ state: 'visible', timeout: TestTimeouts.UI_ACTION_COMPLETE })
          .then(() => true)
          .catch(() => false);
      },
      {
        intervalMs: 1000,
        message: `Delete confirmation dialog should open for ${name ?? 'resource'}`,
        timeout: TestTimeouts.LONG_OPERATION,
      },
    );
    await this.confirmDelete(name);
    if (name) {
      await pollUntil(
        () => {
          const path = this.page.url();
          return Promise.resolve(
            !path.includes(`~v1~Template/${name}`) &&
              !path.includes(`/templates/${name}`) &&
              !path.includes(`Template/${name}`),
          );
        },
        {
          message: `Should leave template detail after deleting ${name}`,
          timeout: TestTimeouts.LONG_OPERATION,
        },
      ).catch(() => undefined);
    }
  }

  async deleteFromList(name: string): Promise<void> {
    await this.openDeleteDialog(name);
    await this.confirmDelete(name);
  }

  async editLabels(name: string, label: string): Promise<void> {
    await this.dismissConsoleObstructions();
    const pluginLabelsEdit = this.page.locator(`[data-test-id="${name}-labels-edit"]`);
    const descriptionListLabelsEdit = this.page
      .locator('.pf-v6-c-description-list__group, .pf-c-description-list__group')
      .filter({ has: this.page.getByRole('button', { name: /^Labels$/ }) })
      .getByRole('button', { name: /^Edit$/i })
      .first();
    const actions = this.page
      .getByRole('button', { name: /^Actions$/i })
      .or(this.page.locator('[data-test-id="action-items"] button').first());
    const actionsEditLabels = this.page.getByRole('menuitem', { name: /^Edit labels$/i });
    const labelsAdd = this.page.locator('[data-test="labels-add-btn"]');
    const labelsButton = this.page.getByRole('button', { name: /^Labels$/ });
    const labelsButtonEditSibling = labelsButton.locator(
      'xpath=following-sibling::button[normalize-space()="Edit"]',
    );

    await pollUntil(
      async () => {
        if (await pluginLabelsEdit.isVisible().catch(() => false)) {
          await this.robustClick(pluginLabelsEdit);
          return true;
        }
        if (await descriptionListLabelsEdit.isVisible().catch(() => false)) {
          await this.robustClick(descriptionListLabelsEdit);
          return true;
        }
        if (await labelsAdd.isVisible().catch(() => false)) {
          await labelsAdd.click();
          return true;
        }
        if (await labelsButton.isVisible().catch(() => false)) {
          if (await labelsButtonEditSibling.isVisible().catch(() => false)) {
            await labelsButtonEditSibling.click();
            return true;
          }
        }
        if (
          await actions
            .first()
            .isVisible()
            .catch(() => false)
        ) {
          await actions.first().click();
          if (await actionsEditLabels.isVisible().catch(() => false)) {
            await actionsEditLabels.click();
            return true;
          }
        }
        return false;
      },
      {
        message: `Template ${name} Labels editor should be available`,
        timeout: TestTimeouts.LONG_OPERATION,
      },
    ).catch(async () => {
      await openResourceLabelsEditor(this.page);
    });
    await fillLabelsModalInput(this.page, label);
  }

  async editLabelsIfAvailable(_name: string, label: string): Promise<boolean> {
    try {
      await this.editLabels(_name, label);
      return true;
    } catch (error) {
      if (error instanceof Error && error.message.includes('Could not find Labels editor')) {
        return false;
      }
      throw error;
    }
  }

  override async filterByName(name: string, displayName?: string): Promise<void> {
    const input = this.page.locator('main [data-test-id="item-filter"]');
    if (
      await input
        .waitFor({ state: 'visible', timeout: TestTimeouts.ELEMENT_WAIT })
        .then(() => true)
        .catch(() => false)
    ) {
      await this.waitForListLoaded();
      await input.fill(name);
      await pollUntil(
        async () => {
          if (new URL(this.page.url()).searchParams.get('name') === name) {
            return true;
          }
          return (await input.inputValue()) === name;
        },
        {
          message: 'Template name filter should apply',
          timeout: TestTimeouts.ELEMENT_WAIT,
        },
      );
      await this.page.waitForTimeout(300);
      const rowLink = this.templateGridLink(name, displayName);
      await pollUntil(async () => await rowLink.isVisible(), {
        message: `Filtered template list should show ${name}`,
        timeout: TestTimeouts.LONG_OPERATION,
      });
      return;
    }
    await super.filterByName(name);
  }

  async goToList(): Promise<void> {
    await this.gotoList(this.listPath);
    await this.listPageHeading(/VirtualMachine Templates|Templates/i).waitFor({
      timeout: 2 * MINUTE,
    });
  }

  async goToListAndFind(name: string): Promise<void> {
    await this.goToList();
    await this.filterByName(name);
    await this.templateRowLink(name).waitFor({ state: 'visible', timeout: 2 * MINUTE });
  }

  async goToNamespaceList(namespace: string, nameFilter?: string): Promise<void> {
    // OpenShift Template list first (CRUD suites), then native VirtualMachineTemplate (v1beta1 → v1alpha1).
    const openshiftBase = ConsoleRoutes.templatesInNamespace(namespace);
    const nativeBases = [
      `/k8s/ns/${namespace}/template.kubevirt.io~v1beta1~VirtualMachineTemplate`,
      `/k8s/ns/${namespace}/template.kubevirt.io~v1alpha1~VirtualMachineTemplate`,
    ];
    const withFilter = (base: string) =>
      nameFilter ? `${base}?name=${encodeURIComponent(nameFilter)}` : base;
    await this.gotoList(withFilter(openshiftBase));
    const pageMissing = async (): Promise<boolean> =>
      (await this.page
        .getByRole('heading', { name: /404:\s*Page Not Found/i })
        .isVisible()
        .catch(() => false)) ||
      (await this.page
        .getByText(/doesn't have a resource type/i)
        .isVisible()
        .catch(() => false));
    if (await pageMissing()) {
      for (const nativeBase of nativeBases) {
        await this.gotoList(withFilter(nativeBase));
        if (!(await pageMissing())) {
          break;
        }
      }
    }
    await this.listPageHeading(
      /VirtualMachineTemplates|VirtualMachine Templates|Templates/i,
    ).waitFor({
      timeout: TestTimeouts.LONG_OPERATION,
    });
    await this.waitForListLoaded(TestTimeouts.LONG_OPERATION);
  }

  async goToTemplateTab(tab: 'parameters' | 'scripts'): Promise<void> {
    const tabConfig = {
      parameters: {
        id: 'horizontal-link-Parameters',
        label: /^Parameters$/i,
      },
      scripts: {
        id: 'horizontal-link-Scripts',
        label: /^Scripts$/i,
      },
    } as const;
    const { id, label } = tabConfig[tab];
    const tabLink = this.consoleTestId(id).or(this.page.getByRole('link', { name: label }));
    await this.robustClick(tabLink.first());
  }

  labelOnDetail(text: string): Locator {
    return this.page.getByText(text, { exact: false }).first();
  }

  async openColumnManagement(): Promise<void> {
    await this.columnManagementButton().click();
  }

  private templateDetailActions(): Locator {
    // Product ActionsDropdown uses data-test="actions-dropdown"; console details use action-items.
    return this.page
      .getByRole('button', { name: /^Actions$/i })
      .or(this.page.locator('[data-test="actions-dropdown"]'))
      .or(this.page.locator('[data-test-id="action-items"]'));
  }

  private templateDetailNotFound(): Locator {
    return this.page
      .getByRole('heading', { name: /404:\s*Page Not Found/i })
      .or(this.page.getByText(/We couldn['’]t find that page/i))
      .or(this.page.getByText(/doesn't have a resource type/i));
  }

  /** Detail chrome: Actions, or plugin resource-title (data-test on TemplatePageTitle). */
  private templateDetailReady(name: string): Locator {
    return this.templateDetailActions()
      .or(this.page.locator('[data-test="resource-title"]').filter({ hasText: name }))
      .or(this.pluginTemplateHeading(name))
      .or(this.resourceDetailHeading(name))
      .first();
  }

  /**
   * True when detail chrome is usable (Actions). Title alone is insufficient on console
   * 404 pages; callers that need title should wait on templateDetailReady separately.
   */
  private async hasUsableTemplateDetail(timeout = TestTimeouts.DEFAULT): Promise<boolean> {
    const actions = this.templateDetailActions().first();
    const notFound = this.templateDetailNotFound().first();
    await Promise.race([
      actions.waitFor({ state: 'visible', timeout }).catch(() => undefined),
      notFound.waitFor({ state: 'visible', timeout }).catch(() => undefined),
    ]);
    if (await notFound.isVisible().catch(() => false)) {
      return false;
    }
    return actions.isVisible().catch(() => false);
  }

  /**
   * Open a native VirtualMachineTemplate (template.kubevirt.io) detail.
   * Does not try OpenShift Template URLs — those 404/blank and burned the Tier1 budget.
   */
  async openNativeVirtualMachineTemplate(namespace: string, name: string): Promise<void> {
    const candidates = [
      `/k8s/ns/${namespace}/template.kubevirt.io~v1beta1~VirtualMachineTemplate/${name}`,
      `/k8s/ns/${namespace}/template.kubevirt.io~v1alpha1~VirtualMachineTemplate/${name}`,
    ];
    for (const path of candidates) {
      await this.page.goto(path, { waitUntil: 'domcontentloaded' });
      await this.dismissConsoleObstructions();
      if (await this.hasUsableTemplateDetail(TestTimeouts.DEFAULT)) {
        return;
      }
    }

    // Plugin Templates list (nav href) merges OpenShift + native rows.
    await this.goToNativeTemplateList(namespace, name);
    const link = this.templateGridLink(name).or(this.rowLink(name)).first();
    await link.waitFor({ state: 'visible', timeout: TestTimeouts.ELEMENT_WAIT });
    await this.robustClick(link);
    await this.dismissConsoleObstructions();
    await this.templateDetailReady(name).waitFor({
      state: 'visible',
      timeout: TestTimeouts.ELEMENT_WAIT,
    });
    if (!(await this.hasUsableTemplateDetail(TestTimeouts.UI_VISIBILITY_QUICK))) {
      throw new Error(`Native VirtualMachineTemplate detail not found for ${namespace}/${name}`);
    }
  }

  async goToNativeTemplateList(namespace: string, nameFilter?: string): Promise<void> {
    const bases = [
      `/k8s/ns/${namespace}/templates`,
      `/k8s/ns/${namespace}/template.kubevirt.io~v1beta1~VirtualMachineTemplate`,
      `/k8s/ns/${namespace}/template.openshift.io~v1~Template`,
    ];
    const withFilter = (base: string) =>
      nameFilter ? `${base}?name=${encodeURIComponent(nameFilter)}` : base;
    const pageMissing = async (): Promise<boolean> =>
      (await this.page
        .getByRole('heading', { name: /404:\s*Page Not Found/i })
        .isVisible()
        .catch(() => false)) ||
      (await this.page
        .getByText(/doesn't have a resource type/i)
        .isVisible()
        .catch(() => false));

    for (const base of bases) {
      await this.gotoList(withFilter(base));
      if (!(await pageMissing())) {
        break;
      }
    }
    await this.listPageHeading(
      /VirtualMachineTemplates|VirtualMachine Templates|Templates/i,
    ).waitFor({
      timeout: TestTimeouts.ELEMENT_WAIT,
    });
    await this.waitForListLoaded(TestTimeouts.ELEMENT_WAIT);
  }

  async openPluginTemplate(namespace: string, name: string): Promise<void> {
    // Native VirtualMachineTemplate first, then OpenShift Template / legacy plugin path.
    // Require Actions (not just a title) so wrong-kind 404s fall through.
    const candidates = [
      `/k8s/ns/${namespace}/template.kubevirt.io~v1beta1~VirtualMachineTemplate/${name}`,
      `/k8s/ns/${namespace}/template.kubevirt.io~v1alpha1~VirtualMachineTemplate/${name}`,
      `/k8s/ns/${namespace}/template.openshift.io~v1~Template/${name}`,
      `/k8s/ns/${namespace}/templates/${name}`,
    ];
    for (const path of candidates) {
      await this.page.goto(path, { waitUntil: 'domcontentloaded' });
      await this.dismissConsoleObstructions();
      // Keep probes short — 4×ELEMENT_WAIT previously burned most of the Tier1 budget.
      if (await this.hasUsableTemplateDetail(TestTimeouts.DEFAULT)) {
        return;
      }
    }
    // List → row link fallback when direct GVK URLs render a blank pane.
    await this.goToNamespaceList(namespace, name);
    const link = this.templateGridLink(name).or(this.rowLink(name)).first();
    try {
      await link.waitFor({ state: 'visible', timeout: TestTimeouts.ELEMENT_WAIT });
      await this.robustClick(link);
      await this.hasUsableTemplateDetail(TestTimeouts.DEFAULT);
    } catch {
      // openTemplate / callers assert detail readiness
    }
  }

  async openTemplate(namespace: string, name: string): Promise<void> {
    await this.openPluginTemplate(namespace, name);
    await this.dismissConsoleObstructions();
    await this.templateDetailReady(name).waitFor({
      state: 'visible',
      timeout: TestTimeouts.ELEMENT_WAIT,
    });
    if (!(await this.hasUsableTemplateDetail(TestTimeouts.UI_VISIBILITY_QUICK))) {
      throw new Error(`Template detail not found for ${namespace}/${name}`);
    }
  }

  pluginTemplateDetailUrlPattern(name: string): RegExp {
    return new RegExp(
      `(?:/templates/${name}|VirtualMachineTemplate/${name}|template\\.kubevirt\\.io~v1alpha1~VirtualMachineTemplate/${name})(?:/|$)`,
    );
  }

  pluginTemplateHeading(name: string): Locator {
    return this.page.getByRole('heading', { name: new RegExp(name) });
  }

  resetColumnButton(): Locator {
    return this.page.getByRole('button', { name: 'Reset' });
  }

  rowLink(name: string): Locator {
    return this.templateRowLink(name);
  }

  saveColumnButton(): Locator {
    return this.page.getByRole('button', { name: 'Save' });
  }

  /** Plugin VM Templates table — row link by metadata name, display name, or plugin detail href. */
  templateGridLink(name: string, displayName?: string): Locator {
    const scope = this.page.locator('main');
    const byMetadataName = scope.getByRole('link', { exact: true, name });
    const byHref = scope.locator(
      `a[href*="/templates/${name}"], a[href*="~Template/${name}"], a[href*="VirtualMachineTemplate/${name}"]`,
    );
    if (displayName) {
      return byMetadataName
        .or(scope.getByRole('link', { name: displayName }))
        .or(byHref)
        .first();
    }
    return byMetadataName.or(byHref).first();
  }

  templateParametersMarker(): Locator {
    return this.page.getByRole('heading', { name: /^Parameters$/i }).first();
  }

  templateScriptsCloudInitMarker(): Locator {
    return this.page.getByRole('heading', { name: /^Cloud-init$/i }).first();
  }

  templatesTableRows(): Locator {
    return this.page.locator('[role="grid"] [role="rowgroup"] [role="row"]');
  }

  /** Plugin list waits for boot sources before rows stabilize (empty namespaces are valid). */
  async waitForListLoaded(timeout = 2 * MINUTE): Promise<void> {
    await pollUntil(
      async () => {
        if ((await this.templatesTableRows().count()) > 0) {
          return true;
        }
        const createTemplate = this.page
          .locator('main')
          .getByRole('button', { name: /Create Template/i })
          .or(this.page.locator('main').getByRole('link', { name: /Create Template/i }));
        return createTemplate
          .first()
          .isVisible()
          .catch(() => false);
      },
      {
        message: 'VirtualMachine Templates list should finish loading',
        timeout,
      },
    );
  }
}
