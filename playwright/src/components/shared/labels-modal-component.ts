/**
 * Edit labels modal (wizard, VM detail, console resource summary).
 */

import BaseComponent from '@/components/shared/base-component';
import { pollUntil } from '@/utils/poll-until';
import { TestTimeouts } from '@/utils/test-config';
import { type Locator, type Page } from '@playwright/test';

/** TabModal / console dialog controls that identify the labels editor (heading is often missing in a11y tree). */
function editLabelsModalControls(page: Page): Locator {
  return page.locator(
    '[data-test-id="save-button"], [data-test="save-button"], #tags-input, [data-test="tags-input"], [data-test-id="label-key-input"]',
  );
}

/** Visible Edit labels modal (KubeVirt TabModal or console dialog in `#modal-container`). */
export function editLabelsDialog(page: Page): Locator {
  const editHeading = page.getByRole('heading', { name: /Edit labels/i });
  const tabModal = page.locator('#tab-modal').filter({ visible: true });
  const tabModalLabelsEditor = tabModal.filter({ has: editLabelsModalControls(page) });
  return page
    .getByRole('dialog')
    .filter({ has: editHeading.or(editLabelsModalControls(page)) })
    .last()
    .or(tabModalLabelsEditor.filter({ has: editHeading }))
    .or(tabModalLabelsEditor)
    .or(
      page
        .locator('#modal-container')
        .locator('#tab-modal, [role="dialog"]')
        .filter({ visible: true })
        .filter({ has: editHeading.or(editLabelsModalControls(page)) }),
    );
}

/** Visible Edit labels dialog(s) — single locator (no `.or()`; those hang under load). */
export function visibleEditLabelsDialogs(page: Page): Locator {
  return page
    .getByRole('dialog')
    .filter({ has: page.getByRole('heading', { name: /Edit labels/i }) });
}

export async function isEditLabelsModalVisible(page: Page): Promise<boolean> {
  // Cheap checks only — never await complex `.or()` chains (they can hang the full budget).
  if (
    await page
      .getByRole('heading', { name: /Edit labels/i })
      .first()
      .isVisible()
      .catch(() => false)
  ) {
    return true;
  }
  return page
    .locator(
      [
        '#modal-container input[placeholder="app=frontend"]',
        '[role="dialog"] input[placeholder="app=frontend"]',
        '#tags-input',
        '[data-test="tags-input"]',
      ].join(', '),
    )
    .first()
    .isVisible()
    .catch(() => false);
}

/** Close stacked duplicate Edit labels dialogs, keeping the topmost for editing. */
export async function collapseDuplicateEditLabelsDialogs(page: Page): Promise<void> {
  for (let guard = 0; guard < 5; guard += 1) {
    const dialogs = visibleEditLabelsDialogs(page);
    const count = await dialogs.count().catch(() => 0);
    if (count <= 1) {
      return;
    }
    const oldest = dialogs.first();
    await oldest
      .getByRole('button', { name: /^Cancel$/i })
      .click({ force: true })
      .catch(() =>
        oldest
          .locator('button[aria-label="Close"]')
          .click({ force: true })
          .catch(() => undefined),
      );
    await page.waitForTimeout(200);
  }
}

export default class LabelsModalComponent extends BaseComponent {
  constructor(page: Page) {
    super(page);
  }

  private dialog(): Locator {
    // Prefer the last visible Edit labels dialog (duplicates can stack under load).
    return visibleEditLabelsDialogs(this.page).last().or(editLabelsDialog(this.page));
  }

  /** Labels row on the default console resource details tab (scoped to `main`). */
  private labelsSummaryRow(): Locator {
    return this.resourceSummaryMain()
      .locator(
        'dt, .pf-c-description-list__term, .pf-v6-c-description-list__term, .pf-c-description-list__group, .pf-v6-c-description-list__group',
      )
      .filter({
        has: this.page.locator('button').filter({ hasText: /^Labels$/ }),
      })
      .first();
  }

  private newKeyInput(): Locator {
    return this.dialog().getByTestId('label-key-input').last().locator('input');
  }

  private resourceSummaryMain(): Locator {
    return this.page.locator('main').first();
  }

