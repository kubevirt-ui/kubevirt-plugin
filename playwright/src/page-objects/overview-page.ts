import BasePage from '@/page-objects/base-page';
import { pollUntil } from '@/utils/poll-until';
import { TestTimeouts } from '@/utils/test-config';
import type { Locator, Page } from '@playwright/test';

/** Horizontal tabs on Virtualization overview (when the console renders the tabbed layout). */
export const OVERVIEW_HORIZONTAL_SUB_NAV_TABS = [
  'horizontal-link-Overview',
  'horizontal-link-Top consumers',
  'horizontal-link-Migrations',
  'horizontal-link-Settings',
] as const;

export type OverviewHorizontalSubNavTab = typeof OVERVIEW_HORIZONTAL_SUB_NAV_TABS[number];

/** Map HorizontalNav `data-test-id` suffix to visible tab label (4.12 overview). */
const SUB_TAB_LABELS: Record<string, string> = {
  'horizontal-link-Migrations': 'Migrations',
  'horizontal-link-Overview': 'Overview',
  'horizontal-link-Settings': 'Settings',
  'horizontal-link-Top consumers': 'Top consumers',
};

export class OverviewPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  clusterSettingsContent(): Locator {
    return this.page
      .locator('main')
      .getByText(/Installed version|Update status/i)
      .or(this.page.locator('main').getByText(/Preview features|Live migration/i))
      .first();
  }

  cpuLimitPreviewSwitch(): Locator {
    return this.page.locator('#autocomputeCPULimitsPreviewEnabled').getByRole('checkbox');
  }

  featureHighlightsText(): Locator {
    return this.page.getByText('Feature highlights');
  }

  gettingStartedCard(): Locator {
    return this.page
      .getByTestId('getting-started')
      .or(this.page.getByRole('heading', { name: /Getting started resources/i }))
      .first();
  }

  async isVirtctlDownloadButtonVisible(): Promise<boolean> {
    return this.virtctlDownloadButton()
      .isVisible()
      .catch(() => false);
  }

  migrationsHeading(): Locator {
    return this.page
      .getByText(/VirtualMachineInstanceMigrations/i)
      .or(this.page.getByRole('heading', { name: /Migrations/i }))
      .first();
  }

  async openSettingsClusterTab(): Promise<void> {
    await this.robustClick(this.settingsClusterTab());
  }

  async openSettingsPreviewFeaturesTab(): Promise<void> {
    await this.robustClick(this.settingsPreviewFeaturesTab());
  }

  async openSettingsUserTab(): Promise<void> {
    await this.robustClick(this.settingsUserTab());
  }

  async openSubTab(testId: string): Promise<void> {
    await this.navigateToTab(this.subTab(testId));
  }

  async openVirtctlDownloadPopover(): Promise<void> {
    await this.robustClick(this.virtctlDownloadButton());
    await this.virtctlDownloadPopoverHeading().waitFor({
      state: 'visible',
      timeout: TestTimeouts.ELEMENT_WAIT,
    });
  }

  overviewTabContent(): Locator {
    return this.page
      .locator('[data-test="getting-started"], [data-test-id="kv-overview-status-card"]')
      .first();
  }

  async prepareReadableContent(
    subTab: OverviewHorizontalSubNavTab,
    contentIndex: number,
  ): Promise<void> {
    if (contentIndex === 0) {
      await this.openSubTab(subTab);
      if (subTab === 'horizontal-link-Settings') {
        await this.openSettingsClusterTab();
      }
      return;
    }
    if (subTab === 'horizontal-link-Settings' && contentIndex === 1) {
      await this.openSettingsUserTab();
    }
  }

  quickStartsCard(): Locator {
    return this.page.getByTestId('item all-quick-starts');
  }

  readableContentCount(subTab: OverviewHorizontalSubNavTab): number {
    if (subTab === 'horizontal-link-Overview' || subTab === 'horizontal-link-Settings') {
      return 2;
    }
    return 1;
  }

  readableContentLocator(subTab: OverviewHorizontalSubNavTab, contentIndex: number): Locator {
    switch (subTab) {
      case 'horizontal-link-Overview':
        return contentIndex === 0 ? this.gettingStartedCard() : this.statusCard();
      case 'horizontal-link-Top consumers':
        return this.topConsumersContent();
      case 'horizontal-link-Migrations':
        return this.migrationsHeading();
      case 'horizontal-link-Settings':
        return contentIndex === 0 ? this.clusterSettingsContent() : this.userSettingsContent();
      default:
        throw new Error(`Unknown overview sub-tab: ${subTab}`);
    }
  }

  relatedOperatorsText(): Locator {
    return this.page.getByText('Related operators');
  }

  async setCpuLimitPreviewSwitch(on: boolean): Promise<void> {
    const switchEl = this.cpuLimitPreviewSwitch();
    if ((await switchEl.isChecked()) !== on) {
      await this.robustClick(switchEl);
    }
  }

  settingsClusterTab(): Locator {
    return this.page.locator('main').getByRole('tab', { name: /^Cluster$/i });
  }

  settingsContent(): Locator {
    return this.page
      .locator('main')
      .getByText(
        /Installed version|Update status|Preview features|Live migration|Manage SSH keys|Task permissions|Welcome information/i,
      )
      .first();
  }

  settingsPreviewFeaturesTab(): Locator {
    return this.page.locator('main').getByRole('tab', { name: /Preview features/i });
  }

  settingsUserTab(): Locator {
    return this.page.locator('main').getByRole('tab', { name: /^User$/i });
  }

  /** 4.12 overview uses metric charts + vm-statuses-card (not legacy StatusCard). */
  statusCard(): Locator {
    return this.page
      .locator(
        '[data-test-id="vm-statuses-card"], [data-test-id="kv-overview-status-card"], .metric-charts-card',
      )
      .first();
  }

  /**
   * Horizontal sub-nav under the Virtualization page heading (in `main`, not the left sidebar).
   * 4.13+ uses plain links; older builds expose `data-test-id="horizontal-link-*"`.
   */
  subTab(testId: string): Locator {
    const byTestId = this.consoleTestId(testId);
    const label = SUB_TAB_LABELS[testId];
    if (!label) {
      return byTestId;
    }
    const inOverviewMain = this.page
      .locator('main')
      .getByRole('link', { exact: true, name: label });
    return byTestId.or(inOverviewMain);
  }

  topConsumersContent(): Locator {
    return this.page.getByText(/Top consumers|CPU|Memory/i).first();
  }

  userSettingsContent(): Locator {
    return this.page
      .locator('main')
      .getByText(/Manage SSH keys|Task permissions/i)
      .or(this.page.locator('main').getByText(/Welcome information/i))
      .first();
  }

  virtctlDownloadButton(): Locator {
    return this.page
      .locator('#virtctl-download-links')
      .or(this.page.getByRole('button', { name: /^Download virtctl$/i }));
  }

  virtctlDownloadPopover(): Locator {
    return this.page
      .locator('.pf-v6-c-popover, .pf-c-popover')
      .filter({ has: this.virtctlDownloadPopoverHeading() });
  }

  virtctlDownloadPopoverDescription(): Locator {
    return this.page.getByText(
      /supplemental command-line utility for managing virtualization resources/i,
    );
  }

  virtctlDownloadPopoverFirstLink(): Locator {
    return this.virtctlDownloadPopoverLinks().first();
  }

  virtctlDownloadPopoverHeading(): Locator {
    return this.page.getByText('Download the virtctl command-line utility', { exact: true });
  }

  virtctlDownloadPopoverLinks(): Locator {
    return this.virtctlDownloadPopover().getByRole('link');
  }

  virtualizationHeading(): Locator {
    return this.page.locator('[data-test-id="resource-title"]');
  }

  /** Getting started + status/metrics cards (overview shell before horizontal tabs mount). */
  async waitForOverviewDashboard(timeoutMs = TestTimeouts.CONSOLE_PAGE_LOAD): Promise<void> {
    await this.gettingStartedCard().waitFor({ state: 'visible', timeout: timeoutMs });
    await this.statusCard().waitFor({ state: 'visible', timeout: timeoutMs });
    await this.waitForLoadingComplete(Math.min(timeoutMs / 4, TestTimeouts.ELEMENT_WAIT));
  }

  /**
   * Horizontal sub-nav tabs load after HCO/metrics on busy clusters; poll until all are visible.
   */
  async waitForOverviewSubNav(
    tabIds: readonly string[] = OVERVIEW_HORIZONTAL_SUB_NAV_TABS,
    timeoutMs = TestTimeouts.CONSOLE_PAGE_LOAD,
  ): Promise<void> {
    await this.waitForOverviewDashboard(timeoutMs);
    const anchor = this.page
      .locator('main')
      .getByRole('link', { exact: true, name: 'Top consumers' });
    await anchor.waitFor({ state: 'visible', timeout: timeoutMs });
    await pollUntil(
      async () => {
        for (const id of tabIds) {
          const visible = await this.subTab(id)
            .isVisible()
            .catch(() => false);
          if (!visible) {
            return false;
          }
        }
        return true;
      },
      {
        intervalMs: 500,
        message: `Virtualization overview horizontal tabs not ready: ${tabIds.join(', ')}`,
        timeout: Math.min(timeoutMs, TestTimeouts.ELEMENT_WAIT),
      },
    );
  }
}
