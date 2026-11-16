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
  'horizontal-link-Migrations': 'Migrations',
  'horizontal-link-Overview': 'Overview',
  'horizontal-link-Settings': 'Settings',
  'horizontal-link-Top consumers': 'Top consumers',
};

export class OverviewPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  autoComputeCpuLimitsSwitch(): Locator {
    return this.page.locator('#auto-compute-cpu-limits').or(
      this.page
        .locator('.section-with-switch')
        .filter({ hasText: /Auto-compute CPU and memory limits/i })
        .getByRole('switch'),
    );
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

  async isVirtctlDownloadLinkVisible(): Promise<boolean> {
    return this.virtctlDownloadLink()
      .isVisible()
      .catch(() => false);
  }

  migrationsHeading(): Locator {
    return this.page
      .getByRole('heading', { name: /Compute migrations|Migrations/i })
      .or(this.page.getByText(/VirtualMachineInstanceMigrations/i))
      .first();
  }

  vmNameInMigrationsTable(vmName: string): Locator {
    return this.page
      .locator('main')
      .getByRole('link', { name: vmName })
      .or(this.page.locator('main').getByRole('gridcell', { name: vmName }))
      .or(this.page.locator('main').getByText(vmName, { exact: true }))
      .first();
  }

  async waitForVmInMigrationsTable(
    vmName: string,
    timeout = TestTimeouts.LONG_OPERATION,
  ): Promise<void> {
    let widened = false;
    let reloaded = false;
    await pollUntil(
      async () => {
        await this.migrationsHeading()
          .waitFor({ state: 'visible', timeout: TestTimeouts.ELEMENT_WAIT })
          .catch(() => undefined);
        if (!widened) {
          await this.widenMigrationsDuration();
          widened = true;
        }
        if (
          await this.vmNameInMigrationsTable(vmName)
            .isVisible()
            .catch(() => false)
        ) {
          return true;
        }
        // One reload after widening — avoid tight reload loops that leave the page blank.
        const empty = this.page.getByRole('heading', { name: /No results found/i });
        if (!reloaded && (await empty.isVisible().catch(() => false))) {
          reloaded = true;
          await this.page.reload({ waitUntil: 'domcontentloaded' }).catch(() => undefined);
          await this.migrationsHeading()
            .waitFor({ state: 'visible', timeout: TestTimeouts.LONG_OPERATION })
            .catch(() => undefined);
          await this.widenMigrationsDuration();
        }
        return this.vmNameInMigrationsTable(vmName)
          .isVisible()
          .catch(() => false);
      },
      { message: `VM ${vmName} should appear on overview Migrations table`, timeout },
    );
  }

  /** Overview Migrations tab defaults to a short window; widen so fast migrations remain visible. */
  async widenMigrationsDuration(): Promise<void> {
    const durationToggle = this.page.getByRole('button', {
      name: /Last \d+ (minutes|minute|hours|hour|days|day)/i,
    });
    if (!(await durationToggle.isVisible().catch(() => false))) {
      return;
    }
    await durationToggle.click();
    const wider = this.page
      .getByRole('menuitem', {
        name: /Last 24 hours|Last 6 hours|Last 1 hour|Last 30 minutes/i,
      })
      .first();
    if (await wider.isVisible().catch(() => false)) {
      await wider.click();
      return;
    }
    await this.page.keyboard.press('Escape').catch(() => undefined);
  }

  async openResourceManagementSection(): Promise<void> {
    const section = this.page.getByRole('button', { name: /^Resource management$/i });
    if (await section.isVisible().catch(() => false)) {
      await this.robustClick(section);
    }
  }

  async setAutoComputeCpuLimitsSwitch(on: boolean): Promise<void> {
    const switchEl = this.autoComputeCpuLimitsSwitch();
    await switchEl.waitFor({ state: 'visible', timeout: TestTimeouts.ELEMENT_WAIT });
    if ((await switchEl.isChecked()) !== on) {
      await this.robustClick(switchEl);
    }
  }

  async openSettingsClusterTab(): Promise<void> {
    await this.robustClick(this.settingsClusterTab());
  }

