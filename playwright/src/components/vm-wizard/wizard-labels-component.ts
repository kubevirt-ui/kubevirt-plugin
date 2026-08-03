/**
 * Component for wizard-specific labels interactions: required labels drawer
 * and the Labels and Annotations customization tab.
 */

import BaseComponent from '@/components/shared/base-component';
import { TestTimeouts } from '@/utils/test-config';
import type { Page } from '@playwright/test';

type LabelEntry = { key: string; value: string };

export default class WizardLabelsComponent extends BaseComponent {
  private readonly _drawerCloseButton = this.locator('[data-test="required-labels-drawer-close"]');
  private readonly _drawerPanel = this.locator('[data-test="required-labels-drawer"]');
  private readonly _labelsTable = this.locator('[data-test="labels-card-table"]');
  private readonly _saveAsDefaultsCheckbox = this.locator('#save-as-defaults');
  private readonly _tabPanel = this.locator('[role="tabpanel"]');

  constructor(page: Page) {
    super(page);
  }

  async closeRequiredLabelsDrawer(): Promise<void> {
    await this.robustClick(this._drawerCloseButton);
    await this._drawerPanel.waitFor({
      state: 'hidden',
      timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
    });
  }

  async fillDrawerLabelValue(key: string, value: string): Promise<void> {
    await this._drawerPanel.waitFor({ state: 'visible', timeout: 30000 });
    const row = this._drawerPanel.locator(`[data-test="label-row-${key}"]`);
    await row.waitFor({ state: 'visible', timeout: 15000 });
    const valueCell = row.locator('.pf-v6-l-grid__item').nth(1);
    const input = valueCell.locator('input');

    const isAlreadyEditing = await input.isVisible().catch(() => false);
    if (!isAlreadyEditing) {
      const editButton = valueCell.locator('button[aria-label^="Edit value for"]');
      await this.robustClick(editButton);
      await this.page.waitForTimeout(TestTimeouts.UI_DELAY_SHORT);
    }

    await input.clear();
    await input.fill(value);

    const confirmButton = valueCell.locator('button[aria-label="Confirm"]');
    await this.robustClick(confirmButton);
    await this.page.waitForTimeout(TestTimeouts.UI_DELAY_MEDIUM);
  }

  async getDrawerLabelRows(): Promise<LabelEntry[]> {
    return this._drawerPanel.locator('[data-test^="label-row-"]').evaluateAll((grids) =>
      grids.reduce<Array<{ key: string; value: string }>>((acc, grid) => {
        const cells = grid.querySelectorAll('.pf-v6-l-grid__item');
        if (cells.length < 2) return acc;

        const key = cells[0]?.textContent?.trim() || '';
        const value = cells[1]?.textContent?.trim() || '';
        if (key && key !== 'Key') acc.push({ key, value });
        return acc;
      }, []),
    );
  }

  async getLabelsTabEntries(): Promise<LabelEntry[]> {
    const table = this._tabPanel.locator('[data-test="labels-card-table"]');
    await table.waitFor({ state: 'visible', timeout: TestTimeouts.UI_ELEMENT_VISIBILITY });

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

  async isLabelKeyDeletable(key: string): Promise<boolean> {
    const deleteButton = this._tabPanel.locator(`[data-test="delete-labels-${key}"]`);
    const isVisible = await deleteButton
      .isVisible({ timeout: TestTimeouts.UI_DELAY_MEDIUM })
      .catch(() => false);
    if (!isVisible) return false;
    return !(await deleteButton.isDisabled());
  }

  async isLabelValueEditable(key: string): Promise<boolean> {
    const editButton = this._tabPanel.locator(`[data-test="edit-labels-${key}"]`);
    return editButton.isVisible({ timeout: TestTimeouts.UI_DELAY_MEDIUM }).catch(() => false);
  }

  async isRequiredLabelsDrawerOpen(): Promise<boolean> {
    return this._drawerPanel
      .waitFor({ state: 'visible', timeout: 30000 })
      .then(() => true)
      .catch(() => false);
  }

  /** Waits for the required labels drawer panel to become visible. */
  async waitForDrawerVisible(): Promise<void> {
    await this._drawerPanel.waitFor({ state: 'visible', timeout: 30000 });
  }

  /** Waits for the required labels drawer panel to become hidden. */
  async waitForDrawerHidden(): Promise<void> {
    await this._drawerPanel.waitFor({ state: 'hidden', timeout: 10000 });
  }

  async toggleSaveAsDefaults(checked: boolean): Promise<void> {
    const isChecked = await this._saveAsDefaultsCheckbox.isChecked();
    if (isChecked !== checked) {
      await this._saveAsDefaultsCheckbox.click();
    }
  }
}
