import { TestTimeouts } from '@/utils/test-config';
import type { Locator, Page } from '@playwright/test';

import BaseComponent from './base-component';

export default class NavigationComponent extends BaseComponent {
  private readonly _clusterOverviewNavItem = this.testId('cluster-overview-nav-item');
  private readonly _perspectiveSwitcherMenuOption = this.consoleTestId(
    'perspective-switcher-menu-option',
  );
  private readonly _perspectiveSwitcherToggle = this.consoleTestId('perspective-switcher-toggle');

  constructor(page: Page) {
    super(page);
  }

  private async dismissBlockingModals(): Promise<void> {
    const welcomeModal = this.testId('welcome-modal');
    if (await welcomeModal.isVisible().catch(() => false)) {
      const closeBtn = welcomeModal.getByRole('button', { name: 'Close' });
      await closeBtn.click({ force: true }).catch(() => undefined);
      await this.page.waitForTimeout(TestTimeouts.UI_DELAY_SHORT);
    }

    const onboardingPopover = this.testId('onboarding-popover');
    if (await onboardingPopover.isVisible().catch(() => false)) {
      const dismissBtn = this.testId('onboarding-dismiss-btn');
      await dismissBtn.click({ force: true }).catch(() => undefined);
      await this.page.waitForTimeout(TestTimeouts.UI_DELAY_SHORT);
    }
  }

  /**
   * If the sidebar was auto-collapsed (e.g. by useAutoHideNavigation), expand it
   * by clicking the hamburger toggle so nav items become clickable.
   */
  private async ensureSidebarExpanded(): Promise<void> {
    // Wait for any pending requestAnimationFrame collapse to settle.
    await this.page.waitForTimeout(500);

    const isCollapsed = await this.page
      .evaluate(
        () =>
          document.querySelector('.pf-v6-c-page__sidebar')?.classList.contains('pf-m-collapsed') ??
          false,
      )
      .catch(() => false);

    if (!isCollapsed) return;

    const toggleBtn = this.page.locator('#nav-toggle');
    const visible = await toggleBtn.isVisible().catch(() => false);
    if (!visible) return;

    await toggleBtn.click({ force: true }).catch(async () => {
      await toggleBtn.dispatchEvent('click');
    });

    // Wait for pf-m-collapsed to be removed from the sidebar.
    await this.page
      .waitForFunction(
        () =>
          !document.querySelector('.pf-v6-c-page__sidebar')?.classList.contains('pf-m-collapsed'),
        null,
        { timeout: 5_000 },
      )
      .catch(() => undefined);
    await this.page.waitForTimeout(300);
  }

  async clickNavBootableVolumes(): Promise<void> {
    await this.expandVirtualizationNavSection();
    await this.clickSidebarNavItem(this.testId('bootablevolumes-nav-item'), /bootablevolumes/i);
  }

  async clickNavCheckups(): Promise<void> {
    await this.expandVirtualizationNavSection();
    await this.clickSidebarNavItem(this.testId('virtualization-checkups-nav-item'), /checkups/i);
  }

