import type { Locator, Page } from '@playwright/test';

/**
 * Page object for the Virtualization perspective landing page.
 * Injected via the scenarioTest fixture.
 *
 * On localhost the plugin takes a few seconds to register. The perspective
 * switcher must be polled until the "Virtualization" option appears.
 */
export class OverviewPage {
  readonly heading: Locator;
  readonly perspectiveToggle: Locator;

  constructor(private readonly page: Page) {
    this.heading = page.locator('h1').filter({ hasText: 'VirtualMachines' }).first();
    this.perspectiveToggle = page.locator('[data-test-id="perspective-switcher-toggle"]');
  }

  /**
   * Navigate to the console and switch to the Virtualization perspective.
   * Polls the perspective menu until the option registers (plugin load delay).
   */
  async switchToVirtualization(timeout = 30_000): Promise<void> {
    await this.page.goto('/');
    await this.page.waitForLoadState('networkidle');

    const virtOption = this.page
      .locator('[data-test-id="perspective-switcher-menu-option"]')
      .filter({ hasText: 'Virtualization' });

    const deadline = Date.now() + timeout;
    while (Date.now() < deadline) {
      await this.perspectiveToggle.click();
      const visible = await virtOption.isVisible().catch(() => false);
      if (visible) {
        await virtOption.click();
        await this.page.waitForLoadState('networkidle');
        return;
      }
      await this.page.keyboard.press('Escape');
      await this.page.waitForTimeout(2_000);
    }
    throw new Error('Virtualization perspective did not appear within timeout');
  }

  async waitForLoaded(timeout = 30_000): Promise<void> {
    await this.heading.waitFor({ state: 'visible', timeout });
  }
}
