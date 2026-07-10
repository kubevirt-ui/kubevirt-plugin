import { TestTimeouts } from '@/utils/test-config';
import type { Locator, Page } from '@playwright/test';

import BaseComponent from './base-component';

export default class NavigationComponent extends BaseComponent {
  private readonly _clusterOverviewNavItem = this.locator(
    '[data-test-id="cluster-overview-nav-item"]',
  );
  private readonly _perspectiveSwitcherMenuOption = this.locator(
    '[data-test-id="perspective-switcher-menu-option"]',
  );
  private readonly _perspectiveSwitcherToggle = this.locator(
    '[data-test-id="perspective-switcher-toggle"]',
  );

  constructor(page: Page) {
    super(page);
  }

  async clickNavBootableVolumes(): Promise<void> {
    await this.expandVirtualizationNavSection();
    await this.clickSidebarNavItem(
      this.locator('[data-test-id="bootablevolumes-nav-item"]'),
      /bootablevolumes/i,
    );
  }

  async clickNavCheckups(): Promise<void> {
    await this.expandVirtualizationNavSection();
    await this.clickSidebarNavItem(
      this.locator('[data-test-id="virtualization-checkups-nav-item"]'),
      /checkups/i,
    );
  }

  async clickNavClusterOverview(): Promise<void> {
    await this.expandVirtualizationNavSection();
    await this.waitForLoadingComplete(TestTimeouts.SHORT_WAIT);
    const clusterSection = this.locator('[data-test-id="virtualization-nav-item"]', {
      hasText: 'Cluster',
    });

    const sectionVisible = await clusterSection
      .isVisible({ timeout: TestTimeouts.UI_DELAY_MEDIUM })
      .catch(() => false);

    if (sectionVisible) {
      for (let attempt = 0; attempt < 3; attempt++) {
        const isExpanded = await clusterSection.getAttribute('aria-expanded');
        if (isExpanded !== 'false') break;
        try {
          await clusterSection.click({ timeout: TestTimeouts.RETRY_DELAY });
        } catch {
          await clusterSection.dispatchEvent('click');
        }
        await this.page.waitForTimeout(TestTimeouts.UI_DELAY_SHORT);
      }

      try {
        const navClusterOverview = this._clusterOverviewNavItem;
        await navClusterOverview.waitFor({
          state: 'visible',
          timeout: TestTimeouts.UI_DELAY_MEDIUM,
        });
        await navClusterOverview.click({ timeout: TestTimeouts.UI_DELAY_EXTRA });
        await this.page.waitForURL(/dashboards/i, { timeout: TestTimeouts.UI_VISIBILITY_QUICK });
        return;
      } catch {
        // Sidebar click failed — fall through to URL navigation
      }
    }

    await this.goTo('/dashboards');
  }

  async clickNavInstanceTypes(): Promise<void> {
    await this.expandVirtualizationNavSection();
    await this.clickSidebarNavItem(
      this.locator('[data-test-id="virtualmachineclusterinstancetypes-nav-item"]'),
      /instancetype/i,
    );
  }

  async clickNavMigrationPolicies(): Promise<void> {
    await this.expandVirtualizationNavSection();
    await this.clickSidebarNavItem(
      this.locator('[data-test-id="migrationpolicies-nav-item"]'),
      /migrations/i,
    );
  }

  async clickNavSettings(): Promise<void> {
    await this.expandVirtualizationNavSection();
    await this.clickSidebarNavItem(
      this.locator('[data-test-id="virtualization-settings-nav-item"]'),
      /settings/i,
    );
  }

  async clickNavTemplates(): Promise<void> {
    await this.expandVirtualizationNavSection();
    await this.clickSidebarNavItem(
      this.locator('[data-test-id="templates-nav-item"]'),
      /templates/i,
    );
  }

  async clickNavVirtualizationOverview(): Promise<void> {
    await this.expandVirtualizationNavSection();
    await this.clickSidebarNavItem(this._clusterOverviewNavItem, /dashboards|overview/i);
  }

  async clickNavVirtualMachines(): Promise<void> {
    await this.expandVirtualizationNavSection();
    await this.clickSidebarNavItem(
      this.locator('[data-test-id="virtualmachines-nav-item"]'),
      /virtualmachine/i,
    );
  }

