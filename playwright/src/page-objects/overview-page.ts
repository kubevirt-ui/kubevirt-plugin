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

export type OverviewHorizontalSubNavTab = (typeof OVERVIEW_HORIZONTAL_SUB_NAV_TABS)[number];

/** Map HorizontalNav `data-test-id` suffix to visible tab label (4.12 overview). */
const SUB_TAB_LABELS: Record<string, string> = {
  'horizontal-link-Overview': 'Overview',
  'horizontal-link-Top consumers': 'Top consumers',
  'horizontal-link-Migrations': 'Migrations',
  'horizontal-link-Settings': 'Settings',
};

export class OverviewPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  gettingStartedCard(): Locator {
    return this.page
      .getByTestId('getting-started')
      .or(this.page.getByRole('heading', { name: /Getting started resources/i }))
      .first();
  }

  featureHighlightsText(): Locator {
    return this.page.getByText('Feature highlights');
  }

  relatedOperatorsText(): Locator {
    return this.page.getByText('Related operators');
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
      .getByRole('link', { name: label, exact: true });
    return byTestId.or(inOverviewMain);
  }

  quickStartsCard(): Locator {
    return this.page.getByTestId('item all-quick-starts');
  }

  topConsumersContent(): Locator {
    return this.page.getByText(/Top consumers|CPU|Memory/i).first();
  }

  migrationsHeading(): Locator {
    return this.page
      .getByText(/VirtualMachineInstanceMigrations/i)
      .or(this.page.getByRole('heading', { name: /Migrations/i }))
      .first();
  }

  settingsContent(): Locator {
    return this.page
      .getByText(/Installed version|Service name|OpenShift Virtualization/i)
      .or(this.page.getByText(/General settings|Feature gate/i))
      .or(this.page.getByText(/HyperConverged|Configuration/i))
      .first();
  }

  overviewTabContent(): Locator {
    return this.page
      .locator('[data-test="getting-started"], [data-test-id="kv-overview-status-card"]')
      .first();
  }

  async openSubTab(testId: string): Promise<void> {
    await this.navigateToTab(this.subTab(testId));
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
      .getByRole('link', { name: 'Top consumers', exact: true });
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
        await this.settingsContent().waitFor({
          state: 'visible',
          timeout: TestTimeouts.LONG_OPERATION,
        });
        break;
      default:
        throw new Error(`Unknown overview sub-tab: ${testId}`);
    }
  }
}
