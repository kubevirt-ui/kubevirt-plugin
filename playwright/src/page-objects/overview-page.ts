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

  async expectSubTabReadable(testId: string): Promise<void> {
    await this.openSubTab(testId);
    switch (testId) {
      case 'horizontal-link-Overview':
        await this.gettingStartedCard().waitFor({
          state: 'visible',
          timeout: TestTimeouts.LONG_OPERATION,
        });
        await this.statusCard().waitFor({ state: 'visible', timeout: TestTimeouts.LONG_OPERATION });
        break;
      case 'horizontal-link-Top consumers':
        await this.topConsumersContent().waitFor({
          state: 'visible',
          timeout: TestTimeouts.LONG_OPERATION,
        });
        break;
      case 'horizontal-link-Migrations':
        await this.migrationsHeading().waitFor({
          state: 'visible',
          timeout: TestTimeouts.LONG_OPERATION,
        });
        break;
      case 'horizontal-link-Settings':
        await this.openSettingsClusterTab();
        await this.clusterSettingsContent().waitFor({
          state: 'visible',
          timeout: TestTimeouts.LONG_OPERATION,
        });
        await this.openSettingsUserTab();
        await this.userSettingsContent().waitFor({
          state: 'visible',
          timeout: TestTimeouts.LONG_OPERATION,
        });
        break;
      default:
        throw new Error(`Unknown overview sub-tab: ${testId}`);
    }
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

  migrationsHeading(): Locator {
    return this.page
      .getByText(/VirtualMachineInstanceMigrations/i)
      .or(this.page.getByRole('heading', { name: /Migrations/i }))
      .first();
  }

  async openSettingsClusterTab(): Promise<void> {
    await this.robustClick(this.settingsClusterTab());
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

  quickStartsCard(): Locator {
    return this.page.getByTestId('item all-quick-starts');
  }

  relatedOperatorsText(): Locator {
    return this.page.getByText('Related operators');
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
