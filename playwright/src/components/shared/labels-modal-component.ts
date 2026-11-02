/**
 * Edit labels modal (wizard, VM detail, console resource summary).
 */

import BaseComponent from '@/components/shared/base-component';
import { pollUntil } from '@/utils/poll-until';
import { TestTimeouts } from '@/utils/test-config';
import { type Locator, type Page } from '@playwright/test';

/** Visible Edit labels modal (KubeVirt TabModal or console dialog in `#modal-container`). */
export function editLabelsDialog(page: Page): Locator {
  const byAccessibleName = page.getByRole('dialog', { name: /edit labels/i });
  const byHeading = page
    .locator('#modal-container')
    .locator('#tab-modal, [role="dialog"]')
    .filter({ visible: true })
    .filter({ has: page.getByRole('heading', { name: /^Edit labels$/i }) });
  return byAccessibleName.or(byHeading).first();
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

  /** Console resource summary — link/button in Labels row. */
  async openFromResourceSummary(): Promise<void> {
    await pollUntil(async () => await this.clickResourceSummaryLabelsEditorIfReady(), {
      message: 'Resource summary Labels editor should be available',
      timeout: TestTimeouts.LONG_OPERATION,
    });
  }

  private async clickResourceSummaryLabelsEditorIfReady(): Promise<boolean> {
    const metadataLabelsEdit = this.page.locator('[data-test-id$="-labels-edit"]').first();
    if (await metadataLabelsEdit.isVisible().catch(() => false)) {
      await this.robustClick(metadataLabelsEdit);
      return true;
    }

    if (
      await this.labelsSummaryRow()
        .isVisible()
        .catch(() => false)
    ) {
      const editInLabelsRow = this.labelsSummaryRow().getByRole('button', { name: /^Edit$/i });
      if (
        await editInLabelsRow
          .first()
          .isVisible()
          .catch(() => false)
      ) {
        await this.robustClick(editInLabelsRow.first());
        return true;
      }
    }

    const labelsRow = this.resourceSummaryMain()
      .locator('.pf-c-description-list__group, .pf-v6-c-description-list__group')
      .filter({
        has: this.page
          .getByText(/^Labels$|Labels and annotations/i)
          .or(this.page.getByRole('button', { name: /^Labels$/ })),
      });
    const metadataLabelsEditInRow = this.page
      .locator('[data-test-id$="-labels"]')
      .getByRole('button', { name: /^Edit$/i })
      .first();
    if (await metadataLabelsEditInRow.isVisible().catch(() => false)) {
      await this.robustClick(metadataLabelsEditInRow);
      return true;
    }

    const openers = [
      labelsRow.getByRole('link', { name: /Edit|^\d+$/ }),
      labelsRow.getByRole('button', { name: /^Edit$/i }),
      labelsRow.getByRole('button', { name: /edit labels/i }),
      labelsRow.locator('a, button').first(),
      this.page.locator('[data-test-selector="labels"]').locator('a, button').first(),
      this.page
        .locator('[data-test-id="vm-configuration-metadata"]')
        .getByRole('button', { name: /edit/i }),
      this.page
        .locator('[data-test-id="vm-configuration-metadata"]')
        .getByRole('link', { name: /edit/i }),
      this.page.getByRole('button', { name: /edit labels/i }),
      this.page.getByRole('link', { name: /0 labels|Edit labels/i }),
      this.page.getByLabel(/Edit labels/i),
      this.page.locator('button[aria-label*="labels" i]'),
    ];
    for (const opener of openers) {
      const target = opener.first();
      if (await target.isVisible().catch(() => false)) {
        await this.robustClick(target);
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
    const dialog = this.dialog();
    const saveButton = dialog
      .locator('[data-test="save-button"], [data-test-id="save-button"]')
      .or(dialog.getByRole('button', { name: /^Save$/i }))
      .first();
    await pollUntil(
      async () => {
        if (!(await saveButton.isVisible().catch(() => false))) {
          return false;
        }
        return !(await saveButton.isDisabled().catch(() => false));
      },
      {
        message: 'Edit labels Save should be enabled',
        timeout: TestTimeouts.ELEMENT_WAIT,
      },
    );
    await this.robustClick(saveButton);
  }

  async waitForOpen(): Promise<void> {
    await pollUntil(
      async () =>
        await this.dialog()
          .isVisible()
          .catch(() => false),
      {
        message: 'Edit labels modal should be visible',
        timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
      },
    );
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
