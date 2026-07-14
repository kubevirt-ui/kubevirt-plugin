import { getErrorMessage } from '@/data-models/kubernetes-types';
import PageCommons from '@/page-objects/page-commons';
import { TestTimeouts } from '@/utils/test-config';
import type { Page } from '@playwright/test';

export default class OverviewDashboardPage extends PageCommons {
  private static readonly _DASHBOARD_METRIC_CARD_TEXTS = [
    'VirtualMachines',
    'Running VMs',
    'vCPU usage',
    'Memory',
    'Storage',
  ] as const;
  private readonly _Btn = this.locator('button:has-text("10")');
  private readonly _btnIdOverviewVmsPerResourceCard = this.locator(
    'button[id="overview-vms-per-resource-card"]',
  );
  private readonly _buttonOpenShiftVirtualization = this.locator(
    'button[data-test="OpenShift Virtualization"]',
  );
  private readonly _divkvHealthPopupAlertsCountHasTextHealthyA = this.locator(
    'div.kv-health-popup__alerts-count:has-text("Healthy") a',
  );
  private readonly _downloadVirtctlForLinuxForX8664 = this.locator(
    'text=Download virtctl for Linux for x86_64',
  );
  private readonly _inventoryCard = this.locator('[data-test-id="inventory-card"]');
  private readonly _kvTopConsumersCardAmountSelect = this.locator(
    '#kv-top-consumers-card-amount-select',
  );
  private readonly _overviewTab = this.locator('[data-test="overview-tab"]');
  private readonly _resourceBlock = this.locator('[data-test-id="dashboard"]');
  private readonly _resourceTitle = this.locator('[data-test-id="resource-title"]');

  private readonly _virtctlDownloadLink = this.locator('[data-test-id="virtctl-download-link"]');

  constructor(page: Page) {
    super(page);
  }

  async clickVmStatusLink(index = 1): Promise<boolean> {
    try {
      const newLink = this.page.locator(
        'a[href*="kubevirt.io~v1~VirtualMachine"][href*="status="]',
      );
      const legacyLink = this.page.locator(
        'a[href*="kubevirt.io~v1~VirtualMachine"][href*="rowFilter-status="]',
      );
      const link = newLink.or(legacyLink).nth(index);
      await link.waitFor({ state: 'attached', timeout: TestTimeouts.ELEMENT_WAIT });
      await link.click({ force: true });
      await this.page.waitForLoadState('domcontentloaded');
      return true;
    } catch {
      return false;
    }
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
      await this.clickNavCheckups();
    } catch {
      await this.navigateToCheckups();
    }
  }

  async navigateToClusterOverview() {
    await this.goTo('/dashboards');
  }

  async navigateToClusterOverviewViaUI(): Promise<void> {
    try {
      await this.page.waitForLoadState('domcontentloaded', {
        timeout: TestTimeouts.RESOURCE_CREATION,
      });
      await this.page.waitForLoadState('load', {
        timeout: TestTimeouts.RESOURCE_CREATION,
      });
      await this.clickNavClusterOverview();
      await this.page
        .waitForLoadState('networkidle', { timeout: TestTimeouts.UI_VISIBILITY_QUICK })
        .catch(() => undefined);
    } catch {
      await this.navigateToClusterOverview();
    }
  }

  async navigateToGeneralOverview() {
    await this.goTo('/k8s/all-namespaces/virtualization-overview');
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

  async verifyDashboardMetricCardsVisible(): Promise<boolean> {
    try {
      await this._resourceBlock.waitFor({
        state: 'visible',
        timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
      });
      await this.page.waitForTimeout(TestTimeouts.RETRY_DELAY);
      for (const cardText of OverviewDashboardPage._DASHBOARD_METRIC_CARD_TEXTS) {
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

  async verifyHealthyConditions(): Promise<boolean> {
    const maxRetries = 3;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
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
        await this.waitForLoadingComplete(TestTimeouts.UI_DELAY_MEDIUM);

        await this._buttonOpenShiftVirtualization.waitFor({
          state: 'visible',
          timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
        });
        await this._buttonOpenShiftVirtualization.scrollIntoViewIfNeeded();
        await this.robustClick(this._buttonOpenShiftVirtualization);

        await this._divkvHealthPopupAlertsCountHasTextHealthyA.waitFor({
          state: 'visible',
          timeout: TestTimeouts.RESOURCE_CREATION,
        });

        await this.page.waitForTimeout(TestTimeouts.UI_DELAY_SHORT);

        await this.locator(
          'div.kv-health-popup__alerts-count:has-text("Healthy") a',
        ).scrollIntoViewIfNeeded();
        await this._divkvHealthPopupAlertsCountHasTextHealthyA.click({
          force: true,
        });

        await this.page.waitForLoadState('domcontentloaded', {
          timeout: TestTimeouts.RESOURCE_CREATION,
        });
        await this.waitForLoadingComplete(TestTimeouts.UI_DELAY_MEDIUM);

        await this._resourceTitle.waitFor({
          state: 'visible',
          timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
        });
        const titleText = await this._resourceTitle.textContent();
        return titleText?.includes('kubevirt-hyperconverged') || false;
      } catch (error: unknown) {
        if (attempt < maxRetries) {
          const errorMessage = getErrorMessage(error);
          if (
            errorMessage.includes('detached') ||
            errorMessage.includes('stale') ||
            errorMessage.includes('intercept')
          ) {
            await this.page.waitForTimeout(TestTimeouts.UI_DELAY_MEDIUM);
          } else {
            await this.navigateToClusterOverviewViaUI();
          }
          continue;
        }
        return false;
      }
    }

    return false;
  }

  async verifyInstanceTypeChart(
    expectedCount: string,
    expectedSeries: string,
  ): Promise<{
    success: boolean;
    actualCount: number | null;
    seriesFound: boolean;
  }> {
    try {
      const runningVmsCardLegendLabel = this.locator('.kv-running-vms-card__legend-label--count');
      await runningVmsCardLegendLabel.first().waitFor({
        state: 'visible',
        timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
      });

      const legendLabels = await runningVmsCardLegendLabel.all();
      let actualCount: number | null = null;

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
}
