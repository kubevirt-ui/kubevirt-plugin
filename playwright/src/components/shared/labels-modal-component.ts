/**
 * Edit labels modal (wizard, VM detail, console resource summary).
 */

import BaseComponent from '@/components/shared/base-component';
import { TestTimeouts } from '@/utils/test-config';
import { type Locator, type Page, expect } from '@playwright/test';

export default class LabelsModalComponent extends BaseComponent {
  constructor(page: Page) {
    super(page);
  }

  private dialog(): Locator {
    return this.page.getByRole('dialog', { name: /Edit labels/i });
  }

  private newKeyInput(): Locator {
    return this.dialog().getByTestId('label-key-input').last().locator('input');
  }

  /** Console resource summary — link/button in Labels row. */
  async openFromResourceSummary(): Promise<void> {
    const labelsRow = this.page
      .locator('.pf-c-description-list__group, .pf-v6-c-description-list__group')
      .filter({ has: this.page.getByText('Labels', { exact: true }) });
    const edit = labelsRow
      .locator('a, button')
      .first()
      .or(this.page.locator('[data-test-selector="labels"]').locator('a, button').first())
      .or(this.page.getByRole('button', { name: /edit labels/i }));
    await this.robustClick(edit.first());
  }

  /** 4.12 tags input on Edit labels modal (legacy console). */
  async fillLegacyTagsInputAndSave(label: string): Promise<void> {
    const input = this.locator('#tags-input, [data-test="tags-input"]');
    await input.fill(label);
    await input.press('Enter');
    await this.robustClick(this.page.getByRole('button', { name: /^Save$/ }));
  }

  async waitForOpen(): Promise<void> {
    await this.dialog().waitFor({
      state: 'visible',
      timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
    });
  }

  async addLabelRow(): Promise<void> {
    await this.robustClick(this.dialog().getByRole('button', { exact: true, name: 'Add label' }));
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

  async waitForValidationError(): Promise<void> {
    await this.dialog()
      .getByTestId('label-row-error')
      .last()
      .waitFor({ state: 'visible', timeout: TestTimeouts.UI_ELEMENT_VISIBILITY });
  }

  async waitForValidationErrorHidden(): Promise<void> {
    await expect(this.dialog().getByTestId('label-row-error')).toHaveCount(0, {
      timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
    });
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
}
