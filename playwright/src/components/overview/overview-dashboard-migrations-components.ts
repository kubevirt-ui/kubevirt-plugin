import BaseComponent from '@/components/shared/base-component';
import NavigationComponent from '@/components/shared/navigation-component';
import ProjectDropdownComponent from '@/components/shared/project-dropdown-component';
import { SECRET_NAMES } from '@/data-models';
import { getErrorMessage } from '@/data-models/kubernetes-types';
import { regexFromLiteral } from '@/utils/regex-utils';
import { TestTimeouts } from '@/utils/test-config';
import type { Page } from '@playwright/test';
import { expect } from '@playwright/test';

import {
  ClusterSettingsSharedComponent,
  OverviewSettingsComponent,
} from './overview-settings-components';

export class OverviewDashboardComponent extends BaseComponent {
  readonly navigation = new NavigationComponent(this.page);
  readonly projectDropdown = new ProjectDropdownComponent(this.page);
  private readonly _overviewTab = this.locator('[data-test="overview-tab"]');
  private readonly _kvTopConsumersCardAmountSelect = this.locator(
    '#kv-top-consumers-card-amount-select',
  );
  private readonly _Btn = this.locator('button:has-text("10")');
  private readonly _virtctlDownloadLink = this.locator('[data-test-id="virtctl-download-link"]');
  private readonly _downloadVirtctlForLinuxForX8664 = this.locator(
    'text=Download virtctl for Linux for x86_64',
  );
  private readonly _btnIdOverviewVmsPerResourceCard = this.locator(
    'button[id="overview-vms-per-resource-card"]',
  );
  private readonly _buttonOpenShiftVirtualization = this.locator(
    'button[data-test="OpenShift Virtualization"]',
  );
  private readonly _divkvHealthPopupAlertsCountHasTextHealthyA = this.locator(
    'div.kv-health-popup__alerts-count:has-text("Healthy") a',
  );
  private readonly _resourceTitle = this.locator('[data-test-id="resource-title"]');
  private readonly _inventoryCard = this.locator('[data-test-id="inventory-card"]');
  private readonly _resourceBlock = this.locator('[data-test-id="dashboard"]');

  private static readonly _DASHBOARD_METRIC_CARD_TEXTS = [
    'VirtualMachines',
    'Running VMs',
    'vCPU usage',
    'Memory',
    'Storage',
  ] as const;

  constructor(page: Page) {
    super(page);
  }

  async navigateToGeneralOverview() {
    await this.goTo('/k8s/all-namespaces/virtualization-overview');
  }

  async navigateToVirtualizationOverview() {
    await this.goTo('/k8s/all-namespaces/virtualization-overview');
  }

  async navigateToVirtualizationOverviewViaUI(): Promise<void> {
    await this.goTo('/k8s/all-namespaces/kubevirt.io~v1~VirtualMachine');
    await this.page.waitForLoadState('domcontentloaded');

    const overviewTab = this._overviewTab;
    let tabVisible = await overviewTab
      .waitFor({ state: 'visible', timeout: TestTimeouts.UI_DELAY_MEDIUM })
      .then(() => true)
      .catch(() => false);

    if (!tabVisible) {
      const treeView = this.locator('.pf-v6-c-tree-view');
      const localClusterBtn = treeView
        .locator('[role="treeitem"]')
        .filter({ has: this.page.locator('button', { hasText: 'Local cluster' }) })
        .first()
        .locator('button', { hasText: 'Local cluster' })
        .last();
      const clusterVisible = await localClusterBtn
        .waitFor({ state: 'visible', timeout: TestTimeouts.ELEMENT_WAIT })
        .then(() => true)
        .catch(() => false);
      if (clusterVisible) {
        await this.robustClick(localClusterBtn);
        tabVisible = await overviewTab
          .waitFor({ state: 'visible', timeout: TestTimeouts.ELEMENT_WAIT })
          .then(() => true)
          .catch(() => false);
      }
    }

    if (tabVisible) {
      await this.robustClick(overviewTab);
    }
    await this.page.waitForTimeout(TestTimeouts.RETRY_DELAY);
  }

