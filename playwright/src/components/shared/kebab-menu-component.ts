// Generic kebab (three-dot) menu interaction component. Encapsulates the common pattern of opening a kebab menu within a row or page-level context and clicking menu items.

import BaseComponent from '@/components/shared/base-component';
import { TestTimeouts } from '@/utils/test-config';
import type { Locator, Page } from '@playwright/test';

export default class KebabMenuComponent extends BaseComponent {
  private readonly _kebabSelectors = [
    '[data-test="kebab-button"]',
    '[data-test-id="kebab-button"]',
    'button.pf-v6-c-menu-toggle.pf-m-plain',
    'button[aria-label="Actions"]',
    'button[aria-label="Kebab toggle"]',
  ].join(', ');

  private readonly _menuDropdown = this.locator(
    '.pf-v6-c-menu__list, .pf-v6-c-dropdown__menu, [role="menu"]',
  );

  constructor(page: Page) {
    super(page);
  }

  async openKebab(scope?: Locator): Promise<void> {
    const container = scope ?? this.page.locator('body');
    const kebab = container.locator(this._kebabSelectors).first();
    await kebab.waitFor({ state: 'visible', timeout: TestTimeouts.UI_ELEMENT_VISIBILITY });
    await this.robustClick(kebab);
    await this._menuDropdown
      .first()
      .waitFor({ state: 'visible', timeout: TestTimeouts.UI_ELEMENT_VISIBILITY });
  }

  async openKebabForRow(rowLocator: Locator): Promise<void> {
    return this.openKebab(rowLocator);
  }

  async clickMenuItemByText(label: string): Promise<void> {
    const item = this._menuDropdown
      .locator(`[role="menuitem"]:has-text("${label}"), button:has-text("${label}")`)
      .first();
    await item.waitFor({ state: 'visible', timeout: TestTimeouts.UI_ELEMENT_VISIBILITY });
    await this.robustClick(item);
  }

  async clickMenuItemByTestId(testId: string): Promise<void> {
    const item = this._menuDropdown.locator(`[data-test-id="${testId}"]`).first();
    await item.waitFor({ state: 'visible', timeout: TestTimeouts.UI_ELEMENT_VISIBILITY });
    await this.robustClick(item);
  }

  async isMenuItemVisible(
    testId: string,
    timeout = TestTimeouts.UI_ELEMENT_VISIBILITY,
  ): Promise<boolean> {
    try {
      const item = this._menuDropdown.locator(`[data-test-id="${testId}"]`).first();
      await item.waitFor({ state: 'visible', timeout });
      return true;
    } catch {
      return false;
    }
  }

  async isMenuItemEnabled(
    testId: string,
    timeout = TestTimeouts.UI_ELEMENT_VISIBILITY,
  ): Promise<boolean> {
    try {
      const item = this._menuDropdown.locator(`[data-test-id="${testId}"]`).first();
      await item.waitFor({ state: 'visible', timeout });
      return await item.isEnabled();
    } catch {
      return false;
    }
  }

  async closeMenu(): Promise<void> {
    await this.page.keyboard.press('Escape');
    await this._menuDropdown
      .first()
      .waitFor({ state: 'hidden', timeout: TestTimeouts.UI_DELAY_MEDIUM })
      .catch(() => undefined);
  }
}
