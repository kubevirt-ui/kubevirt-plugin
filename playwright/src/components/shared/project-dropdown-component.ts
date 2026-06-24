// ProjectDropdownComponent — Namespace/project switcher in the console header.

import BaseComponent from '@/components/shared/base-component';
import { TestTimeouts } from '@/utils/test-config';
import { waitForElementStable } from '@/utils/wait-helpers';
import type { Page } from '@playwright/test';

export default class ProjectDropdownComponent extends BaseComponent {
  private readonly _namespaceDropdownToggle = this.locator(
    '[data-test="namespace-dropdown-menu-toggle"]',
  );
  private readonly _dropdownTextFilter = this.locator('[data-test="dropdown-text-filter"]');
  private readonly _namespaceBarDropdown = this.locator('[data-test-id="namespace-bar-dropdown"]');

  constructor(page: Page) {
    super(page);
  }

  async switchToAllNamespaces(): Promise<void> {
    await this.switchToNamespace('All Projects');
  }

  async switchToNamespace(namespace: string): Promise<void> {
    await this.page.waitForLoadState('domcontentloaded');
    await this.page.waitForLoadState('load');

    const namespaceDropdown = this.locator('[data-test-id="namespace-bar-dropdown"] button');
    const dropdownVisible = await namespaceDropdown
      .isVisible({ timeout: TestTimeouts.UI_DELAY_MEDIUM })
      .catch(() => false);
    if (!dropdownVisible) return;

    const namespaceOption = this.locator('[data-test="dropdown-menu-item-link"]', {
      hasText: namespace,
    });

    const maxAttempts = 3;
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      await namespaceDropdown.waitFor({ state: 'visible', timeout: TestTimeouts.DEFAULT });
      try {
        await namespaceDropdown.click({ timeout: TestTimeouts.UI_DELAY_EXTRA });
      } catch {
        await namespaceDropdown.dispatchEvent('click');
      }

      await this.page.waitForTimeout(TestTimeouts.UI_DELAY_SHORT);

      try {
        const searchInput = this._dropdownTextFilter;
        await searchInput.waitFor({ state: 'visible', timeout: TestTimeouts.UI_DELAY_EXTRA });
        await searchInput.clear();
        await searchInput.pressSequentially(namespace, { delay: 80 });
        await this.page.waitForTimeout(TestTimeouts.RETRY_DELAY);

        await namespaceOption.waitFor({
          state: 'visible',
          timeout: TestTimeouts.UI_VISIBILITY_QUICK,
        });
        await namespaceOption.click({ timeout: TestTimeouts.UI_DELAY_MEDIUM });
        await this.page.waitForLoadState('domcontentloaded');
        await this.waitForLoadingComplete(TestTimeouts.SHORT_WAIT);
        return;
      } catch {
        await this.page.keyboard.press('Escape');
        await this.page.waitForTimeout(TestTimeouts.UI_DELAY_SHORT);
      }
    }
  }

  async switchProject(projectName: string): Promise<void> {
    const namespaceDropdown = this._namespaceBarDropdown.locator('button');
    const isDropdownPresent = await namespaceDropdown
      .isVisible({ timeout: TestTimeouts.UI_DELAY_MEDIUM })
      .catch(() => false);
    if (!isDropdownPresent) return;

    const ns = await namespaceDropdown.textContent();
    if (ns?.includes(projectName)) {
      return;
    }

    const projectItem = this.locator('[data-test="dropdown-menu-item-link"]', {
      hasText: projectName,
    });

    const maxAttempts = 3;
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      try {
        await namespaceDropdown.click({ timeout: TestTimeouts.UI_DELAY_EXTRA });
      } catch {
        await namespaceDropdown.dispatchEvent('click');
      }

      try {
        const searchFilter = this._dropdownTextFilter;
        await searchFilter.waitFor({ state: 'visible', timeout: TestTimeouts.UI_DELAY_EXTRA });
        await searchFilter.clear();
        await searchFilter.pressSequentially(projectName, { delay: 80 });

        await this.page.waitForTimeout(TestTimeouts.RETRY_DELAY);

        await projectItem.waitFor({ state: 'visible', timeout: TestTimeouts.UI_VISIBILITY_QUICK });
        await projectItem.click({ timeout: TestTimeouts.UI_DELAY_MEDIUM });

        await waitForElementStable(this._namespaceBarDropdown, TestTimeouts.UI_ACTION_COMPLETE);
        return;
      } catch {
        await this.page.keyboard.press('Escape');
        await this.page.waitForTimeout(TestTimeouts.UI_DELAY_SHORT);
      }
    }
  }

  async isNamespaceDropdownVisible(): Promise<boolean> {
    try {
      await this._namespaceDropdownToggle.waitFor({
        state: 'visible',
        timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
      });
      return true;
    } catch {
      return false;
    }
  }
}