  async navigateToCheckups(namespace?: string): Promise<void> {
    if (namespace) {
      await this.goTo(`/k8s/ns/${namespace}/checkups`);
    } else {
      await this.goTo('/k8s/all-namespaces/checkups');
    }
  }

  async navigateToCheckupsViaUI(): Promise<void> {
    try {
      await this.navigation.clickNavCheckups();
    } catch {
      await this.navigateToCheckups();
    }
  }

  async navigateToTopConsumers() {
    await this.goTo('/k8s/all-namespaces/kubevirt.io~v1~VirtualMachine');
    await this.page.waitForLoadState('domcontentloaded');
    const overviewTab = this._overviewTab;
    const tabVisible = await overviewTab
      .waitFor({ state: 'visible', timeout: TestTimeouts.UI_ELEMENT_VISIBILITY })
      .then(() => true)
      .catch(() => false);
    if (tabVisible) {
      await this.robustClick(overviewTab);
    }
  }

  async verifyResourceCards(
    visibilityTimeout: number = TestTimeouts.UI_ELEMENT_VISIBILITY,
  ): Promise<boolean> {
    try {
      await this.page.waitForTimeout(TestTimeouts.RETRY_DELAY);

      const clusterStatus = this.locator('[data-test="cluster-status-widget"]');
      const vmHealth = this.locator('[data-test="vm-health-widget"]');
      const resourceAllocation = this.locator(
        '[data-test="resource-allocation-section"], [data-test="cluster-utilization-widget"]',
      );

      const statusVisible = await clusterStatus
        .first()
        .waitFor({ state: 'visible', timeout: visibilityTimeout })
        .then(() => true)
        .catch(() => false);

      const healthVisible = await vmHealth
        .first()
        .waitFor({ state: 'visible', timeout: visibilityTimeout })
        .then(() => true)
        .catch(() => false);

      const resourceVisible = await resourceAllocation
        .first()
        .waitFor({ state: 'visible', timeout: visibilityTimeout })
        .then(() => true)
        .catch(() => false);

      return statusVisible || healthVisible || resourceVisible;
    } catch {
      return false;
    }
  }

  async verifyDashboardMetricCardsVisible(): Promise<boolean> {
    try {
      await this._resourceBlock.waitFor({
        state: 'visible',
        timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
      });
      await this.page.waitForTimeout(TestTimeouts.RETRY_DELAY);
      for (const cardText of OverviewDashboardComponent._DASHBOARD_METRIC_CARD_TEXTS) {
        const card = this._resourceBlock
          .locator('.metric-charts-card')
          .filter({ hasText: cardText });
        await card.waitFor({ state: 'visible', timeout: TestTimeouts.UI_ELEMENT_VISIBILITY });
      }
      return true;
    } catch {
      return false;
    }
  }

  async verifyTopConsumersCards(expectedCards: string[]): Promise<boolean> {
    try {
      await this._kvTopConsumersCardAmountSelect.waitFor({
        state: 'visible',
        timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
      });
      await this.robustClick(this._kvTopConsumersCardAmountSelect);
      await this._Btn.waitFor({
        state: 'visible',
        timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
      });
      await this.robustClick(this._Btn);

      for (const card of expectedCards) {
        const cardLocator = this.locator('.kv-top-consumers-card__metric-title')
          .filter({ hasText: card })
          .first();
        try {
          await cardLocator.waitFor({
            state: 'visible',
            timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
          });
        } catch {
          return false;
        }
      }
      return true;
    } catch {
      return false;
    }
  }

  async verifyTopConsumersMenuToggleOptions(expectedOptions: string[]): Promise<boolean> {
    try {
      for (const option of expectedOptions) {
        const optionLocator = this.locator('button', { hasText: option });
        let found = false;

        try {
          await optionLocator
            .first()
            .waitFor({ state: 'visible', timeout: TestTimeouts.UI_FILTER_APPLY });
          const textContent = await optionLocator.first().textContent();
          if (textContent?.includes(option)) found = true;
        } catch {}

        if (!found) {
          const menuToggleLocator = this.locator('.pf-v6-c-menu-toggle', { hasText: option });
          try {
            await menuToggleLocator
              .first()
              .waitFor({ state: 'visible', timeout: TestTimeouts.UI_FILTER_APPLY });
            const menuToggleText = await menuToggleLocator.first().textContent();
            if (menuToggleText?.includes(option)) found = true;
          } catch {}

          if (!found) return false;
        }
      }
      return true;
    } catch {
      return false;
    }
  }

