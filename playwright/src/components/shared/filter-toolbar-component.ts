// Generic filter toolbar interaction component. Encapsulates the common pattern of opening filter dropdowns, selecting items, toggling row filters, and clearing applied filters.

import BaseComponent from '@/components/shared/base-component';
import { TestTimeouts } from '@/utils/test-config';
import type { Locator, Page } from '@playwright/test';

export default class FilterToolbarComponent extends BaseComponent {
  private readonly _toolbar = this.locator('#filter-toolbar');
  private readonly _clearAllFiltersButton = this.locator('button:has-text("Clear all filters")');
  private readonly _closeFilterLabelGroup = this.locator('button[aria-label="Close label group"]');

  constructor(page: Page) {
    super(page);
  }

  async openFilterButton(label: string): Promise<void> {
    const button = this._toolbar.locator('button', { hasText: label }).first();
    await button.waitFor({ state: 'visible', timeout: TestTimeouts.UI_ELEMENT_VISIBILITY });
    await this.robustClick(button);
  }

  async selectMenuItem(text: string, options?: { force?: boolean }): Promise<void> {
    const item = this.page
      .locator('[role="menuitem"], #checkbox-select li')
      .filter({ hasText: text })
      .first();
    if (options?.force) {
      await item.click({ force: true });
    } else {
      await item.waitFor({ state: 'visible', timeout: TestTimeouts.UI_ELEMENT_VISIBILITY });
      await item.click();
    }
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

  async clearAllFilters(): Promise<void> {
    await this.robustClick(this._clearAllFiltersButton);
  }

  async tryClearAllFilters(): Promise<boolean> {
    try {
      const isVisible = await this._clearAllFiltersButton.isVisible();
      if (isVisible) {
        await this.robustClick(this._clearAllFiltersButton);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }

  async closeFilterChip(): Promise<void> {
    await this._closeFilterLabelGroup.waitFor({
      state: 'visible',
      timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
    });
    await this._closeFilterLabelGroup.click();
  }

  async waitForFilterApplied(): Promise<void> {
    await this._closeFilterLabelGroup.waitFor({
      state: 'visible',
      timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
    });
  }

  async fillFilterInput(locator: Locator, value: string): Promise<void> {
    await locator.clear();
    await locator.fill(value);
    await locator.press('Enter');
    await this.page.waitForTimeout(TestTimeouts.UI_DELAY_SHORT);
  }

  async isFilterToolbarVisible(timeout = TestTimeouts.UI_ELEMENT_VISIBILITY): Promise<boolean> {
    return this._toolbar
      .waitFor({ state: 'visible', timeout })
      .then(() => true)
      .catch(() => false);
  }
}
