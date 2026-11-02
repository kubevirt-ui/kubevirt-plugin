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
    for (let attempt = 1; attempt <= 3; attempt++) {
      const toggle = actions.first();
      await this.robustClick(toggle);
      if ((await toggle.getAttribute('aria-expanded').catch(() => null)) !== 'true') {
        await this.robustClick(toggle);
      }
      try {
        await deleteItem().waitFor({
          state: 'visible',
          timeout: TestTimeouts.UI_ACTION_COMPLETE,
        });
        await this.robustClick(deleteItem());
        break;
      } catch (error) {
        await this.page.keyboard.press('Escape').catch(() => undefined);
        if (attempt === 3) {
          throw error;
        }
        await this.page.waitForTimeout(TestTimeouts.UI_DELAY_SHORT);
      }
    }
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

  async filterByName(name: string, displayName?: string): Promise<void> {
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
    await this.page
      .locator('[data-test-id="resource-title"]')
      .filter({ hasText: /VirtualMachine Templates|Templates/i })
      .waitFor({ timeout: 2 * MINUTE });
  }

  async goToListAndFind(name: string): Promise<void> {
    await this.goToList();
    await this.filterByName(name);
    await this.templateRowLink(name).waitFor({ state: 'visible', timeout: 2 * MINUTE });
  }

  async goToNamespaceList(namespace: string, nameFilter?: string): Promise<void> {
    const base = ConsoleRoutes.templatesInNamespace(namespace);
    const path = nameFilter ? `${base}?name=${encodeURIComponent(nameFilter)}` : base;
    await this.gotoList(path);
    await this.page
      .locator('[data-test-id="resource-title"]')
      .filter({ hasText: /VirtualMachine Templates|Templates/i })
      .waitFor({ timeout: TestTimeouts.LONG_OPERATION });
    await this.waitForListLoaded(TestTimeouts.LONG_OPERATION);
  }

  async goToTemplateTab(tab: 'parameters' | 'scripts'): Promise<void> {
    const label = tab === 'parameters' ? /^Parameters$/i : /^Scripts$/i;
    await this.robustClick(this.page.getByRole('link', { name: label }));
  }

  labelOnDetail(text: string): Locator {
    return this.page.getByText(text, { exact: false }).first();
  }

  async openColumnManagement(): Promise<void> {
    await this.columnManagementButton().click();
  }

  async openPluginTemplate(namespace: string, name: string): Promise<void> {
    await this.page.goto(`/k8s/ns/${namespace}/templates/${name}`, {
      waitUntil: 'domcontentloaded',
    });
  }

  async openTemplate(namespace: string, name: string): Promise<void> {
    await this.openPluginTemplate(namespace, name);
    await this.dismissConsoleObstructions();
    await this.pluginTemplateHeading(name)
      .or(this.resourceDetailHeading(name))
      .first()
      .waitFor({ state: 'visible', timeout: TestTimeouts.LONG_OPERATION });
  }

  pluginTemplateDetailUrlPattern(name: string): RegExp {
    return new RegExp(`/templates/${name}(?:/|$)`);
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
    const byHref = scope.locator(`a[href*="/templates/${name}"], a[href*="~Template/${name}"]`);
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