  async addLabelRow(): Promise<void> {
    await this.robustClick(this.dialog().getByRole('button', { exact: true, name: 'Add label' }));
  }

  async close(): Promise<void> {
    const dialog = this.dialog();
    await this.page.keyboard.press('Escape');
    if (await dialog.isVisible().catch(() => false)) {
      const cancelButton = dialog.getByTestId('cancel-button');
      if (await cancelButton.isVisible().catch(() => false)) {
        await this.robustClick(cancelButton);
      } else {
        await this.page.keyboard.press('Escape');
      }
    }
    await dialog.waitFor({ state: 'hidden', timeout: TestTimeouts.UI_ELEMENT_VISIBILITY });
  }

  /** 4.12 tags input on Edit labels modal (legacy console). */
  async fillLegacyTagsInputAndSave(label: string): Promise<void> {
    await this.waitForOpen();
    const dialog = this.dialog();
    const input = dialog.locator('#tags-input, [data-test="tags-input"]');
    await input.waitFor({ state: 'visible', timeout: TestTimeouts.UI_ELEMENT_VISIBILITY });
    await input.fill(label);
    await input.press('Enter');
    await this.save();
  }

  async fillNewLabelKey(key: string): Promise<void> {
    const input = this.newKeyInput();
    await input.waitFor({ state: 'visible', timeout: TestTimeouts.UI_ELEMENT_VISIBILITY });
    await input.fill(key);
  }

  async isNewLabelKeyEnabled(): Promise<boolean> {
    const input = this.newKeyInput();
    const isVisible = await input
      .isVisible({ timeout: TestTimeouts.UI_ELEMENT_VISIBILITY })
      .catch(() => false);
    if (!isVisible) return false;
    return input.isEnabled();
  }

  async isSaveDisabled(): Promise<boolean> {
    const saveButton = this.dialog().getByTestId('save-button');
    await saveButton.waitFor({ state: 'visible', timeout: TestTimeouts.UI_ELEMENT_VISIBILITY });
    return saveButton.isDisabled();
  }

  /** Console resource summary — link/button in Labels row. Retries until the modal is open. */
  async openFromResourceSummary(): Promise<void> {
    await pollUntil(
      async () => {
        const openCount = await visibleEditLabelsDialogs(this.page).count().catch(() => 0);
        if (openCount === 1) {
          return true;
        }
        if (openCount > 1) {
          await collapseDuplicateEditLabelsDialogs(this.page);
          return (await visibleEditLabelsDialogs(this.page).count().catch(() => 0)) === 1;
        }
        // Only dismiss stale menus/toasts; avoid Escape when Labels Edit is the next target
        // (Escape can race-close a modal that just opened).
        const labelsEdit = this.resourceSummaryMain()
          .locator(
            '.pf-v6-c-description-list__group, .pf-v5-c-description-list__group, .pf-c-description-list__group',
          )
          .filter({ has: this.page.getByRole('button', { name: /^Labels$/i }) })
          .getByRole('button', { name: /^Edit$/i })
          .first();
        if (await labelsEdit.isVisible().catch(() => false)) {
          await labelsEdit.scrollIntoViewIfNeeded().catch(() => undefined);
          await labelsEdit.click({ force: true }).catch(() => undefined);
          await this.page.waitForTimeout(TestTimeouts.UI_DELAY_SHORT);
          return (await visibleEditLabelsDialogs(this.page).count().catch(() => 0)) === 1;
        }
        return this.clickResourceSummaryLabelsEditorIfReady();
      },
      {
        message: 'Resource summary Labels editor should be available',
        timeout: TestTimeouts.LONG_OPERATION,
      },
    );
  }

