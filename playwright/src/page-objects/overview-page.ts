import BasePage from '@/page-objects/base-page';
import type { Locator, Page } from '@playwright/test';

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
    return this.page.locator('[data-test="getting-started"]');
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

  subTab(testId: string): Locator {
    const byTestId = this.consoleTestId(testId);
    const label = SUB_TAB_LABELS[testId];
    if (!label) {
      return byTestId;
    }
    return byTestId.or(this.page.getByRole('link', { name: label, exact: true }));
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
      .first();
  }

  async openSubTab(testId: string): Promise<void> {
    await this.navigateToTab(this.subTab(testId));
  }
}
