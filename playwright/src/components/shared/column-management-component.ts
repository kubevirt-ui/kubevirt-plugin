// ColumnManagementComponent — UI component for column management interactions.

import BaseComponent from '@/components/shared/base-component';
import { TestTimeouts } from '@/utils/test-config';
import type { Page } from '@playwright/test';

export default class ColumnManagementComponent extends BaseComponent {
  constructor(page: Page) {
    super(page);
  }

  async saveColumns() {
    await this.robustClick(this.locator('button#confirm-action'));
  }

  async clickManageColumns() {
    await this.robustClick(this.locator('button[data-test="manage-columns"]'));
  }

  async clickClearAllFilters() {
    await this.robustClick(this.locator('button:has-text("Clear all filters")'));
  }

  async checkColumn(columnName: string) {
    const cb = this.locator(`input#${columnName}`);
    if (!(await cb.isChecked())) await cb.click({ force: true });
  }

  async uncheckColumn(columnName: string) {
    const cb = this.locator(`input#${columnName}`);
    if (await cb.isChecked()) await cb.click({ force: true });
  }

  async verifyColumnUnchecked(columnName: string): Promise<boolean> {
    try {
      return !(await this.locator(`#${columnName}`).isChecked());
    } catch {
      return false;
    }
  }

  async verifyColumnVisible(columnLabel: string): Promise<boolean> {
    try {
      const h = this.locator(`[data-label="${columnLabel}"]`).first();
      await h.waitFor({ state: 'visible', timeout: TestTimeouts.UI_ELEMENT_VISIBILITY });
      return await h.isVisible();
    } catch {
      return false;
    }
  }

  async verifyColumnInvisible(columnLabel: string): Promise<boolean> {
    try {
      const h = this.locator(`[data-label="${columnLabel}"]`);
      await h.waitFor({ state: 'hidden', timeout: TestTimeouts.UI_ELEMENT_VISIBILITY });
      return await h.isHidden();
    } catch (error) {
      console.error(`Error verifying column is invisible: ${error}`);
      return false;
    }
  }

  async verifyColumnChecked(columnName: string): Promise<boolean> {
    try {
      return await this.locator(`#${columnName}`).isChecked();
    } catch {
      return false;
    }
  }

  async clickReset() {
    await this.robustClick(this.locator('button#reset-action'));
  }
}