  async openSettingsPreviewFeaturesTab(): Promise<void> {
    await this.dismissConsoleObstructions();
    const standaloneTab = this.page.locator('[data-test="settings-tab-features"]');
    if (await standaloneTab.isVisible().catch(() => false)) {
      await this.robustClick(standaloneTab);
      await this.previewFeaturesPanel().waitFor({
        state: 'visible',
        timeout: TestTimeouts.LONG_OPERATION,
      });
      return;
    }
    const preview = this.settingsPreviewFeaturesTab();
    if (!(await preview.isVisible().catch(() => false))) {
      await this.openSettingsUserTab();
    }
    await this.robustClick(this.settingsPreviewFeaturesTab());
    await this.previewFeaturesPanel().waitFor({
      state: 'visible',
      timeout: TestTimeouts.LONG_OPERATION,
    });
  }

  async openSettingsUserTab(): Promise<void> {
    await this.robustClick(this.settingsUserTab());
  }

  async openSubTab(testId: string): Promise<void> {
    await this.navigateToTab(this.subTab(testId));
  }

  async openVirtctlCommandLineToolsPage(): Promise<void> {
    await this.dismissConsoleObstructions();
    const link = this.virtctlDownloadLink();
    if (await link.isVisible().catch(() => false)) {
      await this.robustClick(link);
    } else {
      await this.page.goto('/command-line-tools', { waitUntil: 'domcontentloaded' });
    }
    await this.page.waitForURL(/command-line-tools/, {
      timeout: TestTimeouts.LONG_OPERATION,
    });
    await this.commandLineToolsHeading().waitFor({
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
    return this.page
      .locator('main')
      .getByRole('tab', { name: /^Cluster$/i })
      .or(this.page.locator('main').getByRole('link', { name: /^Cluster$/i }));
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
    return this.page
      .locator('main')
      .getByRole('tab', { name: /Preview features/i })
      .or(this.page.locator('main').getByRole('link', { name: /Preview features/i }));
  }

  previewFeaturesPanel(): Locator {
    return this.page.locator('[data-test="preview-features"]');
  }

  previewFeatureSwitch(featureTestId: string): Locator {
    return this.previewFeaturesPanel().locator(`[data-test-id="${featureTestId}"]`);
  }

  async waitForPreviewFeatureSwitchChecked(featureTestId: string): Promise<void> {
    await pollUntil(
      async () => {
        const toggle = this.previewFeatureSwitch(featureTestId);
        if (!(await toggle.isVisible().catch(() => false))) {
          return false;
        }
        return toggle.isChecked().catch(() => false);
      },
      {
        message: `Preview feature ${featureTestId} switch should be on`,
        timeout: TestTimeouts.LONG_OPERATION,
      },
    );
  }

  settingsUserTab(): Locator {
    return this.page
      .locator('main')
      .getByRole('tab', { name: /^User$/i })
      .or(this.page.locator('main').getByRole('link', { name: /^User$/i }));
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

  commandLineToolsHeading(): Locator {
    return this.page.getByRole('heading', { name: /^Command Line Tools$/i, level: 1 });
  }

  virtctlCliSectionLabel(): Locator {
    return this.page.getByText(/virtctl - KubeVirt command line interface/i);
  }

  virtctlDownloadLink(): Locator {
    return this.page
      .getByRole('link', { name: /Download the virtctl command-line utility/i })
      .or(this.page.locator('#virtctl-download-links'))
      .or(this.page.getByRole('button', { name: /^Download virtctl$/i }));
  }

  virtctlPlatformDownloadLinks(): Locator {
    return this.page.getByRole('link', { name: /Download virtctl for/i });
  }

  virtualizationHeading(): Locator {
    return this.page
      .locator('[data-test-id="resource-title"]')
      .or(this.page.getByRole('heading', { level: 1, name: /^Virtualization$/i }));
  }

  /** Getting started + status/metrics cards (overview shell before horizontal tabs mount). */
  async waitForOverviewDashboard(timeoutMs = TestTimeouts.CONSOLE_PAGE_LOAD): Promise<void> {
    const shell = this.gettingStartedCard()
      .or(this.statusCard())
      .or(this.featureHighlightsText())
      .or(this.page.getByRole('heading', { name: /^Virtualization$/i }))
      .or(this.page.getByRole('heading', { name: /^Settings$/i }));
    await shell.first().waitFor({ state: 'visible', timeout: timeoutMs });
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
    await this.subTab('horizontal-link-Overview').waitFor({ state: 'visible', timeout: timeoutMs });
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
