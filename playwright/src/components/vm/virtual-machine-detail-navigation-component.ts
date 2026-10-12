/**
 * VirtualMachine detail — primary tab and URL navigation helpers.
 */

import BaseComponent from '@/components/shared/base-component';
import { TestTimeouts } from '@/utils/test-config';
import type { Page } from '@playwright/test';

export default class VirtualMachineDetailNavigationComponent extends BaseComponent {
  private readonly _configurationNetworkSubTab = this.testId('vm-configuration-network');
  private readonly _horizontalLinkMetrics = this.testId('horizontal-link-Metrics');
  private readonly _horizontalLinkOverview = this.testId('horizontal-link-Overview');
  private readonly _horizontalLinkSnapshots = this.testId('horizontal-link-Snapshots');

  constructor(page: Page) {
    super(page);
  }

  async isDiagnosticsTabVisible(): Promise<boolean> {
    const byTestId = this.testId('horizontal-link-Diagnostics');
    const byText = this.locator('a[href*="diagnostics"]').filter({ hasText: 'Diagnostics' });
    return await byTestId
      .or(byText)
      .first()
      .isVisible({ timeout: 5000 })
      .catch(() => false);
  }

  async isHorizontalNavbarRoutesPresent(): Promise<boolean> {
    try {
      return await this.locator('#horizontal-navbar-routes').isVisible({
        timeout: TestTimeouts.UI_VISIBILITY_QUICK,
      });
    } catch {
      return false;
    }
  }

  async isTabBarVisibleAfterScroll(): Promise<boolean> {
    try {
      await this._horizontalLinkOverview.waitFor({
        state: 'visible',
        timeout: TestTimeouts.ELEMENT_WAIT,
      });
    } catch {
      return false;
    }

    await this.page.evaluate(() => {
      const scrollable =
        document.querySelector('.pf-v6-c-drawer__content') ??
        document.querySelector('[class*="drawer"] [class*="content"]') ??
        document.documentElement;
      scrollable.scrollTop = scrollable.scrollHeight;
    });
    await this.page.waitForTimeout(TestTimeouts.UI_DELAY_SHORT);

    const box = await this._horizontalLinkOverview.boundingBox();
    if (!box) return false;
    const viewport = this.page.viewportSize();
    if (!viewport) return false;
    return box.y >= 0 && box.y + box.height <= viewport.height;
  }

  async navigateToConfigurationInitialRun() {
    await this.navigateToConfigurationTab();
    await this.navigateToTab(this.testId('vm-configuration-initial'));
  }

  async navigateToConfigurationMetadata() {
    await this.navigateToConfigurationTab();
    await this.navigateToTab(this.testId('vm-configuration-metadata'));
  }

  async navigateToConfigurationNetwork() {
    await this.navigateToConfigurationTab();
    await this.navigateToTab(this._configurationNetworkSubTab);
  }

  async navigateToConfigurationTab() {
    await this.navigateToTab(
      this.testId('horizontal-link-Configuration'),
      TestTimeouts.UI_ACTION_COMPLETE,
    );
  }

  async navigateToConsole() {
    await this.navigateToTab(this.testId('horizontal-link-Console'));
  }

  async navigateToDiagnostics() {
    const byTestId = this.testId('horizontal-link-Diagnostics');
    const byText = this.locator('a[href*="diagnostics"]').filter({ hasText: 'Diagnostics' });
    await this.navigateToTab(byTestId.or(byText).first());
  }

  async navigateToDisks(): Promise<void> {
    await this.navigateToTab(this.testId('horizontal-link-Disks'));
  }

  async navigateToEvents() {
    await this.navigateToTab(this.testId('horizontal-link-Events'));
  }

  async navigateToMetrics() {
    await this._horizontalLinkMetrics.waitFor({
      state: 'visible',
      timeout: TestTimeouts.INSTANCE_TYPE_VERIFICATION,
    });
    await this.robustClick(this._horizontalLinkMetrics);
    await this.page.waitForTimeout(TestTimeouts.UI_DELAY_MEDIUM);
  }

  async navigateToNetworks(): Promise<void> {
    await this.navigateToTab(this.testId('horizontal-link-Network interfaces'));
  }

  async navigateToOverview() {
    await this._horizontalLinkOverview.waitFor({
      state: 'visible',
      timeout: TestTimeouts.ELEMENT_WAIT,
    });
    await this.robustClick(this._horizontalLinkOverview);
    await this.page.waitForTimeout(TestTimeouts.UI_DELAY_MEDIUM);
  }

  async navigateToScheduling(): Promise<void> {
    await this.navigateToTab(this.testId('horizontal-link-Scheduling'));
  }

  async navigateToSnapshots() {
    await this._horizontalLinkSnapshots.waitFor({
      state: 'visible',
      timeout: TestTimeouts.VM_CREATION,
    });
    await this.robustClick(this._horizontalLinkSnapshots);
    await this.page.waitForTimeout(TestTimeouts.UI_DELAY_MEDIUM);
  }

  async navigateToVirtualMachineDetail(vmName: string, namespace: string) {
    await this.goTo(`/k8s/ns/${namespace}/kubevirt.io~v1~VirtualMachine/${vmName}`);
  }

  async navigateToYAML() {
    await this.navigateToTab(this.testId('horizontal-link-YAML'));
  }

  async verifyPageTabsVisible(): Promise<boolean> {
    const tab = this.page.locator('[role="tab"]').first();
    return await tab.isVisible({ timeout: TestTimeouts.UI_ELEMENT_VISIBILITY }).catch(() => false);
  }
}