  async testVirtctlDownloadPopover(): Promise<boolean> {
    try {
      await this._virtctlDownloadLink.waitFor({
        state: 'visible',
        timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
      });
      await this.robustClick(this._virtctlDownloadLink);
      await this._downloadVirtctlForLinuxForX8664.waitFor({
        state: 'visible',
        timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
      });
      return await this._downloadVirtctlForLinuxForX8664.isVisible().catch(() => false);
    } catch {
      return false;
    }
  }

  async verifyFeatureHighlightsCard(
    visibilityTimeout: number = TestTimeouts.UI_ELEMENT_VISIBILITY,
  ): Promise<boolean> {
    try {
      const featureHighlightsCard = this.locator('[data-test="card feature-highlights"]');
      await featureHighlightsCard.waitFor({
        state: 'visible',
        timeout: visibilityTimeout,
      });
      return await featureHighlightsCard.isVisible().catch(() => false);
    } catch {
      return false;
    }
  }

  async verifyRelatedOperatorsCard(
    visibilityTimeout: number = TestTimeouts.UI_ELEMENT_VISIBILITY,
  ): Promise<boolean> {
    try {
      const relatedOperatorsCard = this.locator('[data-test="card related-operators"]');
      await relatedOperatorsCard.waitFor({
        state: 'visible',
        timeout: visibilityTimeout,
      });
      return await relatedOperatorsCard.isVisible().catch(() => false);
    } catch {
      return false;
    }
  }

  async verifyOverviewQuickStartAndCardItemsVisible(): Promise<boolean> {
    const selectors = [
      '[data-test="item all-quick-starts"]',
      '[data-test="item openshift-virtualization-feature-highlights"]',
      '[data-test="item openshift-virtualization-related-operators"]',
    ];
    try {
      for (const selector of selectors) {
        await this.locator(selector).waitFor({
          state: 'visible',
          timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
        });
      }
      return true;
    } catch {
      return false;
    }
  }

  async verifyVmPerTemplateCard(
    visibilityTimeout: number = TestTimeouts.UI_ELEMENT_VISIBILITY,
  ): Promise<boolean> {
    try {
      const vmPerTemplateCard = this.locator('[data-test-id="vms-per-template-card"]');
      await vmPerTemplateCard.waitFor({
        state: 'visible',
        timeout: visibilityTimeout,
      });
      return await vmPerTemplateCard.isVisible().catch(() => false);
    } catch {
      return false;
    }
  }

  async selectInstanceTypeChart(): Promise<void> {
    await this._btnIdOverviewVmsPerResourceCard.waitFor({
      state: 'visible',
      timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
    });
    await this.robustClick(this._btnIdOverviewVmsPerResourceCard);
    await this.page.waitForTimeout(TestTimeouts.UI_STABILIZE);
    const instanceTypeOption = this.locator('text=Show VirtualMachine per InstanceTypes');
    await instanceTypeOption.waitFor({
      state: 'visible',
      timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
    });
    await this.robustClick(instanceTypeOption);
  }

