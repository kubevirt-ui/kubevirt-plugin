/**
 * Component for interacting with the Auto-Applied Labels section
 * in the admin and user Settings tabs.
 */

import BaseComponent from '@/components/shared/base-component';
import type { Page } from '@playwright/test';

export default class SettingsAutoLabelsComponent extends BaseComponent {
  private readonly _addKeyButton = this.locator('[data-test="add-auto-label-key"]');
  private readonly _adminContent = this.locator('#auto-applied-labels--content');
  private readonly _userContent = this.locator('#default-vm-labels--content');
  private readonly _validationError = this.locator('.pf-v6-c-helper-text__item.pf-m-error');

  constructor(page: Page) {
    super(page);
  }

  /** Returns the locator for a specific label row by key text within a section. */
  private _getLabelRow(section: 'admin' | 'user', key: string) {
    const content = section === 'admin' ? this._adminContent : this._userContent;
    return content.locator('.pf-v6-l-grid').filter({ hasText: key });
  }

  /** Returns the value cell for a label row. */
  private _getValueCell(section: 'admin' | 'user', key: string) {
    return this._getLabelRow(section, key).locator('.pf-v6-l-grid__item').nth(1);
  }

  async clickAddNewKey(): Promise<void> {
    await this.robustClick(this._addKeyButton);
  }

  async clickRemoveLabel(key: string, section: 'admin' | 'user' = 'admin'): Promise<void> {
    const row = this._getLabelRow(section, key);
    await this.robustClick(row.locator('button[aria-label="Delete"]'));
  }

  async confirmEditInLastRow(): Promise<void> {
    const lastRow = this._adminContent.locator('.pf-v6-l-grid').last();
    await this.robustClick(lastRow.locator('button[aria-label="Confirm"]'));
  }

  async editLabelValue(
    key: string,
    newValue: string,
    section: 'admin' | 'user' = 'admin',
  ): Promise<void> {
    const row = this._getLabelRow(section, key);
    await row.waitFor({ state: 'visible', timeout: 15000 });
    const valueCell = row.locator('.pf-v6-l-grid__item').nth(1);
    const input = valueCell.locator('input');
    const isAlreadyEditing = await input.isVisible().catch(() => false);

    if (!isAlreadyEditing) {
      const editButton =
        section === 'admin'
          ? valueCell.locator('button[aria-label="Edit value"]')
          : valueCell.locator('button[aria-label^="Edit value for"]');
      await this.robustClick(editButton);
    }

    await input.fill(newValue);
    await this.robustClick(valueCell.locator('button[aria-label="Confirm"]'));
  }

  async fillNewKeyInput(key: string): Promise<void> {
    const lastRow = this._adminContent.locator('.pf-v6-l-grid').last();
    await lastRow.locator('input').first().fill(key);
  }

  /** Returns a locator for the edit button on a label row. Use with expect().toBeVisible(). */
  getEditButtonLocator(key: string, section: 'admin' | 'user' = 'admin') {
    const row = this._getLabelRow(section, key);
    const valueCell = row.locator('.pf-v6-l-grid__item').nth(1);
    return section === 'admin'
      ? valueCell.locator('button[aria-label="Edit value"]')
      : valueCell.locator('button[aria-label^="Edit value for"]');
  }

  /** Returns a locator for the empty state text. Use with expect().toBeVisible(). */
  getEmptyStateLocator(section: 'admin' | 'user' = 'admin') {
    const text =
      section === 'admin'
        ? 'No auto-applied labels configured'
        : 'No auto-applied labels have been configured by an administrator.';
    return this.locator(`text=${text}`);
  }

  /** Returns a locator for the specified text within a section. Use with expect().toBeVisible(). */
  getTextLocatorInSection(text: string, section: 'admin' | 'user' = 'admin') {
    const content = section === 'admin' ? this._adminContent : this._userContent;
    return content.locator(`text=${text}`);
  }

  /** Returns a locator for the validation error. Use with expect().toBeVisible(). */
  getValidationErrorLocator() {
    return this._validationError.first();
  }

  async isEditButtonVisible(key: string, section: 'admin' | 'user' = 'admin'): Promise<boolean> {
    const row = this._getLabelRow(section, key);
    await row.waitFor({ state: 'visible', timeout: 15000 });
    const valueCell = row.locator('.pf-v6-l-grid__item').nth(1);
    const editButton =
      section === 'admin'
        ? valueCell.locator('button[aria-label="Edit value"]')
        : valueCell.locator('button[aria-label^="Edit value for"]');
    return editButton.isVisible().catch(() => false);
  }

  async isEmptyStateVisible(section: 'admin' | 'user' = 'admin'): Promise<boolean> {
    const text =
      section === 'admin'
        ? 'No auto-applied labels configured'
        : 'No auto-applied labels have been configured by an administrator.';
    return this.locator(`text=${text}`)
      .waitFor({ state: 'visible', timeout: 30000 })
      .then(() => true)
      .catch(() => false);
  }

  async isTextVisibleInSection(
    text: string,
    section: 'admin' | 'user' = 'admin',
  ): Promise<boolean> {
    const content = section === 'admin' ? this._adminContent : this._userContent;
    return content
      .locator(`text=${text}`)
      .waitFor({ state: 'visible', timeout: 15000 })
      .then(() => true)
      .catch(() => false);
  }

  async isValidationErrorVisible(): Promise<boolean> {
    return this._validationError
      .first()
      .waitFor({ state: 'visible', timeout: 5000 })
      .then(() => true)
      .catch(() => false);
  }

  async pressTabInLastRow(): Promise<void> {
    const lastRow = this._adminContent.locator('.pf-v6-l-grid').last();
    await lastRow.locator('input').first().press('Tab');
  }

  async toggleRequired(key: string): Promise<void> {
    const row = this._getLabelRow('admin', key);
    await this.robustClick(row.locator('.pf-v6-c-switch'));
  }

  async triggerValueValidation(key: string, value: string): Promise<void> {
    const valueCell = this._getValueCell('admin', key);
    await this.robustClick(valueCell.locator('button[aria-label="Edit value"]'));
    await valueCell.locator('input').fill(value);
    await valueCell.locator('input').press('Tab');
  }
}