  private async clickResourceSummaryLabelsEditorIfReady(): Promise<boolean> {
    if (await isEditLabelsModalVisible(this.page)) {
      return true;
    }

    const labelsRowEdit = this.resourceSummaryMain()
      .locator(
        '.pf-v6-c-description-list__group, .pf-v5-c-description-list__group, .pf-c-description-list__group',
      )
      .filter({ has: this.page.getByRole('button', { name: /^Labels$/ }) })
      .getByRole('button', { name: /^Edit$/i })
      .first();

    const candidates: Locator[] = [
      labelsRowEdit,
      this.page.locator('[data-test-id$="-labels-edit"]').first(),
      this.labelsSummaryRow()
        .getByRole('button', { name: /^Edit$/i })
        .first(),
      this.page
        .locator('[data-test-id$="-labels"]')
        .getByRole('button', { name: /^Edit$/i })
        .first(),
      this.resourceSummaryMain()
        .locator('.pf-c-description-list__group, .pf-v6-c-description-list__group')
        .filter({
          has: this.page
            .getByText(/^Labels$|Labels and annotations/i)
            .or(this.page.getByRole('button', { name: /^Labels$/ })),
        })
        .getByRole('button', { name: /^Edit$/i })
        .first(),
      this.page
        .getByRole('tabpanel', { name: /^Metadata$/i })
        .locator(
          '.pf-v6-c-description-list__group, .pf-v5-c-description-list__group, .pf-c-description-list__group',
        )
        .filter({ has: this.page.getByRole('button', { name: /^Labels$/i }) })
        .getByRole('button', { name: /^Edit$/i })
        .first(),
      this.page.getByRole('button', { name: /edit labels/i }).first(),
      this.page.getByRole('link', { name: /0 labels|Edit labels/i }).first(),
    ];

    for (const target of candidates) {
      if (await isEditLabelsModalVisible(this.page)) {
        return true;
      }
      if (!(await target.isVisible().catch(() => false))) {
        continue;
      }
      // Short force click — avoid robustClick's long waitFor when Edit is covered by a modal
      // that opened but was not yet detected by isEditLabelsModalVisible.
      await target.click({ force: true, timeout: TestTimeouts.ELEMENT_WAIT }).catch(() => undefined);
      const opened = await pollUntil(async () => isEditLabelsModalVisible(this.page), {
        intervalMs: 200,
        message: 'Edit labels modal after Labels Edit click',
        timeout: TestTimeouts.UI_ACTION_COMPLETE,
      })
        .then(() => true)
        .catch(() => false);
      if (opened) {
        return true;
      }
    }
    return false;
  }

  /** After opening the summary editor, wait until the modal is interactable. */
  async openFromResourceSummaryAndWait(): Promise<void> {
    await this.openFromResourceSummary();
    await this.waitForOpen();
  }

  async save(): Promise<void> {
    // Re-resolve Save each attempt — console label modals remount under load.
    // Closed modal = success (prior click may have submitted; click can detach mid-close).
    await pollUntil(
      async () => {
        if (!(await isEditLabelsModalVisible(this.page))) {
          return true;
        }
        const saveButton = visibleEditLabelsDialogs(this.page)
          .last()
          .getByRole('button', { name: /^(Save|Save labels)$/i })
          .or(this.dialog().getByTestId('save-button'))
          .or(this.dialog().getByRole('button', { name: /^(Save|Save labels)$/i }))
          .or(
            this.page
              .locator('#modal-container, #tab-modal')
              .getByRole('button', { name: /^(Save|Save labels)$/i }),
          )
          .first();
        if (!(await saveButton.isVisible().catch(() => false))) {
          return false;
        }
        if (await saveButton.isDisabled().catch(() => true)) {
          return false;
        }
        await saveButton
          .click({ force: true, timeout: TestTimeouts.UI_ACTION_COMPLETE })
          .catch(() => undefined);
        return !(await isEditLabelsModalVisible(this.page));
      },
      {
        message: 'Edit labels Save should submit and close the modal',
        timeout: TestTimeouts.LONG_OPERATION,
      },
    );
  }

  async waitForOpen(): Promise<void> {
    await pollUntil(async () => isEditLabelsModalVisible(this.page), {
      message: 'Edit labels modal should be visible',
      timeout: TestTimeouts.LONG_OPERATION,
    });
  }

  async waitForValidationError(): Promise<void> {
    await this.dialog()
      .getByTestId('label-row-error')
      .last()
      .waitFor({ state: 'visible', timeout: TestTimeouts.UI_ELEMENT_VISIBILITY });
  }

  async waitForValidationErrorHidden(): Promise<void> {
    await pollUntil(
      async () => (await this.dialog().getByTestId('label-row-error').count()) === 0,
      {
        message: 'Label validation errors should be cleared',
        timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
      },
    );
  }
}
