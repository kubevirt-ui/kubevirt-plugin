import { pollUntil } from '@/utils/poll-until';
import { TestTimeouts } from '@/utils/test-config';
import type { Locator, Page } from '@playwright/test';

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
    const filterDropdownButton = this.testId('filter-dropdown-toggle').locator('button');
    await this.robustClick(filterDropdownButton);
  }

  async clickManageColumns(): Promise<void> {
    await this.robustClick(this.testId('manage-columns'));
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
    const itemFilter = this.testId('item-filter');
    await itemFilter.clear();
    await itemFilter.fill(name);
    await itemFilter.press('Tab');
    await this.page.waitForTimeout(TestTimeouts.UI_VISIBILITY_QUICK);
  }

  /** Template catalog / wizard Template step keyword filter. */
  async filterCatalogByText(text: string): Promise<void> {
    const scope = this.catalogFilterScope();
    const input = scope
      .getByRole('textbox', { name: /Filter by keyword|Filter by name/i })
      .or(scope.locator('#filter-text-input input, [data-test="search-catalog"] input'))
      .or(this.page.getByRole('textbox', { name: /Filter by keyword|Filter by name/i }))
      .or(this.locator('#filter-text-input input, [data-test="search-catalog"] input'))
      .first();
    await input.waitFor({ state: 'visible', timeout: TestTimeouts.LONG_OPERATION });
    await input.click();
    await input.press('ControlOrMeta+A').catch(() => undefined);
    // Controlled React inputs often ignore fill() — type so the catalog filter re-renders tiles.
    await input.pressSequentially(text, { delay: 15 });
  }

  /**
   * Ensure OS/workload filter panel is available. Wizard Template step and legacy
   * Template catalog keep filters visible; InstanceTypes may need a Filter toggle.
   */
  async openCatalogFilterPanelIfClosed(panelMarker: Locator): Promise<void> {
    if (await panelMarker.isVisible().catch(() => false)) {
      return;
    }
    if (await this.catalogFilterScope().isVisible().catch(() => false)) {
      return;
    }
    const filterBtn = this.page.getByRole('button', { name: /^Filter$/i });
    if (await filterBtn.isVisible().catch(() => false)) {
      await this.robustClick(filterBtn);
    }
  }

  async setCatalogCheckboxFilter(testId: string, checked: boolean): Promise<void> {
    // Wizard Template step: data-test / id use camelCase prefix + lowercase suffix
    // (e.g. osName-rhel, #filter-osName-rhel). Specs may pass osName-RHEL / osName-Windows.
    const normalized = testId.replace(/^(osName|workload)-(.+)$/i, (_, prefix: string, suffix: string) => {
      const p = /^osName$/i.test(prefix) ? 'osName' : 'workload';
      return `${p}-${suffix.toLowerCase()}`;
    });
    const suffix = normalized.includes('-') ? normalized.split('-').slice(1).join('-') : normalized;
    const scope = this.catalogFilterScope();
    const box = scope
      .locator(`#filter-${normalized}, #filter-${testId}`)
      .or(
        scope
          .locator(`[data-test="${normalized}"], [data-test="${testId}"]`)
          .locator('input[type="checkbox"]'),
      )
      .or(scope.getByTestId(normalized).locator('input[type="checkbox"]'))
      .or(scope.getByTestId(testId).locator('input[type="checkbox"]'))
      .or(scope.getByRole('checkbox', { name: new RegExp(`^${suffix}$`, 'i') }))
      .first();
    const visible = await box
      .waitFor({ state: 'visible', timeout: TestTimeouts.ELEMENT_WAIT })
      .then(() => true)
      .catch(() => false);
    if (!visible) {
      throw new Error(`Template catalog filter "${testId}" should be visible in the filter panel`);
    }
    if (checked) {
      await box.check({ force: true });
    } else {
      await box.uncheck({ force: true });
    }
    // The tile list follows the checkbox state; a swallowed check leaves the catalog unfiltered.
    await pollUntil(
      async () => {
        const isChecked = await box.isChecked().catch(() => null);
        return isChecked === null || isChecked === checked;
      },
      {
        message: `Template catalog filter "${testId}" should be ${checked ? 'checked' : 'unchecked'}`,
        timeout: TestTimeouts.ELEMENT_WAIT,
      },
    );
  }

  private catalogFilterScope(): Locator {
    return this.page
      .locator('.vm-creation-wizard')
      .or(this.page.getByRole('tabpanel', { name: /Template catalog/i }))
      .or(this.page.locator('main'));
  }

  async saveColumns(): Promise<void> {
    await this.robustClick(this.testId('save-button'));
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