  async verifyInstanceTypeChart(
    expectedCount: string,
    expectedSeries: string,
  ): Promise<{
    success: boolean;
    actualCount: null | number;
    seriesFound: boolean;
  }> {
    try {
      const runningVmsCardLegendLabel = this.locator('.kv-running-vms-card__legend-label--count');
      await runningVmsCardLegendLabel.first().waitFor({
        state: 'visible',
        timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
      });

      const legendLabels = await runningVmsCardLegendLabel.all();
      let actualCount: null | number = null;

      for (const label of legendLabels) {
        const text = await label.textContent();
        if (text) {
          const count = parseInt(text.trim(), 10);
          if (!isNaN(count)) {
            if (actualCount === null || count > actualCount) {
              actualCount = count;
            }
          }
        }
      }

      const seriesLocator = this.locator(`text=${expectedSeries}`);
      const seriesFound = await seriesLocator
        .isVisible({ timeout: TestTimeouts.UI_ELEMENT_VISIBILITY })
        .catch(() => false);

      const expectedCountNum = parseInt(expectedCount, 10);
      const countValid = actualCount !== null && actualCount >= expectedCountNum;

      return {
        success: countValid && seriesFound,
        actualCount,
        seriesFound,
      };
    } catch {
      return {
        success: false,
        actualCount: null,
        seriesFound: false,
      };
    }
  }

  async navigateToClusterOverview() {
    await this.goTo('/dashboards');
  }

  async navigateToClusterOverviewViaUI(): Promise<void> {
    await this.page.waitForLoadState('domcontentloaded', {
      timeout: TestTimeouts.RESOURCE_CREATION,
    });
    await this.page.waitForLoadState('load', {
      timeout: TestTimeouts.RESOURCE_CREATION,
    });
    await this.navigation.clickNavClusterOverview();
    await this.page
      .waitForLoadState('networkidle', { timeout: TestTimeouts.UI_VISIBILITY_QUICK })
      .catch(() => undefined);
  }

  async verifyHealthyConditions(): Promise<boolean> {
    const maxRetries = 3;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        if (attempt > 1) {
          await this.goTo('/dashboards');
        }
        await this.page.waitForLoadState('domcontentloaded', {
          timeout: TestTimeouts.RESOURCE_CREATION,
        });
        await this.page.waitForLoadState('load', {
          timeout: TestTimeouts.RESOURCE_CREATION,
        });
        await this.waitForLoadingComplete(TestTimeouts.UI_DELAY_MEDIUM);

        await this._buttonOpenShiftVirtualization.waitFor({
          state: 'visible',
          timeout: TestTimeouts.ELEMENT_WAIT,
        });
        await this._buttonOpenShiftVirtualization.scrollIntoViewIfNeeded();
        await this.robustClick(this._buttonOpenShiftVirtualization);

        await this._divkvHealthPopupAlertsCountHasTextHealthyA.waitFor({
          state: 'visible',
          timeout: TestTimeouts.ELEMENT_WAIT,
        });

        await this.page.waitForTimeout(TestTimeouts.UI_DELAY_SHORT);

        await this.locator(
          'div.kv-health-popup__alerts-count:has-text("Healthy") a',
        ).scrollIntoViewIfNeeded();
        await this._divkvHealthPopupAlertsCountHasTextHealthyA.click({
          force: true,
        });

        await this.waitForLoadingComplete(TestTimeouts.UI_DELAY_MEDIUM);

        await this._resourceTitle.waitFor({
          state: 'visible',
          timeout: TestTimeouts.ELEMENT_WAIT,
        });
        const titleText = await this._resourceTitle.textContent();
        return titleText?.includes('kubevirt-hyperconverged') || false;
      } catch (error: unknown) {
        const errorMessage = getErrorMessage(error);

        if (attempt < maxRetries) {
          if (
            errorMessage.includes('detached') ||
            errorMessage.includes('stale') ||
            errorMessage.includes('intercept') ||
            errorMessage.includes('Timeout') ||
            errorMessage.includes('timeout')
          ) {
            await this.page.waitForTimeout(TestTimeouts.UI_DELAY_MEDIUM);
            continue;
          }
        }
        return false;
      }
    }

    return false;
  }

  async verifyVirtualMachineLink(): Promise<boolean> {
    const maxAttempts = 2;
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        await this.page.waitForLoadState('domcontentloaded', {
          timeout: TestTimeouts.RESOURCE_CREATION,
        });
        await this.page.waitForLoadState('load', {
          timeout: TestTimeouts.RESOURCE_CREATION,
        });
        await this.page
          .waitForLoadState('networkidle', { timeout: TestTimeouts.UI_VISIBILITY_QUICK })
          .catch(() => undefined);

        await this._inventoryCard.waitFor({
          state: 'visible',
          timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
        });
        await this._inventoryCard.scrollIntoViewIfNeeded();

        await this.locator(
          '[data-test="resource-inventory-item"]:has-text("VirtualMachine")',
        ).waitFor({
          state: 'visible',
          timeout: TestTimeouts.ELEMENT_WAIT,
        });
        await this.locator(
          '[data-test="resource-inventory-item"]:has-text("VirtualMachine")',
        ).scrollIntoViewIfNeeded();
        await this.page.waitForTimeout(TestTimeouts.UI_DELAY_SHORT);
        await this.robustClick(
          this.locator('[data-test="resource-inventory-item"]:has-text("VirtualMachine")'),
        );

        await this.locator(
          'h1:has-text("VirtualMachines"), .pf-v6-c-content--h1:has-text("VirtualMachines")',
        ).waitFor({
          state: 'visible',
          timeout: TestTimeouts.ELEMENT_WAIT,
        });
        return true;
      } catch {
        if (attempt < maxAttempts) {
          await this.goTo('/dashboards');
          await this.page.waitForTimeout(TestTimeouts.UI_DELAY_MEDIUM);
          continue;
        }
        return false;
      }
    }
    return false;
  }

  async verifyTopConsumersTabLoaded(): Promise<boolean> {
    try {
      await this.page.waitForTimeout(TestTimeouts.RETRY_DELAY);

      const resourceSection = this.locator(
        '[data-test="resource-allocation-section"], [data-test="resource-allocation-widget"], [data-test="cluster-utilization-widget"], [data-test="kv-top-consumers-card"]',
      );
      return await resourceSection
        .first()
        .waitFor({ state: 'visible', timeout: TestTimeouts.DEFAULT })
        .then(() => true)
        .catch(() => false);
    } catch {
      return false;
    }
  }

  async clickVmStatusLink(index = 1): Promise<boolean> {
    try {
      const statusSelector = 'a[href*="kubevirt.io~v1~VirtualMachine"][href*="rowFilter-status="]';
      const link = this.page.locator(statusSelector).nth(index);
      await link.waitFor({ state: 'attached', timeout: TestTimeouts.ELEMENT_WAIT });
      await link.click({ force: true });
      await this.page.waitForLoadState('domcontentloaded');
      return true;
    } catch {
      return false;
    }
  }
}

