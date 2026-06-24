// PerspectiveComponent — UI component for perspective interactions.

import BaseComponent from '@/components/shared/base-component';
import { TestTimeouts } from '@/utils/test-config';
import type { Page } from '@playwright/test';

export default class PerspectiveComponent extends BaseComponent {
  private readonly _perspectiveSwitcherToggle = this.locator(
    '[data-test-id="perspective-switcher-toggle"]',
  );
  private readonly _perspectiveSwitcherMenuOption = this.locator(
    '[data-test-id="perspective-switcher-menu-option"]',
  );

  constructor(page: Page) {
    super(page);
  }

  async openPerspectiveDropdown(): Promise<void> {
    const perspectiveDropdown = this.locator('[data-tour-id="tour-perspective-dropdown"]');
    await perspectiveDropdown.waitFor({
      state: 'visible',
      timeout: TestTimeouts.UI_VISIBILITY_QUICK,
    });
    await this.robustClick(perspectiveDropdown);
  }

  async switchToPerspective(perspectiveName: string): Promise<void> {
    await this.openPerspectiveDropdown();
    const perspectiveOption = this._perspectiveSwitcherMenuOption.filter({
      has: this.locator('.pf-v6-c-menu__item-text', {
        hasText: new RegExp(`^${perspectiveName}$`, 'i'),
      }),
    });
    await perspectiveOption.waitFor({
      state: 'visible',
      timeout: TestTimeouts.UI_VISIBILITY_QUICK,
    });
    await this.robustClick(perspectiveOption);
  }

  async switchToAdministratorPerspective(): Promise<void> {
    await this.switchToPerspective('Core Platform');
  }

  async isPerspectiveOptionVisible(perspectiveName: string): Promise<boolean> {
    await this.openPerspectiveDropdown();
    const option = this._perspectiveSwitcherMenuOption.filter({
      has: this.locator('.pf-v6-c-menu__item-text', {
        hasText: new RegExp(`^${perspectiveName}$`, 'i'),
      }),
    });
    const visible = await option.isVisible().catch(() => false);
    await this.page.keyboard.press('Escape');
    return visible;
  }

  async getPerspectiveSwitcherText(timeout = TestTimeouts.UI_VISIBILITY_QUICK): Promise<string> {
    const toggle = this._perspectiveSwitcherToggle;
    await toggle.waitFor({ state: 'visible', timeout });
    return (await toggle.textContent())?.trim() ?? '';
  }

  async getPerspectiveSwitcherOptionText(perspectiveName: string): Promise<null | string> {
    const toggle = this._perspectiveSwitcherToggle;
    await toggle.waitFor({ state: 'visible', timeout: TestTimeouts.UI_VISIBILITY_QUICK });
    await toggle.click();

    const option = this._perspectiveSwitcherMenuOption.filter({
      has: this.locator('.pf-v6-c-menu__item-text', {
        hasText: new RegExp(`^${perspectiveName}$`, 'i'),
      }),
    });

    const visible = await option.isVisible().catch(() => false);
    const text = visible
      ? (await option.locator('.pf-v6-c-menu__item-text').textContent())?.trim() ?? null
      : null;

    await this.page.keyboard.press('Escape');
    return text;
  }
}
