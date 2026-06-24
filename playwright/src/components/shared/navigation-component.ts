// NavigationComponent — UI component for navigation interactions.

import BaseComponent from '@/components/shared/base-component';
import { TestTimeouts } from '@/utils/test-config';
import { waitForCondition } from '@/utils/wait-helpers';
import type { Page } from '@playwright/test';

export default class NavigationComponent extends BaseComponent {
  private readonly _clusterOverviewNavItem = this.locator(
    '[data-test-id="cluster-overview-nav-item"]',
  );
  private readonly _perspectiveSwitcherToggle = this.locator(
    '[data-test-id="perspective-switcher-toggle"]',
  );
  private readonly _perspectiveSwitcherMenuOption = this.locator(
    '[data-test-id="perspective-switcher-menu-option"]',
  );

  constructor(page: Page) {
    super(page);
  }

  protected async clickSidebarNavItem(
    navLocator: ReturnType<typeof this.locator>,
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

  async clickNavVirtualMachines(): Promise<void> {
    await this.expandVirtualizationNavSection();
    await this.clickSidebarNavItem(
      this.locator('[data-test-id="virtualmachines-nav-item"]'),
      /virtualmachine/i,
    );
  }

  async clickNavTemplates(): Promise<void> {
    await this.expandVirtualizationNavSection();
    await this.clickSidebarNavItem(
      this.locator('[data-test-id="templates-nav-item"]'),
      /templates/i,
    );
  }

  async clickNavInstanceTypes(): Promise<void> {
    await this.expandVirtualizationNavSection();
    await this.clickSidebarNavItem(
      this.locator('[data-test-id="virtualmachineclusterinstancetypes-nav-item"]'),
      /instancetype/i,
    );
  }

  async clickNavBootableVolumes(): Promise<void> {
    await this.expandVirtualizationNavSection();
    await this.clickSidebarNavItem(
      this.locator('[data-test-id="bootablevolumes-nav-item"]'),
      /bootablevolumes/i,
    );
  }

  async clickNavMigrationPolicies(): Promise<void> {
    await this.expandVirtualizationNavSection();
    await this.clickSidebarNavItem(
      this.locator('[data-test-id="migrationpolicies-nav-item"]'),
      /migrations/i,
    );
  }

  async clickNavCheckups(): Promise<void> {
    await this.expandVirtualizationNavSection();
    await this.clickSidebarNavItem(
      this.locator('[data-test-id="virtualization-checkups-nav-item"]'),
      /checkups/i,
    );
  }

  async clickNavVirtualizationOverview(): Promise<void> {
    await this.expandVirtualizationNavSection();
    await this.clickSidebarNavItem(this._clusterOverviewNavItem, /dashboards|overview/i);
  }

  async clickNavSettings(): Promise<void> {
    await this.expandVirtualizationNavSection();
    await this.clickSidebarNavItem(
      this.locator('[data-test-id="virtualization-settings-nav-item"]'),
      /settings/i,
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

  async switchToVirtualizationPerspective(): Promise<void> {
    const toggle = this._perspectiveSwitcherToggle;
    const toggleVisible = await toggle
      .isVisible({ timeout: TestTimeouts.RETRY_DELAY })
      .catch(() => false);
    if (!toggleVisible) return;

    const currentText = (await toggle.textContent().catch(() => '')) ?? '';
    if (currentText.toLowerCase().includes('virtualization')) return;

    await this.robustClick(toggle);

    const virtOption = this._perspectiveSwitcherMenuOption.filter({
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

  async navigateToRoot(): Promise<void> {
    await this.goTo('/');
    await this.page.waitForLoadState('domcontentloaded');
  }

  async clickBreadcrumbItem(text: string): Promise<void> {
    const breadcrumb = this.locator('[aria-label="Breadcrumb"]').filter({ hasText: text });
    const link = breadcrumb.locator('a').first();
    await this.robustClick(link);
  }

  async waitForUrlContains(
    urlString: string,
    timeout: number = TestTimeouts.NAVIGATION,
  ): Promise<boolean> {
    return await waitForCondition(
      async () => this.page.url().includes(urlString),
      timeout,
      TestTimeouts.POLLING_INTERVAL,
    );
  }

  async isNavCollapsed(timeout = TestTimeouts.NAVIGATION): Promise<boolean> {
    const sidebar = this.locator('.pf-v6-c-page__sidebar');
    try {
      await waitForCondition(
        async () => {
          const cls = (await sidebar.getAttribute('class')) ?? '';
          return cls.includes('pf-m-collapsed');
        },
        timeout,
        TestTimeouts.POLLING_INTERVAL,
      );
      return true;
    } catch {
      return false;
    }
  }

  async isNavExpanded(timeout = TestTimeouts.NAVIGATION): Promise<boolean> {
    const sidebar = this.locator('.pf-v6-c-page__sidebar');
    try {
      await waitForCondition(
        async () => {
          const cls = (await sidebar.getAttribute('class')) ?? '';
          return !cls.includes('pf-m-collapsed');
        },
        timeout,
        TestTimeouts.POLLING_INTERVAL,
      );
      return true;
    } catch {
      return false;
    }
  }

  async clickNavToggle(): Promise<void> {
    const toggle = this.locator('#nav-toggle');
    await toggle.waitFor({ state: 'visible', timeout: TestTimeouts.UI_ELEMENT_VISIBILITY });
    await this.robustClick(toggle);
  }
}
