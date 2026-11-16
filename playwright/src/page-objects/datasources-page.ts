import { isEditLabelsModalVisible } from '@/components/shared/labels-modal-component';
import { dismissConsoleObstructions } from '@/utils/console-modals';
import { ensureNonPrivAdministratorPerspective } from '@/utils/console-perspective';
import { ConsoleRoutes } from '@/utils/console-routes';
import { pollUntil } from '@/utils/poll-until';
import {
  fillLabelsModalInput,
  openResourceAnnotationsEditor,
  openResourceLabelsEditor,
} from '@/utils/resource-summary';
import { MINUTE, SECOND, TestTimeouts } from '@/utils/test-config';
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

  /**
   * KubeVirt TabModal "Delete DataSource?" from list/detail actions.
   * Form-created sources delete DataImportCron first, then DataSource — never Cancel on timeout.
   */
  override async confirmDelete(resourceName?: string): Promise<void> {
    for (let attempt = 1; attempt <= 2; attempt += 1) {
      const deleteModal = this.deleteDataSourceDialog();
      await deleteModal.waitFor({ state: 'visible', timeout: TestTimeouts.ELEMENT_WAIT });
      await this.fillDeleteConfirmationName(deleteModal, resourceName);

      if (await this.submitDataSourceDelete(deleteModal)) {
        return;
      }
      // The dialog stayed open, enabled and error-free: the submits never reached the modal
      // (stale handler / covered button) and no request was issued — reopen a fresh dialog.
      if (attempt === 2 || !resourceName) {
        throw new Error(
          `Delete DataSource dialog for ${resourceName ?? 'resource'} ignored every submit — no delete was issued`,
        );
      }
      await deleteModal
        .getByTestId('cancel-button')
        .or(deleteModal.locator('button[aria-label="Close"]'))
        .first()
        .click({ force: true })
        .catch(() => undefined);
      await deleteModal
        .waitFor({ state: 'hidden', timeout: TestTimeouts.ELEMENT_WAIT })
        .catch(() => undefined);
      if (await deleteModal.isVisible().catch(() => false)) {
        await this.page.keyboard.press('Escape').catch(() => undefined);
      }
      await this.openDeleteDialog(resourceName);
    }
  }

  private deleteDataSourceDialog(): Locator {
    return this.page
      .locator('#tab-modal, [data-test="dialog-modal"], [role="dialog"]')
      .filter({ visible: true })
      .filter({
        has: this.page.getByRole('heading', { name: /Delete DataSource/i }),
      })
      .first();
  }

  /**
   * PF tooltips stay pinned while their trigger is hovered or focused and are painted above a
   * modal, so a toolbar tooltip can sit on top of the dialog footer and swallow the Delete click
   * (`force: true` clicks go to the topmost element and silently do nothing). Blur the trigger and
   * neutralize any remaining tooltip layer, mirroring `dismissConsoleObstructions`.
   */
  private async dismissHoverTooltips(): Promise<void> {
    await this.page.mouse.move(0, 0).catch(() => undefined);
    await this.page
      .evaluate(() => {
        const active = document.activeElement as HTMLElement | null;
        if (active && active !== document.body) {
          active.blur();
        }
        document
          .querySelectorAll('.pf-v6-c-tooltip, .pf-v5-c-tooltip, .pf-c-tooltip, [role="tooltip"]')
          .forEach((tooltip) => {
            (tooltip as HTMLElement).style.pointerEvents = 'none';
          });
      })
      .catch(() => undefined);
    await this.page
      .locator('.pf-v6-c-tooltip, .pf-v5-c-tooltip, .pf-c-tooltip, [role="tooltip"]')
      .first()
      .waitFor({ state: 'hidden', timeout: TestTimeouts.SHORT_WAIT })
      .catch(() => undefined);
  }

  /** Resolves true once the dialog closed; false when it never accepted a submit. */
  private async submitDataSourceDelete(deleteModal: Locator): Promise<boolean> {
    const saveButton = deleteModal
      .getByTestId('save-button')
      .or(deleteModal.locator('[data-test="save-button"]'))
      .or(deleteModal.getByRole('button', { name: /^Delete$/i }))
      .first();

    await this.dismissHoverTooltips();

    await pollUntil(async () => (await saveButton.isEnabled().catch(() => false)) === true, {
      message: 'Delete DataSource button should be enabled',
      timeout: TestTimeouts.ELEMENT_WAIT,
    });

    // A force click goes to whatever is topmost at the point, so a covering tooltip turns it into
    // a silent no-op. Click for real (Playwright retries until the button receives the event),
    // then escalate to a trusted Enter and finally to a direct form submit.
    const submitAttempts: (() => Promise<void>)[] = [
      async () => {
        await this.dismissHoverTooltips();
        await saveButton.click({ timeout: TestTimeouts.UI_ACTION_COMPLETE });
      },
      async () => {
        await this.dismissHoverTooltips();
        await saveButton.focus();
        await this.page.keyboard.press('Enter');
      },
      () =>
        saveButton.evaluate((button: HTMLButtonElement) => {
          const form =
            button.form ??
            (document.getElementById(button.getAttribute('form')) as HTMLFormElement | null);
          if (form) {
            form.requestSubmit();
            return;
          }
          button.click();
        }),
    ];

    let submitAttemptsUsed = 0;
    let lastSubmitAt = Date.now();

    await pollUntil(
      async () => {
        if (!(await deleteModal.isVisible().catch(() => false))) {
          return true;
        }

        const alert = deleteModal.getByRole('alert');
        if (await alert.isVisible().catch(() => false)) {
          const text = ((await alert.textContent()) ?? '').trim();
          const lower = text.toLowerCase();
          if (lower.includes('not found') || lower.includes('already been deleted')) {
            await deleteModal
              .getByTestId('cancel-button')
              .or(deleteModal.locator('button[aria-label="Close"]'))
              .first()
              .click({ force: true })
              .catch(() => undefined);
            return true;
          }
          // Any other alert after a submit is a real CDI/RBAC error — surface it, never retry blind.
          if (submitAttemptsUsed > 0) {
            throw new Error(`Delete DataSource failed: ${text.slice(0, 300)}`);
          }
        }

        const enabled = await saveButton.isEnabled().catch(() => false);
        if (!enabled) {
          // Submit in flight (DIC then DS) — wait for close.
          lastSubmitAt = Date.now();
          return false;
        }

        // Cap re-submits; DIC finalizers can keep the modal open a long time after one submit.
        if (submitAttemptsUsed < submitAttempts.length) {
          await submitAttempts[submitAttemptsUsed]().catch(() => undefined);
          submitAttemptsUsed += 1;
          lastSubmitAt = Date.now();
          return !(await deleteModal.isVisible().catch(() => false));
        }

        // Enabled, error-free and still open long after the last submit — the submit went nowhere.
        return Date.now() - lastSubmitAt > 10 * SECOND;
      },
      {
        intervalMs: 1000,
        message: 'Delete DataSource modal should submit and close',
        timeout: TestTimeouts.LONG_OPERATION,
      },
    );

    return !(await deleteModal.isVisible().catch(() => false));
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

  async createFromYaml(manifestYaml?: string): Promise<void> {
    const namespace = this.page.url().match(/\/ns\/([^/]+)\//)?.[1];
    const yamlUrl = namespace
      ? `${ConsoleRoutes.dataSourcesInNamespace(namespace)}/~new`
      : undefined;

    const yamlEditorReady = async (): Promise<boolean> =>
      /DataSource\/~new/i.test(this.page.url()) ||
      (await this.page
        .locator('.monaco-editor')
        .first()
        .isVisible()
        .catch(() => false));

    await pollUntil(
      async () => {
        if (await yamlEditorReady()) {
          return true;
        }

        const withYaml = this.page
          .getByRole('menuitem', { name: /With YAML|Import YAML/i })
          .or(this.page.getByRole('link', { name: /With YAML|Import YAML/i }))
          .first();
        if (await withYaml.isVisible().catch(() => false)) {
          try {
            await withYaml.click({ force: true, timeout: TestTimeouts.UI_DELAY_MEDIUM });
          } catch {
            // Menu remounted — reopen below.
          }
          await this.page
            .locator('.monaco-editor')
            .first()
            .waitFor({ state: 'visible', timeout: TestTimeouts.UI_ACTION_COMPLETE })
            .catch(() => undefined);
          return yamlEditorReady();
        }

        await this.page.keyboard.press('Escape').catch(() => undefined);
        await dismissConsoleObstructions(this.page);

        if (await this.openImportYamlCreateLink()) {
          return yamlEditorReady();
        }

        try {
          await this.openCreateDropdown('Create DataSource');
        } catch {
          if (yamlUrl) {
            await this.page.goto(yamlUrl, { waitUntil: 'domcontentloaded' });
            return yamlEditorReady();
          }
        }
        return false;
      },
      {
        intervalMs: 1500,
        message: 'DataSource Create → With YAML editor should open',
        timeout: TestTimeouts.LONG_OPERATION,
      },
    );

    if (!(await yamlEditorReady()) && yamlUrl) {
      await this.page.goto(yamlUrl, { waitUntil: 'domcontentloaded' });
    }

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

  /** Click the trash/remove control in the same annotation row as the given key input. */
  private async clickAnnotationRowRemove(keyInput: Locator): Promise<boolean> {
    return keyInput.evaluate((input) => {
      let node: HTMLElement | null = input as HTMLElement;
      for (let depth = 0; depth < 10 && node; depth += 1) {
        const inputs = node.querySelectorAll('input');
        const buttons = Array.from(node.querySelectorAll('button')).filter((btn) => {
          const label = `${btn.getAttribute('aria-label') ?? ''} ${btn.textContent ?? ''}`.trim();
          // Never treat "+ Add more" as a row remove control.
          if (/add more|^add$/i.test(label)) {
            return false;
          }
          return /delete|remove/i.test(label) || btn.className.includes('pf-m-plain');
        });
        // Row = at least key+value inputs and one action button (trash).
        if (inputs.length >= 2 && buttons.length >= 1) {
          (buttons[buttons.length - 1] as HTMLButtonElement).click();
          return true;
        }
        node = node.parentElement;
      }
      return false;
    });
  }

  private async removeEmptyAnnotationRows(modal: Locator): Promise<void> {
    // Empty key rows make Save fail with: name part must be non-empty.
    for (let round = 0; round < 8; round += 1) {
      const keys = this.annotationKeyInputs(modal);
      const count = await keys.count();
      let removed = false;
      for (let i = count - 1; i >= 0; i -= 1) {
        const value = (
          (await keys
            .nth(i)
            .inputValue()
            .catch(() => '')) ?? ''
        ).trim();
        if (value !== '') {
          continue;
        }
        if (await this.clickAnnotationRowRemove(keys.nth(i))) {
          removed = true;
          break;
        }
      }
      if (!removed) {
        return;
      }
    }
  }

  async deleteAnnotationByKey(key: string): Promise<void> {
    await this.waitForAnnotationsEditorReady();
    const modal = this.annotationsModal();
    const keyInputs = this.annotationKeyInputs(modal);
    const count = await keyInputs.count();
    for (let i = 0; i < count; i += 1) {
      if ((await keyInputs.nth(i).inputValue()) !== key) {
        continue;
      }
      const removed = await this.clickAnnotationRowRemove(keyInputs.nth(i));
      if (!removed) {
        throw new Error(`Could not find remove control for annotation key: ${key}`);
      }
      await this.removeEmptyAnnotationRows(modal);
      await this.saveAnnotationsModal();
      return;
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
    await this.openDeleteDialog(name);
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
    // Prefer shared Labels modal opener (handles PF6 term/Edit sibling layout).
    try {
      await openResourceLabelsEditor(this.page);
    } catch {
      const labelsRowEdit = this.page
        .locator('main')
        .getByRole('button', { name: /^Labels$/i })
        .locator('xpath=following-sibling::button[normalize-space()="Edit"][1]')
        .or(
          this.page
            .locator('main')
            .locator(
              '.pf-v6-c-description-list__group, .pf-v5-c-description-list__group, .pf-c-description-list__group, dt, .pf-v6-c-description-list__term',
            )
            .filter({ has: this.page.getByRole('button', { name: /^Labels$/i }) })
            .getByRole('button', { name: /^Edit$/i })
            .first(),
        );

      await pollUntil(
        async () => {
          if (await isEditLabelsModalVisible(this.page)) {
            return true;
          }
          await dismissConsoleObstructions(this.page);
          if (await labelsRowEdit.isVisible().catch(() => false)) {
            await labelsRowEdit.scrollIntoViewIfNeeded().catch(() => undefined);
            await labelsRowEdit.click({ force: true }).catch(() => this.robustClick(labelsRowEdit));
          } else if (
            await this.actionsButton()
              .isVisible()
              .catch(() => false)
          ) {
            await this.clickActionsMenuItem(
              'datasource-action-edit-labels',
              /^Edit labels$/i,
            ).catch(() => undefined);
          } else {
            return false;
          }
          return pollUntil(async () => isEditLabelsModalVisible(this.page), {
            intervalMs: 200,
            message: 'Edit labels modal after Edit click',
            timeout: TestTimeouts.UI_ACTION_COMPLETE,
          })
            .then(() => true)
            .catch(() => false);
        },
        {
          message: 'DataSource Edit labels modal should open',
          timeout: TestTimeouts.LONG_OPERATION,
        },
      );
    }
    await fillLabelsModalInput(this.page, label);
    const labelKey = label.split('=')[0] || label;
    // Console detail can lag after Save — wait for chip/text before returning.
    await pollUntil(
      async () =>
        (await this.labelOnDetail(label)
          .isVisible()
          .catch(() => false)) ||
        (await this.page
          .getByText(labelKey)
          .first()
          .isVisible()
          .catch(() => false)),
      {
        message: `DataSource label ${label} should appear on detail after save`,
        timeout: TestTimeouts.LONG_OPERATION,
      },
    );
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
    await this.removeEmptyAnnotationRows(modal);
    const save = modal.getByRole('button', { name: /^Save$/i });
    await pollUntil(
      async () => {
        if (
          !(await this.editAnnotationsModalHeading()
            .isVisible()
            .catch(() => false))
        ) {
          return true;
        }
        await this.removeEmptyAnnotationRows(modal);
        // Drop any remaining blank key rows that pairs-list keeps appending.
        const keys = this.annotationKeyInputs(modal);
        const count = await keys.count();
        for (let i = count - 1; i >= 0; i -= 1) {
          const value = (
            (await keys
              .nth(i)
              .inputValue()
              .catch(() => '')) ?? ''
          ).trim();
          if (value === '') {
            await this.clickAnnotationRowRemove(keys.nth(i));
          }
        }
        if (await save.isDisabled().catch(() => false)) {
          return false;
        }
        await save
          .click({ force: true, timeout: TestTimeouts.UI_ACTION_COMPLETE })
          .catch(() => undefined);
        const error = modal.getByText(
          /An error occurred|name part must be non-empty|Duplicate keys found/i,
        );
        if (await error.isVisible().catch(() => false)) {
          await this.removeEmptyAnnotationRows(modal);
          return false;
        }
        return !(await this.editAnnotationsModalHeading()
          .isVisible()
          .catch(() => false));
      },
      {
        message: 'Edit annotations Save should close the modal',
        timeout: TestTimeouts.LONG_OPERATION,
      },
    );
  }

  tagsInput(): Locator {
    return this.page.locator('#tags-input, [data-test="tags-input"]');
  }
}