export class OverviewMigrationsComponent extends BaseComponent {
  readonly clusterSettings: ClusterSettingsSharedComponent;

  private readonly _pfV6CPopoverContent = this.locator('.pf-v6-c-popover__content');
  private readonly _migrationStatusSection = this.locator('#migration-status-section');
  private readonly _overviewTab = this.locator('[data-test="overview-tab"]');
  private readonly _generalSettingsButton = this.locator('button:has-text("General settings")');

  constructor(page: Page) {
    super(page);
    this.clusterSettings = new ClusterSettingsSharedComponent(page);
  }

  async navigateToMigrations() {
    await this.goTo('/k8s/all-namespaces/kubevirt.io~v1~VirtualMachine');
    await this.page.waitForLoadState('domcontentloaded');
    const overviewTab = this._overviewTab;
    const tabVisible = await overviewTab
      .waitFor({ state: 'visible', timeout: TestTimeouts.UI_ELEMENT_VISIBILITY })
      .then(() => true)
      .catch(() => false);
    if (tabVisible) {
      await this.robustClick(overviewTab);
    }
  }

  async navigateToStandaloneMigrationsPage(): Promise<void> {
    await this.goTo('/k8s/all-namespaces/virtualization-migrations');
  }

  async verifyStandaloneMigrationsPageLoaded(timeout = TestTimeouts.DEFAULT): Promise<boolean> {
    try {
      const title = this.page.getByText('Compute migrations', { exact: false });
      const titleVisible = await title
        .first()
        .waitFor({ state: 'visible', timeout })
        .then(() => true)
        .catch(() => false);
      if (titleVisible) return true;

      const overviewSection = this.page.getByText('Compute migration overview');
      return await overviewSection
        .first()
        .waitFor({ state: 'visible', timeout: TestTimeouts.ELEMENT_WAIT })
        .then(() => true)
        .catch(() => false);
    } catch {
      return false;
    }
  }