  async clickNavClusterOverview(): Promise<void> {
    await this.expandVirtualizationNavSection();
    await this.waitForLoadingComplete(TestTimeouts.SHORT_WAIT);
    const clusterSection = this.testId('virtualization-nav-item').filter({
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
      this.testId('virtualmachineclusterinstancetypes-nav-item'),
      /instancetype/i,
    );
  }

  async clickNavMigrationPolicies(): Promise<void> {
    await this.expandVirtualizationNavSection();
    await this.clickSidebarNavItem(this.testId('migrationpolicies-nav-item'), /migrations/i);
  }

  async clickNavSettings(): Promise<void> {
    await this.expandVirtualizationNavSection();
    await this.clickSidebarNavItem(this.testId('virtualization-settings-nav-item'), /settings/i);
  }

  async clickNavTemplates(): Promise<void> {
    await this.expandVirtualizationNavSection();
    await this.clickSidebarNavItem(this.testId('templates-nav-item'), /templates/i);
  }

  async clickNavVirtualizationOverview(): Promise<void> {
    await this.expandVirtualizationNavSection();
    await this.clickSidebarNavItem(this._clusterOverviewNavItem, /dashboards|overview/i);
  }

  async clickNavVirtualMachines(): Promise<void> {
    await this.expandVirtualizationNavSection();
    await this.clickSidebarNavItem(this.testId('virtualmachines-nav-item'), /virtualmachine/i);
  }

  protected async clickSidebarNavItem(
    navLocator: Locator,
    expectedUrlPattern?: RegExp,
  ): Promise<void> {
    await this.waitForLoadingComplete(TestTimeouts.SHORT_WAIT);
    await this.ensureSidebarExpanded();

    await navLocator.waitFor({ state: 'visible', timeout: TestTimeouts.DEFAULT });
    await navLocator
      .scrollIntoViewIfNeeded({ timeout: TestTimeouts.UI_DELAY_MEDIUM })
      .catch(() => undefined);
    await this.page.waitForTimeout(TestTimeouts.UI_DELAY_MICRO);

    await navLocator
      .click({ force: true, timeout: TestTimeouts.UI_DELAY_MEDIUM })
      .catch(async () => {
        await navLocator.dispatchEvent('click');
      });

    if (expectedUrlPattern) {
      await this.page
        .waitForURL(expectedUrlPattern, { timeout: TestTimeouts.NAVIGATION })
        .catch(() => undefined);
    }

    await this.page.waitForLoadState('domcontentloaded');
    await this.waitForLoadingComplete(TestTimeouts.SHORT_WAIT);
  }

  async clickVirtualMachinesNavItem(): Promise<void> {
    const navItem = this.page.getByTestId('virtualmachines-nav-item');
    await navItem.waitFor({ state: 'visible', timeout: TestTimeouts.DEFAULT });
    await navItem.click();
    await this.page.waitForLoadState('load');
  }

  async expandVirtualizationNavSection(): Promise<void> {
    await this.switchToVirtualizationPerspective();
    await this.ensureSidebarExpanded();

    const childItem = this.testId('virtualmachines-nav-item')
      .or(this.testId('templates-nav-item'))
      .or(this.testId('bootablevolumes-nav-item'));

    // In the Virtualization perspective, nav items are top-level — wait for them.
    let childVisible = await childItem
      .first()
      .waitFor({ state: 'visible', timeout: TestTimeouts.DEFAULT })
      .then(() => true)
      .catch(() => false);

    // The auto-hide hook fires asynchronously via requestAnimationFrame after React
    // renders the perspective. If nav items aren't visible, the sidebar may have
    // collapsed after our initial check. Wait for React to settle before retrying.
    if (!childVisible) {
      await this.page.waitForTimeout(TestTimeouts.UI_DELAY_SHORT);
      await this.ensureSidebarExpanded();
      childVisible = await childItem
        .first()
        .waitFor({ state: 'visible', timeout: TestTimeouts.DEFAULT })
        .then(() => true)
        .catch(() => false);
    }
    if (childVisible) return;

    // Fallback for Core Platform perspective where Virtualization is a collapsible section.
    const virtualizationSection = this.locator('[data-quickstart-id="qs-nav-sec-virtualization"]');
    const sectionVisible = await virtualizationSection
      .isVisible({ timeout: TestTimeouts.RETRY_DELAY })
      .catch(() => false);
    if (!sectionVisible) return;

    const isExpanded = await virtualizationSection.getAttribute('aria-expanded');
    if (isExpanded === 'false') {
      await virtualizationSection.click().catch(async () => {
        await virtualizationSection.dispatchEvent('click');
      });
      await this.page.waitForTimeout(TestTimeouts.UI_DELAY_SHORT);
    }

    await childItem
      .first()
      .waitFor({ state: 'visible', timeout: TestTimeouts.UI_DELAY_LONG })
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
      const section = this.locator('[data-quickstart-id="qs-nav-sec-virtualization"]');
      const item = section.locator('a').filter({ hasText: itemText });
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
    const perspectiveOption = this.consoleTestId('perspective-switcher-menu-option').filter({
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
    await this.page.waitForLoadState('domcontentloaded').catch(() => undefined);
    await this.dismissBlockingModals();

    const toggle = this.consoleTestId('perspective-switcher-toggle');

    // Wait for the toggle to render (page may still be loading React components).
    let toggleVisible = await toggle
      .waitFor({ state: 'visible', timeout: TestTimeouts.DEFAULT })
      .then(() => true)
      .catch(() => false);

    if (!toggleVisible) {
      const navToggle = this.page.getByRole('button', { name: 'Side navigation toggle' });
      for (let i = 0; i < 3; i++) {
        const hamburgerVisible = await navToggle.isVisible().catch(() => false);
        if (!hamburgerVisible) {
          await this.page.waitForTimeout(TestTimeouts.RETRY_DELAY);
          continue;
        }

        const sidebarAlreadyExpanded = await toggle.isVisible().catch(() => false);
        if (sidebarAlreadyExpanded) {
          toggleVisible = true;
          break;
        }

        await navToggle.click({ force: true }).catch(async () => {
          await navToggle.dispatchEvent('click');
        });

        toggleVisible = await toggle
          .waitFor({ state: 'visible', timeout: TestTimeouts.UI_DELAY_MEDIUM })
          .then(() => true)
          .catch(() => false);
        if (toggleVisible) break;
      }

      if (!toggleVisible) {
        throw new Error('Perspective switcher toggle not visible after expanding sidebar');
      }
    }

    const currentText = (await toggle.textContent().catch(() => '')) ?? '';
    if (currentText.toLowerCase().includes('virtualization')) return;

    const virtOption = this.consoleTestId('perspective-switcher-menu-option').filter({
      hasText: 'Virtualization',
    });

    const maxAttempts = 4;
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      await toggle.click({ force: true, timeout: TestTimeouts.DEFAULT }).catch(async () => {
        await toggle.dispatchEvent('click');
      });
      await this.page.waitForTimeout(TestTimeouts.UI_DELAY_SHORT);

      const menuOpened = await virtOption
        .waitFor({ state: 'visible', timeout: TestTimeouts.UI_DELAY_LONG })
        .then(() => true)
        .catch(() => false);

      if (menuOpened) {
        const innerBtn = virtOption.locator('button').first();
        const hasBtn = await innerBtn.isVisible().catch(() => false);
        const clickTarget = hasBtn ? innerBtn : virtOption;
        await clickTarget.click({ force: true, timeout: TestTimeouts.DEFAULT });
        await this.page.waitForLoadState('domcontentloaded');
        await this.waitForLoadingComplete(TestTimeouts.SHORT_WAIT);
        return;
      }

      await this.page.keyboard.press('Escape').catch(() => undefined);
      await this.page.waitForTimeout(TestTimeouts.RETRY_DELAY);
    }

    throw new Error('Perspective switcher: failed to select Virtualization after 4 attempts');
  }
}
