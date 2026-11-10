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

export async function isEditLabelsModalVisible(page: Page): Promise<boolean> {
  if (
    await editLabelsDialog(page)
      .isVisible()
      .catch(() => false)
  ) {
    return true;
  }
  const tabModal = page.locator('#tab-modal').filter({ visible: true });
  return tabModal
    .locator(
      '[data-test-id="save-button"], [data-test="save-button"], #tags-input, [data-test="tags-input"], [data-test-id="label-key-input"]',
    )
    .first()
    .isVisible()
    .catch(() => false);
}

export default class LabelsModalComponent extends BaseComponent {
  constructor(page: Page) {
    super(page);
  }

  private dialog(): Locator {
    return editLabelsDialog(this.page);
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
        if (await isEditLabelsModalVisible(this.page)) {
          return true;
        }
        await this.page.keyboard.press('Escape').catch(() => undefined);
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
      if (!(await target.isVisible().catch(() => false))) {
        continue;
      }
      await this.robustClick(target);
      // Parallel runs often swallow the first click — require the modal, not just the click.
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
        const saveButton = this.dialog()
          .getByTestId('save-button')
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
