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
    await this.robustClick(actions.first());
    const menu = this.visibleActionsMenu();
    await menu.waitFor({ state: 'visible', timeout: TestTimeouts.ELEMENT_WAIT });
    await this.robustClick(menu.getByRole('menuitem', { name: /^Delete/i }).first());
    await this.confirmDelete(name);
    if (name) {
      await pollUntil(
        () => {
          const path = this.page.url();
          return (
            !path.includes(`~v1~Template/${name}`) &&
            !path.includes(`/templates/${name}`) &&
            !path.includes(`Template/${name}`)
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

  async editLabels(_name: string, label: string): Promise<void> {
    const actions = this.page
      .getByRole('button', { name: /^Actions$/i })
      .or(this.page.locator('[data-test-id="action-items"] button').first());
    const actionsEditLabels = this.page.getByRole('menuitem', { name: /^Edit labels$/i });
    if (
      await actions
        .first()
        .isVisible()
        .catch(() => false)
    ) {
      await actions.first().click();
      await actionsEditLabels
        .waitFor({ state: 'visible', timeout: TestTimeouts.ELEMENT_WAIT })
        .catch(() => undefined);
      if (await actionsEditLabels.isVisible().catch(() => false)) {
        await actionsEditLabels.click();
        await fillLabelsModalInput(this.page, label);
        return;
      }
    }
    const labelsAdd = this.page.locator('[data-test="labels-add-btn"]');
    if (await labelsAdd.isVisible().catch(() => false)) {
      await labelsAdd.click();
      await fillLabelsModalInput(this.page, label);
      return;
    }
    const labelsButton = this.page.getByRole('button', { name: /^Labels$/ });
    if (await labelsButton.isVisible().catch(() => false)) {
      const editSibling = labelsButton.locator(
        'xpath=following-sibling::button[normalize-space()="Edit"]',
      );
      if (await editSibling.isVisible().catch(() => false)) {
        await editSibling.click();
        await fillLabelsModalInput(this.page, label);
        return;
      }
    }
    await openResourceLabelsEditor(this.page);
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

  async filterByName(name: string): Promise<void> {
    const pluginSearch = this.page.getByPlaceholder(/Search by name/i);
    if (await pluginSearch.isVisible().catch(() => false)) {
      await this.waitForListLoaded();
      await pluginSearch.click();
      await pluginSearch.fill(name);
      await pollUntil(async () => (await pluginSearch.inputValue()) === name, {
        message: 'Template name filter input should contain search text',
        timeout: TestTimeouts.ELEMENT_WAIT,
      });
      await pollUntil(async () => await this.templateGridLink(name).isVisible(), {
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

  async goToNamespaceList(namespace: string): Promise<void> {
    await this.gotoList(ConsoleRoutes.templatesInNamespace(namespace));
    await this.page
      .locator('[data-test-id="resource-title"]')
      .filter({ hasText: /VirtualMachine Templates|Templates/i })
      .waitFor({ timeout: TestTimeouts.LONG_OPERATION });
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
    await this.page.goto(`/k8s/ns/${namespace}/template.openshift.io~v1~Template/${name}`, {
      waitUntil: 'domcontentloaded',
    });
    await this.page
      .locator('[data-test-id="resource-title"]')
      .filter({ hasText: new RegExp(name, 'i') })
      .waitFor({ timeout: TestTimeouts.LONG_OPERATION })
      .catch(() => undefined);
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

  /** Plugin VM Templates table (4.12) — template name links in virtualized rows. */
  templateGridLink(name: string): Locator {
    return this.page.getByRole('link', { exact: true, name });
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

  /** Plugin list waits for boot sources before rows stabilize. */
  async waitForListLoaded(timeout = 2 * MINUTE): Promise<void> {
    await pollUntil(async () => (await this.templatesTableRows().count()) > 0, {
      message: 'VirtualMachine Templates table should show rows',
      timeout,
    });
  }
}