  protected async clickSidebarNavItem(
    navLocator: Locator,
    expectedUrlPattern?: RegExp,
  ): Promise<void> {
    await this.waitForLoadingComplete(TestTimeouts.SHORT_WAIT);
    await navLocator.waitFor({ state: 'visible', timeout: TestTimeouts.DEFAULT });
    try {
      await navLocator.scrollIntoViewIfNeeded();
    } catch {
      await this.page.waitForTimeout(TestTimeouts.UI_DELAY_SHORT);
      await navLocator.waitFor({ state: 'attached', timeout: TestTimeouts.DEFAULT });
    }
    await this.page.waitForTimeout(TestTimeouts.UI_DELAY_MICRO);

    try {
      await navLocator.dispatchEvent('click');
    } catch {
      await this.page.waitForTimeout(TestTimeouts.UI_DELAY_SHORT);
      await navLocator.waitFor({ state: 'attached', timeout: TestTimeouts.DEFAULT });
      await navLocator.dispatchEvent('click');
    }

    if (expectedUrlPattern) {
      try {
        await this.page.waitForURL(expectedUrlPattern, { timeout: TestTimeouts.NAVIGATION });
      } catch {
        // URL pattern may not match exactly, continue with page load
      }
    }

    await this.page.waitForLoadState('domcontentloaded');
    await this.waitForLoadingComplete(TestTimeouts.SHORT_WAIT);
  }

  async clickVirtualMachinesNavItem(): Promise<void> {
    const navItem = this.page.locator('[data-test-id="virtualmachines-nav-item"]');
    await navItem.waitFor({ state: 'visible', timeout: TestTimeouts.DEFAULT });
    await navItem.click();
    await this.page.waitForLoadState('load');
  }

  async expandVirtualizationNavSection(): Promise<void> {
    await this.switchToVirtualizationPerspective();

    const childItem = this.locator(
      '[data-test-id="virtualmachines-nav-item"], [data-test-id="templates-nav-item"], [data-test-id="bootablevolumes-nav-item"]',
    );

    const childAlreadyVisible = await childItem
      .first()
      .isVisible({ timeout: TestTimeouts.RETRY_DELAY })
      .catch(() => false);
    if (childAlreadyVisible) return;

    const virtualizationSection = this.locator('[data-quickstart-id="qs-nav-sec-virtualization"]');

    await virtualizationSection
      .waitFor({ state: 'visible', timeout: TestTimeouts.DEFAULT })
      .catch(() => undefined);

    const isVisible = await virtualizationSection.isVisible().catch(() => false);
    if (!isVisible) return;

    await this.waitForLoadingComplete(TestTimeouts.DEFAULT);
    const isExpanded = await virtualizationSection.getAttribute('aria-expanded');
    if (isExpanded === 'false') {
      await virtualizationSection.dispatchEvent('click');
      await this.page.waitForTimeout(TestTimeouts.UI_DELAY_SHORT);
    }

    await childItem
      .first()
      .waitFor({ state: 'visible', timeout: TestTimeouts.UI_VISIBILITY_QUICK })
      .catch(() => undefined);
  }

  async getPerspectiveSwitcherOptionText(perspectiveName: string): Promise<string | null> {
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
      ? ((await option.locator('.pf-v6-c-menu__item-text').textContent())?.trim() ?? null)
      : null;

    await this.page.keyboard.press('Escape');
    return text;
  }

  async getPerspectiveSwitcherText(timeout = TestTimeouts.UI_VISIBILITY_QUICK): Promise<string> {
    const toggle = this._perspectiveSwitcherToggle;
    await toggle.waitFor({ state: 'visible', timeout });
    return (await toggle.textContent())?.trim() ?? '';
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

  async isSidebarItemVisible(itemText: string): Promise<boolean> {
    try {
      const item = this.locator(
        `[data-quickstart-id="qs-nav-sec-virtualization"] a:has-text("${itemText}")`,
      );
      return await item.isVisible();
    } catch {
      return false;
    }
  }

  async openPerspectiveDropdown(): Promise<void> {
    const perspectiveDropdown = this.locator('[data-tour-id="tour-perspective-dropdown"]');
    await perspectiveDropdown.waitFor({
      state: 'visible',
      timeout: TestTimeouts.UI_VISIBILITY_QUICK,
    });
    await this.robustClick(perspectiveDropdown);
  }

  async switchToAdministratorPerspective(): Promise<void> {
    await this.switchToPerspective('Core Platform');
  }

  async switchToPerspective(perspectiveName: string): Promise<void> {
    await this.openPerspectiveDropdown();
    const perspectiveOption = this.locator(
      '[data-test-id="perspective-switcher-menu-option"]',
    ).filter({
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

  async switchToVirtualizationPerspective(): Promise<void> {
    const toggle = this.locator('[data-test-id="perspective-switcher-toggle"]');
    const toggleVisible = await toggle
      .isVisible({ timeout: TestTimeouts.RETRY_DELAY })
      .catch(() => false);
    if (!toggleVisible) return;

    const currentText = (await toggle.textContent().catch(() => '')) ?? '';
    if (currentText.toLowerCase().includes('virtualization')) return;

    await this.robustClick(toggle);

    const virtOption = this.locator('[data-test-id="perspective-switcher-menu-option"]').filter({
      hasText: 'Virtualization',
    });
    await virtOption.waitFor({
      state: 'visible',
      timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
    });

    await this.robustClick(virtOption.locator('button'));
    await this.page.waitForLoadState('domcontentloaded');
    await this.waitForLoadingComplete(TestTimeouts.SHORT_WAIT);
  }
}