  async verifyMigrationsTabLoaded(): Promise<boolean> {
    try {
      await this.page.waitForLoadState('domcontentloaded');
      await this.page.waitForTimeout(TestTimeouts.RETRY_DELAY);

      const migrationByDataTest = this.locator(
        '[data-test="migration-status-section"], [data-test="migrations-widget"]',
      );
      const migrationByText = this.page.getByText('Migration statuses');
      const migrationByTab = this.locator(
        '[data-test-id="horizontal-link-Migrations"].pf-m-current',
      );

      const dataTestVisible = await migrationByDataTest
        .first()
        .waitFor({ state: 'visible', timeout: TestTimeouts.DEFAULT })
        .then(() => true)
        .catch(() => false);
      if (dataTestVisible) return true;

      const textVisible = await migrationByText
        .first()
        .isVisible()
        .catch(() => false);
      if (textVisible) return true;

      return await migrationByTab
        .first()
        .isVisible()
        .catch(() => false);
    } catch {
      return false;
    }
  }

  async hasMonitoringError(): Promise<boolean> {
    try {
      const errorText = this.locator('text=Model does not exist');
      const errorOccurred = this.locator('text=An error occurred');

      const hasModelError = await errorText
        .isVisible({ timeout: TestTimeouts.RETRY_DELAY })
        .catch(() => false);
      const hasError = await errorOccurred
        .isVisible({ timeout: TestTimeouts.RETRY_DELAY })
        .catch(() => false);

      return hasModelError || hasError;
    } catch {
      return false;
    }
  }

  async selectMigrationsTimeFilter(_timeFilter = '1h') {
    const section = this.locator('[data-test="migration-status-section"]');
    await section
      .waitFor({ state: 'visible', timeout: TestTimeouts.UI_ELEMENT_VISIBILITY })
      .catch(() => undefined);
  }

  async clickLastButton() {
    const lastButton = this.locator('button:has-text("Last")');
    await lastButton.waitFor({ state: 'visible', timeout: TestTimeouts.UI_ELEMENT_VISIBILITY });
    await this.robustClick(lastButton);
  }

  async clickTimeRangeButton(timeRange: string) {
    const menuItem = this.locator(
      `[role="menuitem"]:has-text("${timeRange}"), [role="option"]:has-text("${timeRange}")`,
    );
    const fallback = this.locator(`button:has-text("${timeRange}")`).last();

    const target = (await menuItem.count()) > 0 ? menuItem.first() : fallback;
    await target.waitFor({
      state: 'visible',
      timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
    });
    await this.robustClick(target);
  }

  async getMigrationStatus(vmName: string): Promise<null | string> {
    try {
      const vmRow = this.locator(`tr:has-text("${vmName}")`);
      await vmRow.waitFor({ state: 'visible', timeout: TestTimeouts.UI_ELEMENT_VISIBILITY });

      const statusCell = vmRow.locator('td:nth-child(3)');
      await statusCell.waitFor({ state: 'visible', timeout: TestTimeouts.UI_ELEMENT_VISIBILITY });
      const statusText = await statusCell.textContent();
      return statusText?.trim() || null;
    } catch {
      return null;
    }
  }

  async clickLimitationsLink() {
    const limitationsLink = this.locator('a:has-text("Limitations")');
    await limitationsLink.waitFor({
      state: 'visible',
      timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
    });
    await this.robustClick(limitationsLink);
  }

  async verifyLiveMigrationSettings(): Promise<boolean> {
    try {
      const popoverContent = this._pfV6CPopoverContent;
      await popoverContent.waitFor({
        state: 'visible',
        timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
      });

      const liveMigrationSettings = popoverContent.locator(
        'h3:has-text("Live migrations settings")',
      );
      return await liveMigrationSettings.isVisible().catch(() => false);
    } catch {
      return false;
    }
  }

