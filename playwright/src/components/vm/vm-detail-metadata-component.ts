/**
 * Component for the VM detail Configuration > Metadata tab interactions.
 */

import BaseComponent from '@/components/shared/base-component';
import { TestTimeouts } from '@/utils/test-config';
import type { Page } from '@playwright/test';

type LabelEntry = { key: string; value: string };

export default class VmDetailMetadataComponent extends BaseComponent {
  private readonly _advancedViewToggle = this.testId('advanced-view-toggle');
  private readonly _labelsCard = this.testId('labels-card');
  private readonly _labelsTable = this.locator('[data-test="labels-card-table"]');

  constructor(page: Page) {
    super(page);
  }

  async clickDeleteLabel(key: string): Promise<void> {
    const button = this.testId(`delete-labels-${key}`);
    await this.robustClick(button);
  }

  async clickEditLabel(key: string): Promise<void> {
    const button = this.testId(`edit-labels-${key}`);
    await this.robustClick(button);
  }

  async getAnnotationsTableEntries(): Promise<LabelEntry[]> {
    const table = this.locator('[data-test="annotations-card-table"]');
    const isVisible = await table
      .isVisible({ timeout: TestTimeouts.UI_DELAY_MEDIUM })
      .catch(() => false);
    if (!isVisible) return [];

    return table.locator('tbody tr').evaluateAll((rows) =>
      rows.reduce<Array<{ key: string; value: string }>>((acc, row) => {
        const cells = row.querySelectorAll('td');
        const key = cells[0]?.textContent?.trim() || '';
        const value = cells[1]?.textContent?.trim() || '';
        if (key) acc.push({ key, value });
        return acc;
      }, []),
    );
  }

  async getLabelsTableEntries(): Promise<LabelEntry[]> {
    await this._labelsTable.waitFor({
      state: 'visible',
      timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
    });

    return this._labelsTable.locator('tbody tr').evaluateAll((rows) =>
      rows.reduce<Array<{ key: string; value: string }>>((acc, row) => {
        const cells = row.querySelectorAll('td');
        const rawKey = cells[0]?.textContent?.trim() || '';
        const key = rawKey.replace(/Auto-applied$/, '').trim();
        const value = cells[1]?.textContent?.trim() || '';
        if (key) acc.push({ key, value });
        return acc;
      }, []),
    );
  }

  async isAdvancedViewToggleVisible(): Promise<boolean> {
    return this._advancedViewToggle
      .isVisible({ timeout: TestTimeouts.UI_DELAY_MEDIUM })
      .catch(() => false);
  }

  async isLabelDeletable(key: string): Promise<boolean> {
    const button = this.testId(`delete-labels-${key}`);
    const isVisible = await button
      .isVisible({ timeout: TestTimeouts.UI_DELAY_MEDIUM })
      .catch(() => false);
    if (!isVisible) return false;
    return !(await button.isDisabled());
  }

  async isLabelEditable(key: string): Promise<boolean> {
    const button = this.testId(`edit-labels-${key}`);
    return button.isVisible({ timeout: TestTimeouts.UI_DELAY_MEDIUM }).catch(() => false);
  }

  async toggleAdvancedView(): Promise<void> {
    await this.robustClick(this._advancedViewToggle);
    await this.page.waitForTimeout(TestTimeouts.UI_DELAY_MEDIUM);
  }
}
