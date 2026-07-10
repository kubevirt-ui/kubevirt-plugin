import { TestTimeouts } from '@/utils/test-config';
import type { Page } from '@playwright/test';

import BaseComponent from './base-component';

export default class FilterToolbarComponent extends BaseComponent {
  private readonly _closeFilterLabelGroup = this.locator('button[aria-label="Close label group"]');
  readonly _rawRow = this.locator('tr.pf-v6-c-table__tr');
  readonly _row = this.locator('[data-test-rows="resource-row"]');

  constructor(page: Page) {
    super(page);
  }

  async checkColumn(columnName: string): Promise<void> {
    const columnCheckbox = this.locator(`input#${columnName}`);
    const isChecked = await columnCheckbox.isChecked();
    if (!isChecked) {
      await columnCheckbox.click({ force: true });
    }
  }

  async clearAllFilters(): Promise<void> {
    await this.robustClick(this.locator('button:has-text("Clear all filters")'));
  }

  async clickClearAllFilters(): Promise<void> {
    await this.robustClick(this.locator('button:has-text("Clear all filters")'));
  }

  async clickDropdownButton(): Promise<void> {
    const filterDropdownButton = this.locator('[data-test-id="filter-dropdown-toggle"]').locator(
      'button',
    );
    await this.robustClick(filterDropdownButton);
  }

  async clickManageColumns(): Promise<void> {
    await this.robustClick(this.locator('button[data-test="manage-columns"]'));
  }

  async clickReset(): Promise<void> {
    await this.robustClick(this.locator('button#reset-action'));
  }

  async closeFilterChip(): Promise<void> {
    await this._closeFilterLabelGroup.waitFor({
      state: 'visible',
      timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
    });
    await this._closeFilterLabelGroup.click();
  }

  async filterByName(name: string): Promise<void> {
    const itemFilter = this.locator('[data-test-id="item-filter"]');
    await itemFilter.clear();
    await itemFilter.fill(name);
    await itemFilter.press('Tab');
    await this.page.waitForTimeout(TestTimeouts.UI_VISIBILITY_QUICK);
  }

  async saveColumns(): Promise<void> {
    await this.robustClick(this.locator('button#confirm-action'));
  }

  async toggleRowFilter(filterKey: string, enable: boolean): Promise<void> {
    const checkbox = this.locator(`[data-test-row-filter="${filterKey}"]`).locator(
      'input[type="checkbox"]',
    );
    await checkbox.scrollIntoViewIfNeeded();
    const isChecked = await checkbox.isChecked();
    if (enable !== isChecked) {
      await checkbox.click({ force: true });
    }
    await this.page.waitForTimeout(TestTimeouts.UI_DELAY_SHORT);
  }

  async uncheckColumn(columnName: string): Promise<void> {
    const columnCheckbox = this.locator(`input#${columnName}`);
    const isChecked = await columnCheckbox.isChecked();
    if (isChecked) {
      await columnCheckbox.click({ force: true });
    }
  }

  async verifyColumnChecked(columnName: string): Promise<boolean> {
    try {
      const checkbox = this.locator(`#${columnName}`);
      return await checkbox.isChecked();
    } catch {
      return false;
    }
  }

  async verifyColumnInvisible(columnLabel: string): Promise<boolean> {
    try {
      const columnHeader = this.locator(`[data-label="${columnLabel}"]`);
      await columnHeader.waitFor({ state: 'hidden', timeout: TestTimeouts.UI_ELEMENT_VISIBILITY });
      return await columnHeader.isHidden();
    } catch (error) {
      console.error(`Error verifying column is invisible: ${error}`);
      return false;
    }
  }

  async verifyColumnUnchecked(columnName: string): Promise<boolean> {
    try {
      const checkbox = this.locator(`#${columnName}`);
      const isChecked = await checkbox.isChecked();
      return !isChecked;
    } catch {
      return false;
    }
  }

  async verifyColumnVisible(columnLabel: string): Promise<boolean> {
    try {
      const columnHeader = this.locator(`[data-label="${columnLabel}"]`).first();
      await columnHeader.waitFor({ state: 'visible', timeout: TestTimeouts.UI_ELEMENT_VISIBILITY });
      return await columnHeader.isVisible();
    } catch {
      return false;
    }
  }

  async verifyNoRow(name: string, timeout: number = TestTimeouts.DEFAULT): Promise<boolean> {
    try {
      const row = this._row.filter({ hasText: name });
      await row.waitFor({ state: 'hidden', timeout });
      return await row.isHidden();
    } catch {
      return false;
    }
  }

  async verifyRowExists(name: string, timeout: number = TestTimeouts.DEFAULT): Promise<boolean> {
    try {
      const row = this._row.filter({ hasText: name });
      await row.waitFor({ state: 'visible', timeout });
      return await row.isVisible();
    } catch {
      return false;
    }
  }

  async waitForFilterApplied(): Promise<void> {
    await this._closeFilterLabelGroup.waitFor({
      state: 'visible',
      timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
    });
  }
}