  async verifyMigrationSetting(settingLabel: string, expectedValue: string): Promise<boolean> {
    try {
      const popoverContent = this._pfV6CPopoverContent;
      await popoverContent.waitFor({
        state: 'visible',
        timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
      });

      const stackItem = popoverContent.locator(
        `.pf-v6-l-stack__item:has(b:has-text("${settingLabel}"))`,
      );
      await stackItem.waitFor({ state: 'visible', timeout: TestTimeouts.UI_ELEMENT_VISIBILITY });

      const valueDiv = stackItem.locator('div');
      const actualValue = await valueDiv.textContent();

      return actualValue?.trim() === expectedValue?.trim();
    } catch {
      return false;
    }
  }

  async verifyMigrationStatusSectionVisible(): Promise<boolean> {
    try {
      const section = this._migrationStatusSection;
      await section.waitFor({ state: 'visible', timeout: TestTimeouts.UI_ELEMENT_VISIBILITY });
      return true;
    } catch {
      return false;
    }
  }

  async clickVmimNameLink(): Promise<null | string> {
    try {
      const section = this._migrationStatusSection;
      const viewAllLink = section.locator('a').filter({ hasText: 'View all' }).first();
      await viewAllLink.waitFor({ state: 'visible', timeout: TestTimeouts.UI_ELEMENT_VISIBILITY });

      await this.robustClick(viewAllLink);

      return 'migrations-list';
    } catch {
      return null;
    }
  }

  async verifyVmimDetailPage(): Promise<boolean> {
    try {
      await this.locator(
        '[data-test-section-heading="VirtualMachineInstanceMigration details"]',
      ).waitFor({
        state: 'visible',
        timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
      });
      return await this.locator(
        '[data-test-section-heading="VirtualMachineInstanceMigration details"]',
      )
        .isVisible()
        .catch(() => false);
    } catch {
      return false;
    }
  }

  async verifyInstalledVersion(
    ...args: Parameters<ClusterSettingsSharedComponent['verifyInstalledVersion']>
  ): ReturnType<ClusterSettingsSharedComponent['verifyInstalledVersion']> {
    return this.clusterSettings.verifyInstalledVersion(...args);
  }

  async setLiveMigrationLimits(
    ...args: Parameters<ClusterSettingsSharedComponent['setLiveMigrationLimits']>
  ): ReturnType<ClusterSettingsSharedComponent['setLiveMigrationLimits']> {
    return this.clusterSettings.setLiveMigrationLimits(...args);
  }

  async openMemoryDensitySettings(): ReturnType<
    ClusterSettingsSharedComponent['openMemoryDensitySettings']
  > {
    return this.clusterSettings.openMemoryDensitySettings();
  }

  async getMemoryDensityToggleState(): ReturnType<
    ClusterSettingsSharedComponent['getMemoryDensityToggleState']
  > {
    return this.clusterSettings.getMemoryDensityToggleState();
  }

  async waitForMemoryDensityToggleState(
    ...args: Parameters<ClusterSettingsSharedComponent['waitForMemoryDensityToggleState']>
  ): ReturnType<ClusterSettingsSharedComponent['waitForMemoryDensityToggleState']> {
    return this.clusterSettings.waitForMemoryDensityToggleState(...args);
  }

  async toggleMemoryDensity(): ReturnType<ClusterSettingsSharedComponent['toggleMemoryDensity']> {
    return this.clusterSettings.toggleMemoryDensity();
  }

  async enableMemoryDensity(): ReturnType<ClusterSettingsSharedComponent['enableMemoryDensity']> {
    return this.clusterSettings.enableMemoryDensity();
  }

  async disableMemoryDensity(): ReturnType<ClusterSettingsSharedComponent['disableMemoryDensity']> {
    return this.clusterSettings.disableMemoryDensity();
  }

  async setMemoryDensityPercentage(
    ...args: Parameters<ClusterSettingsSharedComponent['setMemoryDensityPercentage']>
  ): ReturnType<ClusterSettingsSharedComponent['setMemoryDensityPercentage']> {
    return this.clusterSettings.setMemoryDensityPercentage(...args);
  }
}
