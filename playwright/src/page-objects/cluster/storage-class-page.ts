// StorageClassPage — Page object for storage class interactions.

import PageCommons from '@/page-objects/page-commons';
import { TestTimeouts } from '@/utils/test-config';
import type { Page } from '@playwright/test';

export default class StorageClassPage extends PageCommons {
  private readonly _tableRows = this.page.getByRole('row');

  constructor(page: Page) {
    super(page);
  }

  async navigateToStorageClassesViaUI(): Promise<void> {
    try {
      const storageNavSection = this.locator('[data-test-id="storage-nav-item"]');
      const storageVisible = await storageNavSection
        .isVisible({ timeout: TestTimeouts.RETRY_DELAY })
        .catch(() => false);

      if (storageVisible) {
        await storageNavSection.click();
        const scItem = this.locator(
          '[data-test-id="storageclasses-nav-item"], a[href*="storageclasses"]',
        ).first();
        await scItem.waitFor({ state: 'visible', timeout: TestTimeouts.UI_ELEMENT_VISIBILITY });
        await scItem.click();
        await this.page.waitForURL(/storageclasses/i, { timeout: TestTimeouts.NAVIGATION });
        await this._tableRows
          .nth(1)
          .waitFor({ state: 'visible', timeout: TestTimeouts.NAVIGATION });
        await this.waitForLoadingComplete(TestTimeouts.UI_DELAY_EXTRA);
        return;
      }
    } catch {
      // fallback to URL navigation
    }

    await this.goTo('/k8s/cluster/storageclasses');
    await this._tableRows.nth(1).waitFor({ state: 'visible', timeout: TestTimeouts.NAVIGATION });
    await this.waitForLoadingComplete(TestTimeouts.UI_DELAY_EXTRA);
  }

  async navigateToStorageClasses(): Promise<void> {
    await this.navigateToStorageClassesViaUI();
  }

  async clickRowKebabAction(scName: string, actionName: string, retries = 3): Promise<void> {
    for (let attempt = 1; attempt <= retries; attempt++) {
      await this._tableRows.nth(1).waitFor({ state: 'visible', timeout: TestTimeouts.NAVIGATION });

      const row = this._tableRows.filter({ hasText: scName });
      const kebab = row
        .locator('[data-test="actions-dropdown"]')
        .getByRole('button')
        .or(row.getByRole('button', { name: 'Actions' }))
        .first();
      await kebab.waitFor({ state: 'visible', timeout: TestTimeouts.UI_ELEMENT_VISIBILITY });
      await kebab.click();

      const action = this.locator(`[data-test-action="${actionName}"]`);
      const visible = await action
        .waitFor({ state: 'visible', timeout: TestTimeouts.UI_DELAY_MEDIUM })
        .then(
          () => true,
          () => false,
        );

      if (!visible) {
        await this.page.keyboard.press('Escape');
        continue;
      }

      const isDisabled = await action.evaluate(
        (el) =>
          el.classList.contains('pf-m-disabled') || el.getAttribute('aria-disabled') === 'true',
      );
      if (isDisabled) {
        await this.page.keyboard.press('Escape');
        throw new Error(`clickRowKebabAction: "${actionName}" is disabled for "${scName}"`);
      }

      await Promise.all([this.page.waitForLoadState('domcontentloaded'), action.click()]);
      await this._tableRows.nth(1).waitFor({ state: 'visible', timeout: TestTimeouts.NAVIGATION });
      return;
    }
    throw new Error(
      `clickRowKebabAction: could not click "${actionName}" for "${scName}" after ${retries} attempts`,
    );
  }

  async setAsDefault(scName: string): Promise<void> {
    await this.clickRowKebabAction(scName, 'Set as default');
  }

  async verifyDefaultLabel(scName: string): Promise<boolean> {
    const label = this._tableRows.filter({ hasText: scName }).getByText('Default');
    return label
      .waitFor({ state: 'visible', timeout: TestTimeouts.ELEMENT_WAIT })
      .then(() => true)
      .catch(() => false);
  }
}
