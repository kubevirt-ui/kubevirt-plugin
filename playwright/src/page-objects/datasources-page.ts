import { dismissConsoleObstructions } from '@/utils/console-modals';
import { ConsoleRoutes } from '@/utils/console-routes';
import {
  fillLabelsModalInput,
  openResourceAnnotationsEditor,
  openResourceLabelsEditor,
} from '@/utils/resource-summary';
import { MINUTE, TestTimeouts } from '@/utils/test-config';
import type { Locator } from '@playwright/test';

import { ResourceListPage } from './resource-list-page';

export class DataSourcesPage extends ResourceListPage {
  readonly listPath = '/k8s/all-namespaces/cdi.kubevirt.io~v1beta1~DataSource';

  private actionsButton(): Locator {
    return this.page
      .locator('.co-actions button')
      .filter({ hasText: /^Actions$/ })
      .or(this.page.getByRole('button', { name: 'Actions' }).last());
  }

  private async clickActionsMenuItem(
    testId: string,
    menuitemPattern: RegExp,
    maxAttempts = 3,
  ): Promise<void> {
    const actions = this.actionsButton();
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      await this.robustClick(actions);
      const menu = this.visibleActionsMenu();
      const item = menu
        .locator(`[data-test-id="${testId}"]`)
        .or(menu.getByRole('menuitem', { name: menuitemPattern }));
      try {
        await item.first().waitFor({ state: 'visible', timeout: TestTimeouts.UI_ACTION_COMPLETE });
        await this.robustClick(item.first());
        return;
      } catch (error) {
        await this.page.keyboard.press('Escape').catch(() => undefined);
        if (attempt === maxAttempts) {
          throw error;
        }
        await this.page.waitForTimeout(TestTimeouts.UI_DELAY_SHORT);
      }
    }
  }

  async addAnnotation(key: string, value: string): Promise<void> {
    const modal = this.annotationsModal();
    const addMore = modal.getByRole('button', { name: /add more/i });
    if (await addMore.isVisible().catch(() => false)) {
      await addMore.click();
    }
    await modal.locator('input[aria-label="annotation key"]').last().fill(key);
    await modal.locator('input[aria-label="annotation value"]').last().fill(value);
    await this.saveAnnotationsModal();
  }

  annotationsLink(): Locator {
    return this.annotationsSummary().getByText(/\d+ Annotation/i);
  }

  annotationsModal(): Locator {
    return this.page.locator('#tab-modal').filter({ has: this.editAnnotationsModalHeading() });
  }

  annotationsSummary(): Locator {
    return this.page
      .locator('.pf-c-description-list__group, .pf-v6-c-description-list__group')
      .filter({ has: this.page.getByText('Annotations', { exact: true }) });
  }

  /** KubeVirt `DeleteModal` or console delete dialog from list actions. */
  async confirmDelete(resourceName?: string): Promise<void> {
    const deleteModal = this.deleteConfirmationDialog();
    await deleteModal.waitFor({ state: 'visible', timeout: TestTimeouts.ELEMENT_WAIT });
    await this.fillDeleteConfirmationName(deleteModal, resourceName);
    await this.confirmDeleteDialog(deleteModal);
  }

  async createFromForm(name: string, url: string, cron: string): Promise<void> {
    await this.openCreateDropdown('Create DataSource');
    await this.chooseCreateOption(/with form/i);
    await this.page.locator('#datasource-create-name').fill(name);
    await this.page.locator('#datasource-create-source-url').fill(url);
    await this.page.locator('#datasource-create-source-cron').fill(cron);
    await this.page.getByRole('button', { name: /^Save$/ }).click();
    await this.page
      .locator('#create-datasource-modal, .pf-c-modal-box')
      .waitFor({ state: 'hidden' })
      .catch(() => undefined);
    await this.page.waitForURL(new RegExp(`DataSource/${name}`), { timeout: 120_000 });
    await this.resourceTitle().waitFor({ state: 'visible', timeout: 120_000 });
  }

  async createFromYaml(manifestYaml?: string): Promise<void> {
    await this.openCreateDropdown('Create DataSource');
    await this.createFromYamlAndSubmit(manifestYaml);
    await this.waitForResourceDetailUrl(/cdi\.kubevirt\.io~v1beta1~DataSource\/[^/]+(?:\/|$)/);
    await this.resourceTitle().waitFor({
      state: 'visible',
      timeout: TestTimeouts.RESOURCE_CREATION,
    });
  }

  dataSourceDetailUrlPattern(name: string): RegExp {
    return this.resourceDetailUrlPattern('DataSource', name);
  }

  async deleteAnnotationByKey(key: string): Promise<void> {
    const modal = this.annotationsModal();
    const keys = modal.locator('input[aria-label="annotation key"]');
    const count = await keys.count();
    for (let i = 0; i < count; i += 1) {
      if ((await keys.nth(i).inputValue()) === key) {
        await modal.locator('button.pf-m-plain, button.pf-v6-c-button.pf-m-plain').nth(i).click();
        await this.saveAnnotationsModal();
        return;
      }
    }
    throw new Error(`Annotation key not found in modal: ${key}`);
  }

  async deleteFromDetail(name?: string): Promise<void> {
    await this.actionsButton().click({ timeout: 120_000 });
    const menu = this.page.locator('.pf-c-dropdown__menu, .pf-v6-c-menu__content, [role="menu"]');
    await menu.waitFor({ state: 'visible', timeout: 120_000 });
    await menu
      .getByRole('menuitem', { name: /^Delete$/ })
      .or(menu.getByText(/^Delete$/))
      .click();
    await this.confirmDelete();
    if (name) {
      await this.page
        .waitForURL((url) => !url.pathname.includes(`/DataSource/${name}`), { timeout: 2 * MINUTE })
        .catch(() => undefined);
    }
  }

  async deleteFromList(name: string): Promise<void> {
    await this.filterByName(name);
    await this.row(name).waitFor({ state: 'visible', timeout: TestTimeouts.ELEMENT_WAIT });
    await this.page.waitForTimeout(TestTimeouts.NETWORK_DELAY);
    await this.openDeleteDialog(name);
    await this.confirmDelete(name);
  }

  editAnnotationsModalHeading(): Locator {
    return this.page.getByRole('heading', { name: /edit annotations/i });
  }

  async editLabels(_name: string, label: string): Promise<void> {
    if (
      await this.actionsButton()
        .isVisible()
        .catch(() => false)
    ) {
      await this.clickActionsMenuItem('datasource-action-edit-labels', /^Edit labels$/i);
      await fillLabelsModalInput(this.page, label);
      return;
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

  editLabelsModalHeading(): Locator {
    return this.page.getByRole('heading', { name: /edit labels/i });
  }

  async getAnnotationsLinkText(): Promise<string> {
    return (await this.annotationsLink().textContent()) ?? '';
  }

  async getDetailTitleText(): Promise<string> {
    return await this.getResourceTitleText();
  }

  async goToList(): Promise<void> {
    await this.gotoList(this.listPath);
  }

  async goToNamespaceList(namespace: string): Promise<void> {
    await this.gotoList(ConsoleRoutes.dataSourcesInNamespace(namespace));
    await this.page
      .locator('[data-test-id="resource-title"]')
      .filter({ hasText: /DataSources/i })
      .waitFor({ timeout: TestTimeouts.LONG_OPERATION });
  }

  labelOnDetail(text: string): Locator {
    return this.page.getByText(text, { exact: false }).first();
  }

  labelsEditButton(_name: string): Locator {
    return this.page
      .getByTestId(`${_name}-labels-edit`)
      .or(
        this.page
          .locator('dt')
          .filter({ hasText: /^Labels$/ })
          .getByRole('link', { name: 'Edit' }),
      )
      .or(this.page.getByRole('button', { name: /edit labels/i }));
  }

  async openAnnotationsModal(): Promise<void> {
    await dismissConsoleObstructions(this.page);
    await this.page.keyboard.press('Escape').catch(() => undefined);
    if (
      await this.actionsButton()
        .isVisible()
        .catch(() => false)
    ) {
      await this.clickActionsMenuItem('datasource-action-edit-annotations', /Edit annotations/i);
      await this.editAnnotationsModalHeading().waitFor({
        state: 'visible',
        timeout: TestTimeouts.ELEMENT_WAIT,
      });
      return;
    }
    const countLink = this.annotationsSummary().getByRole('link', { name: /\d+ Annotation/i });
    if (await countLink.isVisible().catch(() => false)) {
      await countLink.click();
      await this.editAnnotationsModalHeading().waitFor({ state: 'visible' });
      return;
    }
    await openResourceAnnotationsEditor(this.page);
    await this.editAnnotationsModalHeading().waitFor({ state: 'visible' });
  }

  async openDetail(namespace: string, name: string): Promise<void> {
    await this.page.goto(`/k8s/ns/${namespace}/cdi.kubevirt.io~v1beta1~DataSource/${name}`, {
      waitUntil: 'domcontentloaded',
    });
    await this.resourceTitle().waitFor({ state: 'visible' });
  }

  async saveAnnotationsModal(): Promise<void> {
    const modal = this.page.locator('#tab-modal');
    const save = modal.getByText('Save', { exact: true });
    await save.click();
    try {
      await this.editAnnotationsModalHeading().waitFor({ state: 'hidden', timeout: 120_000 });
    } catch {
      await save.click();
      await this.editAnnotationsModalHeading().waitFor({ state: 'hidden', timeout: 120_000 });
    }
  }

  tagsInput(): Locator {
    return this.page.locator('#tags-input, [data-test="tags-input"]');
  }
}
