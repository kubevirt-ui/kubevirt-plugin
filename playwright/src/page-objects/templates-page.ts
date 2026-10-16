import { ConsoleRoutes } from '@/utils/console-routes';
import { fillLabelsModalInput, openResourceLabelsEditor } from '@/utils/resource-summary';
import { MINUTE, TestTimeouts } from '@/utils/test-config';
import type { Locator } from '@playwright/test';
import { expect } from '@playwright/test';

import { ResourceListPage } from './resource-list-page';

export class TemplatesPage extends ResourceListPage {
  readonly listPath = '/k8s/all-namespaces/template.openshift.io~v1~Template';

  columnManagementButton(): Locator {
    return this.page.locator('button[aria-label="Column management"]');
  }

  resetColumnButton(): Locator {
    return this.page.getByRole('button', { name: 'Reset' });
  }

  saveColumnButton(): Locator {
    return this.page.getByRole('button', { name: 'Save' });
  }

  columnManagementDialogHeading(): Locator {
    return this.page.getByRole('heading', { name: /Manage columns/i });
  }

  labelOnDetail(text: string): Locator {
    return this.page.getByText(text, { exact: false }).first();
  }

  async goToList(): Promise<void> {
    await this.gotoList(this.listPath);
    await this.page
      .locator('[data-test-id="resource-title"]')
      .filter({ hasText: /VirtualMachine Templates|Templates/i })
      .waitFor({ timeout: 2 * MINUTE });
  }

  async goToNamespaceList(namespace: string): Promise<void> {
    await this.gotoList(ConsoleRoutes.templatesInNamespace(namespace));
    await this.page
      .locator('[data-test-id="resource-title"]')
      .filter({ hasText: /VirtualMachine Templates|Templates/i })
      .waitFor({ timeout: TestTimeouts.LONG_OPERATION });
  }

  templatesTableRows(): Locator {
    return this.page.locator('[role="grid"] [role="rowgroup"] [role="row"]');
  }

  /** Plugin list waits for boot sources before rows stabilize. */
  async waitForListLoaded(timeout = 2 * MINUTE): Promise<void> {
    await expect
      .poll(async () => (await this.templatesTableRows().count()) > 0, {
        message: 'VirtualMachine Templates table should show rows',
        timeout,
      })
      .toBe(true);
  }

  async filterByName(name: string): Promise<void> {
    const pluginSearch = this.page.getByPlaceholder(/Search by name/i);
    if (await pluginSearch.isVisible().catch(() => false)) {
      await this.waitForListLoaded();
      await pluginSearch.click();
      await pluginSearch.fill(name);
      await expect
        .poll(async () => (await pluginSearch.inputValue()) === name, {
          message: 'Template name filter input should contain search text',
          timeout: TestTimeouts.ELEMENT_WAIT,
        })
        .toBe(true);
      await expect
        .poll(async () => await this.templateGridLink(name).isVisible(), {
          message: `Filtered template list should show ${name}`,
          timeout: TestTimeouts.LONG_OPERATION,
        })
        .toBe(true);
      return;
    }
    await super.filterByName(name);
  }

  /** Plugin VM Templates table (4.12) — template name links in virtualized rows. */
  templateGridLink(name: string): Locator {
    return this.page.getByRole('link', { name, exact: true });
  }

  async goToListAndFind(name: string): Promise<void> {
    await this.goToList();
    await this.filterByName(name);
    await this.templateRowLink(name).waitFor({ state: 'visible', timeout: 2 * MINUTE });
  }

  rowLink(name: string): Locator {
    return this.templateRowLink(name);
  }

  async createFromYaml(manifestYaml?: string): Promise<void> {
    await this.openCreateDropdown(/Create Template/i);
    await this.createFromYamlAndSubmit(manifestYaml);
    await this.waitForResourceDetailUrl(
      /template\.openshift\.io~v1~Template\/[^/]+(?:\/|$)|\/templates\/[^/]+(?:\/|$)/,
    );
    await this.page
      .getByRole('heading', { level: 1 })
      .first()
      .waitFor({ state: 'visible', timeout: TestTimeouts.RESOURCE_CREATION });
  }

  async openTemplate(namespace: string, name: string): Promise<void> {
    await this.page.goto(`/k8s/ns/${namespace}/template.openshift.io~v1~Template/${name}`, {
      waitUntil: 'domcontentloaded',
    });
  }

  async openPluginTemplate(namespace: string, name: string): Promise<void> {
    await this.page.goto(`/k8s/ns/${namespace}/templates/${name}`, {
      waitUntil: 'domcontentloaded',
    });
  }

  pluginTemplateHeading(name: string): Locator {
    return this.page.getByRole('heading', { name: new RegExp(name) });
  }

  async editLabels(_name: string, label: string): Promise<void> {
    await openResourceLabelsEditor(this.page);
    await fillLabelsModalInput(this.page, label);
  }

  async deleteFromDetail(name?: string): Promise<void> {
    await this.page
      .getByRole('button', { name: 'Actions' })
      .click({ timeout: TestTimeouts.ELEMENT_WAIT });
    const menu = this.page.locator('.pf-c-dropdown__menu, .pf-v6-c-menu__content, [role="menu"]');
    await menu.waitFor({ state: 'visible', timeout: TestTimeouts.ELEMENT_WAIT });
    await menu.getByRole('menuitem', { name: /^Delete/i }).click();
    await this.confirmDelete(name);
    if (name) {
      await this.page
        .waitForURL((url) => !url.pathname.includes(`~v1~Template/${name}`), {
          timeout: TestTimeouts.LONG_OPERATION,
        })
        .catch(() => undefined);
    }
  }

  async openColumnManagement(): Promise<void> {
    await this.columnManagementButton().click();
  }

  async deleteFromList(name: string): Promise<void> {
    await this.openDeleteDialog(name);
    await this.confirmDelete(name);
  }
}
