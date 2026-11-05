import { dismissConsoleObstructions } from '@/utils/console-modals';
import { ensureNonPrivAdministratorPerspective } from '@/utils/console-perspective';
import { ConsoleRoutes } from '@/utils/console-routes';
import { pollUntil } from '@/utils/poll-until';
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

  /** Delete modal needs the related DataImportCron object; row/detail menus load it lazily on first open. */
  private async waitForDataImportCronLazyLoad(): Promise<void> {
    await this.page
      .waitForResponse(
        (response) =>
          response.request().method() === 'GET' &&
          /dataimportcrons/i.test(response.url()) &&
          response.status() >= 200 &&
          response.status() < 300,
        { timeout: TestTimeouts.RESOURCE_CREATION },
      )
      .catch(() => undefined);
    await this.page.waitForTimeout(TestTimeouts.UI_DELAY_SHORT);
  }

  private async clickDataSourceDeleteMenuItem(scope: Locator = this.page): Promise<void> {
    const deleteItem = scope
      .getByTestId('datasource-action-delete')
      .or(scope.locator('[data-test-id="datasource-action-delete"]'))
      .or(scope.getByRole('menuitem', { name: /^Delete$/i }));
    await deleteItem.first().waitFor({ state: 'visible', timeout: TestTimeouts.ELEMENT_WAIT });
    await this.robustClick(deleteItem.first());
  }

  private async openDataSourceDeleteFromRow(name: string): Promise<void> {
    const row = this.row(name).first();
    await row.waitFor({ state: 'visible', timeout: TestTimeouts.ELEMENT_WAIT });
    const kubevirtMenu = await this.findKubevirtActionsToggle(name, row);
    if (kubevirtMenu) {
      const cronLoad = this.waitForDataImportCronLazyLoad();
      await this.openKubevirtRowActionsMenu(name, row, kubevirtMenu.toggle);
      await cronLoad;
      await this.clickVisiblePluginDeleteAction('datasource-action-delete');
      return;
    }
    const pluginKebab = row
      .locator('[data-test-id="data-source-actions"]')
      .getByRole('button')
      .first();
    const cronLoad = this.waitForDataImportCronLazyLoad();
    await this.robustClick(pluginKebab);
    await cronLoad;
    await this.clickDataSourceDeleteMenuItem();
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
    await this.waitForAnnotationsEditorReady();
    const modal = this.annotationsModal();
    const keyInput = this.annotationKeyInputs(modal).last();
    const valueInput = this.annotationValueInputs(modal).last();
    await keyInput.fill(key);
    await valueInput.fill(value);
    await this.saveAnnotationsModal();
  }

  private annotationKeyInputs(modal: Locator): Locator {
    return modal
      .locator('input[aria-label="annotation key"]')
      .or(modal.getByRole('textbox', { name: /^Key$/i }))
      .or(modal.getByRole('textbox', { name: /^annotation key$/i }));
  }

  private annotationValueInputs(modal: Locator): Locator {
    return modal
      .locator('input[aria-label="annotation value"]')
      .or(modal.getByRole('textbox', { name: /^Value$/i }))
      .or(modal.getByRole('textbox', { name: /^annotation value$/i }));
  }

  private annotationsEditorModal(): Locator {
    return this.page
      .locator('#tab-modal')
      .filter({ visible: true })
      .or(
        this.page.getByRole('dialog').filter({
          has: this.page.getByRole('heading', { name: /edit annotations/i }),
        }),
      )
      .first();
  }

  annotationsLink(): Locator {
    return this.annotationsSummary().getByText(/\d+ Annotation/i);
  }

  annotationsModal(): Locator {
    return this.annotationsEditorModal();
  }

  annotationsSummary(): Locator {
    return this.page
      .locator(
        '.pf-v6-c-description-list__group, .pf-v5-c-description-list__group, .pf-c-description-list__group',
      )
      .filter({
        has: this.page
          .getByRole('button', { name: /^Annotations$/i })
          .or(this.page.getByText('Annotations', { exact: true })),
      });
  }

  private async waitForDetailAnnotationsAffordance(): Promise<void> {
    await pollUntil(
      async () =>
        (await this.actionsButton()
          .isVisible()
          .catch(() => false)) ||
        (await this.annotationsSummary()
          .getByRole('button', { name: /\d+ annotations?/i })
          .first()
          .isVisible()
          .catch(() => false)) ||
        (await this.annotationsSummary()
          .getByRole('link', { name: /\d+ Annotation/i })
          .first()
          .isVisible()
          .catch(() => false)),
      {
        message: 'DataSource detail annotations controls should be visible',
        timeout: TestTimeouts.LONG_OPERATION,
      },
    );
  }

  /** KubeVirt `DeleteModal` or console delete dialog from list actions. */
  async confirmDelete(resourceName?: string): Promise<void> {
    const deleteModal = this.deleteConfirmationDialog();
    await deleteModal.waitFor({ state: 'visible', timeout: TestTimeouts.ELEMENT_WAIT });
    await this.fillDeleteConfirmationName(deleteModal, resourceName);
    await this.confirmDeleteDialog(deleteModal);
  }

  async createFromForm(name: string, url: string, cron: string): Promise<void> {
    await dismissConsoleObstructions(this.page);
    await ensureNonPrivAdministratorPerspective(this.page);
    if (/\/DataSource\/~new/.test(this.page.url())) {
      const namespace = this.page.url().match(/\/ns\/([^/]+)\//)?.[1];
      if (namespace) {
        await this.goToNamespaceList(namespace);
      }
    }
    const createFormModalReady = async (): Promise<boolean> => {
      for (const root of this.listSearchRoots()) {
        if (
          await root
            .locator('#datasource-create-name')
            .isVisible()
            .catch(() => false)
        ) {
          return true;
        }
      }
      return false;
    };

    await pollUntil(
      async () => {
        if (await createFormModalReady()) {
          return true;
        }

        const withForm = this.page.getByRole('menuitem', { name: /With form/i });
        if (await withForm.isVisible().catch(() => false)) {
          await withForm.click({ force: true });
          await this.page
            .getByRole('dialog')
            .filter({ has: this.page.locator('#datasource-create-name') })
            .first()
            .waitFor({ state: 'visible', timeout: TestTimeouts.UI_ACTION_COMPLETE })
            .catch(() => undefined);
          return createFormModalReady();
        }

        await this.page.keyboard.press('Escape').catch(() => undefined);
        await dismissConsoleObstructions(this.page);

        for (const root of this.listSearchRoots()) {
          const createDropdown = root.getByTestId('item-create');
          if (await createDropdown.isVisible().catch(() => false)) {
            const menuToggle = createDropdown
              .locator('button.pf-c-dropdown__toggle-button, button.pf-v6-c-menu-toggle')
              .last();
            if (await menuToggle.isVisible().catch(() => false)) {
              await menuToggle.click();
              return false;
            }
            const buttons = createDropdown.getByRole('button');
            if ((await buttons.count()) > 1) {
              await buttons.nth(1).click();
              return false;
            }
          }

          const createButton = root.getByRole('button', { name: /Create DataSource/i }).first();
          if (await createButton.isVisible().catch(() => false)) {
            await createButton.click();
            return false;
          }
        }
        return false;
      },
      {
        intervalMs: 1500,
        message: 'DataSource Create → With form modal should open',
        timeout: TestTimeouts.LONG_OPERATION,
      },
    );
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

  async createFromYaml(manifestYaml?: string, expectedName?: string): Promise<void> {
    await this.openCreateDropdown('Create DataSource');
    await this.createFromYamlAndSubmit(manifestYaml);
    const urlPattern = expectedName
      ? this.dataSourceDetailUrlPattern(expectedName)
      : /cdi\.kubevirt\.io~v1beta1~DataSource\/[^/]+(?:\/|$)/;
    await this.waitForResourceDetailUrl(urlPattern, TestTimeouts.RESOURCE_CREATION);
    await this.resourceTitle().waitFor({
      state: 'visible',
      timeout: TestTimeouts.RESOURCE_CREATION,
    });
    if (expectedName) {
      await pollUntil(
        async () => ((await this.resourceTitle().textContent()) ?? '').includes(expectedName),
        {
          message: `DataSource detail title should show ${expectedName}`,
          timeout: TestTimeouts.RESOURCE_CREATION,
        },
      );
    }
  }

  dataSourceDetailUrlPattern(name: string): RegExp {
    return this.resourceDetailUrlPattern('DataSource', name);
  }

  async deleteAnnotationByKey(key: string): Promise<void> {
    await this.waitForAnnotationsEditorReady();
    const modal = this.annotationsModal();
    const legacyKeys = modal.locator('input[aria-label="annotation key"]');
    if (
      await legacyKeys
        .first()
        .isVisible()
        .catch(() => false)
    ) {
      const count = await legacyKeys.count();
      for (let i = 0; i < count; i += 1) {
        if ((await legacyKeys.nth(i).inputValue()) === key) {
          await modal.locator('button.pf-m-plain, button.pf-v6-c-button.pf-m-plain').nth(i).click();
          await this.saveAnnotationsModal();
          return;
        }
      }
    }

    const keyInputs = this.annotationKeyInputs(modal);
    const count = await keyInputs.count();
    for (let i = 0; i < count; i += 1) {
      if ((await keyInputs.nth(i).inputValue()) === key) {
        await modal
          .getByRole('button', { name: /^Delete$/i })
          .nth(i)
          .click();
        await this.saveAnnotationsModal();
        return;
      }
    }
    throw new Error(`Annotation key not found in modal: ${key}`);
  }

  async deleteFromDetail(name?: string): Promise<void> {
    const actionsToggle = this.page
      .locator('[data-test-id="data-source-actions"]')
      .getByRole('button')
      .first()
      .or(this.actionsButton());
    const cronLoad = this.waitForDataImportCronLazyLoad();
    await this.robustClick(actionsToggle);
    await cronLoad;
    await this.clickDataSourceDeleteMenuItem();
    await this.confirmDelete(name);
    if (name) {
      await this.page
        .waitForURL((url) => !url.pathname.includes(`/DataSource/${name}`), { timeout: 2 * MINUTE })
        .catch(() => undefined);
    }
  }

  async deleteFromList(name: string): Promise<void> {
    await this.filterByName(name);
    await this.openDataSourceDeleteFromRow(name);
    await this.deleteDialogHeading('DataSource').waitFor({
      state: 'visible',
      timeout: TestTimeouts.ELEMENT_WAIT,
    });
    await this.confirmDelete(name);
  }

  editAnnotationsModalHeading(): Locator {
    return this.annotationsEditorModal().getByRole('heading', { name: /edit annotations/i });
  }

  private async waitForAnnotationsEditorReady(): Promise<void> {
    await pollUntil(
      async () => {
        const modal = this.annotationsEditorModal();
        if (!(await modal.isVisible().catch(() => false))) {
          return false;
        }
        if (
          await this.annotationKeyInputs(modal)
            .first()
            .isVisible()
            .catch(() => false)
        ) {
          return true;
        }
        const addMore = modal.getByRole('button', { name: /add more/i });
        if (await addMore.isVisible().catch(() => false)) {
          await addMore.click();
          return this.annotationKeyInputs(modal)
            .last()
            .isVisible()
            .catch(() => false);
        }
        return false;
      },
      {
        message: 'Edit annotations editor should be ready',
        timeout: TestTimeouts.LONG_OPERATION,
      },
    );
  }

  async editLabels(_name: string, label: string): Promise<void> {
    await dismissConsoleObstructions(this.page);
    await pollUntil(
      async () =>
        (await this.actionsButton()
          .isVisible()
          .catch(() => false)) ||
        (await this.page
          .locator('main')
          .getByRole('button', { name: /^Edit$/i })
          .first()
          .isVisible()
          .catch(() => false)),
      {
        message: 'DataSource detail labels editor should be available',
        timeout: TestTimeouts.ELEMENT_WAIT,
      },
    );
    const labelsRowEdit = this.page
      .locator('main')
      .locator(
        '.pf-v6-c-description-list__group, .pf-v5-c-description-list__group, .pf-c-description-list__group',
      )
      .filter({ has: this.page.getByRole('button', { name: /^Labels$/i }) })
      .getByRole('button', { name: /^Edit$/i })
      .first();
    if (await labelsRowEdit.isVisible().catch(() => false)) {
      await this.robustClick(labelsRowEdit);
      await fillLabelsModalInput(this.page, label);
      return;
    }
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
    await this.listPageHeading(/DataSources/i).waitFor({ timeout: TestTimeouts.LONG_OPERATION });
  }

  async goToNamespaceList(namespace: string): Promise<void> {
    await dismissConsoleObstructions(this.page);
    await ensureNonPrivAdministratorPerspective(this.page);
    await this.gotoList(ConsoleRoutes.dataSourcesInNamespace(namespace));
    await this.listPageHeading(/DataSources/i).waitFor({ timeout: TestTimeouts.LONG_OPERATION });
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

  private annotationsSummaryEditButton(): Locator {
    return this.annotationsSummary()
      .getByRole('button')
      .filter({ has: this.page.getByText(/\d+ Annotation/i) });
  }

  async openAnnotationsModal(): Promise<void> {
    await dismissConsoleObstructions(this.page);
    await this.page.keyboard.press('Escape').catch(() => undefined);
    await this.waitForDetailAnnotationsAffordance();

    const openers: Array<() => Promise<boolean>> = [
      async () => {
        const summaryEdit = this.annotationsSummaryEditButton();
        if (
          !(await summaryEdit
            .first()
            .isVisible()
            .catch(() => false))
        ) {
          return false;
        }
        await this.robustClick(summaryEdit.first());
        return true;
      },
      async () => {
        if (
          !(await this.actionsButton()
            .isVisible()
            .catch(() => false))
        ) {
          return false;
        }
        await this.clickActionsMenuItem('datasource-action-edit-annotations', /Edit annotations/i);
        return true;
      },
      async () => {
        const countButton = this.annotationsSummary().getByRole('button', {
          name: /\d+ annotations?/i,
        });
        if (
          !(await countButton
            .first()
            .isVisible()
            .catch(() => false))
        ) {
          return false;
        }
        await this.robustClick(countButton.first());
        return true;
      },
      async () => {
        const countLink = this.annotationsSummary().getByRole('link', { name: /\d+ Annotation/i });
        if (!(await countLink.isVisible().catch(() => false))) {
          return false;
        }
        await countLink.click();
        return true;
      },
      async () => {
        await openResourceAnnotationsEditor(this.page);
        return true;
      },
    ];

    let lastError: unknown;
    for (const open of openers) {
      await this.page.keyboard.press('Escape').catch(() => undefined);
      try {
        if (!(await open())) {
          continue;
        }
        await this.waitForAnnotationsEditorReady();
        return;
      } catch (error) {
        lastError = error;
      }
    }
    throw lastError ?? new Error('Could not open Edit annotations modal');
  }

  async openDetail(namespace: string, name: string): Promise<void> {
    await this.page.goto(`/k8s/ns/${namespace}/cdi.kubevirt.io~v1beta1~DataSource/${name}`, {
      waitUntil: 'domcontentloaded',
    });
    await this.resourceTitle().waitFor({ state: 'visible', timeout: TestTimeouts.ELEMENT_WAIT });
    await this.waitForDetailAnnotationsAffordance();
  }

  async saveAnnotationsModal(): Promise<void> {
    const modal = this.annotationsEditorModal();
    const save = modal.getByRole('button', { name: /^Save$/i });
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
