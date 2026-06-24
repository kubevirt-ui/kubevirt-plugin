import BaseComponent from '@/components/shared/base-component';
import KebabMenuComponent from '@/components/shared/kebab-menu-component';
import { VmListMetricsComponent } from '@/components/vm/vm-list-metrics-components';
import type { VmMetricEntry } from '@/data-factories/vm-metrics-mock-factory';
import { TestTimeouts } from '@/utils/test-config';
import type { Page } from '@playwright/test';

export class VmListOverviewWidgetsComponent extends BaseComponent {
  readonly kebab: KebabMenuComponent;
  private readonly _vmListSummary = this.locator('[data-test-id="vm-list-summary"]');
  private readonly _clusterStatusWidget = this.locator('[data-test="cluster-status-widget"]');
  private readonly _migrationsWidget = this.locator('[data-test="migrations-widget"]');
  private readonly _storageMigrationPlansWidget = this.locator(
    '[data-test="storage-migration-plans-widget"]',
  );
  private readonly _nodeLoadDistributionTitle = this.locator('.pf-v6-c-card__title-text', {
    hasText: 'Node load distribution',
  });
  private readonly _guestAgentIssuesWidget = this.locator(
    '[data-test="guest-agent-issues-widget"]',
  );
  private readonly _overviewTab = this.locator('button[role="tab"]', { hasText: /^Overview$/ });
  private readonly _vmListTab = this.locator('[data-test="vm-list-tab"]');
  private readonly _treeView = this.locator('.pf-v6-c-tree-view');
  private readonly _somethingWrongHappened = this.locator('text=Something wrong happened');
  readonly metrics: VmListMetricsComponent;

  constructor(
    page: Page,
    private readonly hostTree: {
      searchTreeView: (searchText: string) => Promise<void>;
    },
  ) {
    super(page);
    this.metrics = new VmListMetricsComponent(page);
    this.kebab = new KebabMenuComponent(page);
  }

  async toggleOverviewSection(sectionDataTest: string): Promise<void> {
    const toggle = this.locator(
      `[data-test="${sectionDataTest}"] .pf-v6-c-expandable-section__toggle button`,
    );
    await toggle.waitFor({ state: 'visible', timeout: TestTimeouts.ELEMENT_WAIT });
    await toggle.click();
    await this.page.waitForTimeout(TestTimeouts.UI_DELAY_SHORT);
  }

  async isOverviewSectionExpanded(sectionDataTest: string): Promise<boolean> {
    const toggle = this.locator(
      `[data-test="${sectionDataTest}"] .pf-v6-c-expandable-section__toggle button`,
    );
    const ariaExpanded = await toggle.getAttribute('aria-expanded').catch(() => null);
    return ariaExpanded === 'true';
  }

  async toggleSummary(): Promise<boolean> {
    await this.locator(
      '.pf-v6-c-expandable-section__toggle:has(.vm-list-summary__expand-section-toggle)',
    ).click();
    await this.page.waitForTimeout(TestTimeouts.UI_DELAY_SHORT);
    return await this._vmListSummary.isVisible().catch(() => false);
  }

  async isSummaryVisible(): Promise<boolean> {
    return await this._vmListSummary.isVisible().catch(() => false);
  }

  async isSummaryNotVisible(): Promise<boolean> {
    return !(await this._vmListSummary.isVisible().catch(() => false));
  }
  async clickVmListTab(): Promise<void> {
    await this.page.waitForLoadState('domcontentloaded');
    await this._vmListTab.waitFor({ state: 'visible', timeout: TestTimeouts.ELEMENT_WAIT });
    await this.robustClick(this._vmListTab);
    await this.page.waitForLoadState('domcontentloaded');
  }

  async clickOverviewTab(): Promise<void> {
    await this._overviewTab.waitFor({ state: 'visible', timeout: TestTimeouts.ELEMENT_WAIT });
    await this.robustClick(this._overviewTab);
    await this.page.waitForTimeout(TestTimeouts.UI_DELAY_SHORT);
  }

  async isOverviewTabSelected(): Promise<boolean> {
    try {
      await this._overviewTab.waitFor({ state: 'visible', timeout: TestTimeouts.ELEMENT_WAIT });
      return (await this._overviewTab.getAttribute('aria-selected')) === 'true';
    } catch {
      return false;
    }
  }

  async isMigrationsWidgetVisible(timeout = TestTimeouts.ELEMENT_WAIT): Promise<boolean> {
    return await this._migrationsWidget
      .waitFor({ state: 'visible', timeout })
      .then(() => true)
      .catch(() => false);
  }

  async isClusterStatusWidgetPresent(timeout = 5000): Promise<boolean> {
    return await this._clusterStatusWidget
      .waitFor({ state: 'attached', timeout })
      .then(() => true)
      .catch(() => false);
  }

  async getMigrationStatusSectionTitle(
    timeout = TestTimeouts.ELEMENT_WAIT,
  ): Promise<null | string> {
    try {
      const migrationStatusSection = this.locator('[data-test="migration-status-section"]');
      await migrationStatusSection.waitFor({ state: 'visible', timeout });
      const heading = migrationStatusSection.locator('h3').first();
      return await heading.textContent();
    } catch {
      return null;
    }
  }

  async getComputeMigrationStatusNames(timeout = TestTimeouts.ELEMENT_WAIT): Promise<string[]> {
    try {
      await this._migrationsWidget.waitFor({ state: 'visible', timeout });
      const statusLabels = this._migrationsWidget.locator('[data-test^="status-count-"]');
      const count = await statusLabels.count();
      const names: string[] = [];
      for (let i = 0; i < count; i++) {
        const text = await statusLabels.nth(i).textContent();
        if (text) names.push(text.replace(/\d+$/, '').trim());
      }
      return names;
    } catch {
      return [];
    }
  }

  async getComputeMigrationStatusCount(
    statusKey: string,
    timeout = TestTimeouts.ELEMENT_WAIT,
  ): Promise<number> {
    try {
      await this._migrationsWidget.waitFor({ state: 'visible', timeout });
      const tile = this._migrationsWidget.locator(`[data-test="status-count-${statusKey}"]`);
      const text = await tile.textContent();
      if (!text) return 0;
      const match = text.match(/(\d+)/);
      return match ? parseInt(match[1], 10) : 0;
    } catch {
      return 0;
    }
  }

  async getGuestAgentWidgetTitle(timeout = TestTimeouts.ELEMENT_WAIT): Promise<null | string> {
    try {
      await this._guestAgentIssuesWidget.waitFor({ state: 'visible', timeout });
      const allText = await this._guestAgentIssuesWidget.textContent();
      if (!allText) return null;
      const match = allText.match(/^(.*?)(?:VMs|0|$)/);
      return match ? match[1].trim() : allText.split(/\d/)[0].trim();
    } catch {
      return null;
    }
  }

  async getDeschedulerStatus(
    timeout = TestTimeouts.ELEMENT_WAIT,
  ): Promise<{ label: null | string; value: null | string; hasInfoButton: boolean }> {
    try {
      const deschedulerLabel = this.locator('.two-column-card__descheduler-label');
      const deschedulerValue = this.locator('.two-column-card__descheduler-value');
      const deschedulerInfoButton = this.locator(
        '.two-column-card__descheduler-value + button, .two-column-card__descheduler-label ~ button',
      );

      const label = await deschedulerLabel
        .waitFor({ state: 'visible', timeout })
        .then(() => deschedulerLabel.textContent())
        .catch(() => null);

      const value = await deschedulerValue.textContent().catch(() => null);

      const hasInfoButton = await deschedulerInfoButton
        .first()
        .isVisible()
        .catch(() => false);

      return { label: label?.trim() ?? null, value: value?.trim() ?? null, hasInfoButton };
    } catch {
      return { label: null, value: null, hasInfoButton: false };
    }
  }

  async getNodeLoadDistributionNames(timeout = TestTimeouts.ELEMENT_WAIT): Promise<string[]> {
    try {
      const titleLocator = this._nodeLoadDistributionTitle;
      await titleLocator.waitFor({ state: 'visible', timeout });

      const card = this.page.locator('.pf-v6-c-card, .two-column-card').filter({
        has: this.page.locator('text=Node load distribution'),
      });
      await card.waitFor({ state: 'visible', timeout });

      const entries = card.locator(
        '.status-score-list__name--truncated, [class*="score-list"] [class*="name"], .pf-v6-c-progress__description',
      );
      const entryCount = await entries.count();
      if (entryCount > 0) {
        const names: string[] = [];
        for (let i = 0; i < entryCount; i++) {
          const text = await entries.nth(i).textContent();
          if (text) names.push(text.trim());
        }
        return names;
      }

      const allText = await card.textContent();
      if (allText) {
        const workerMatches = allText.match(/\b\S*worker\S*/g);
        if (workerMatches && workerMatches.length > 0) {
          return workerMatches;
        }
      }

      return [];
    } catch {
      return [];
    }
  }

  async isNodeLoadDistributionVisible(timeout = TestTimeouts.ELEMENT_WAIT): Promise<boolean> {
    return await this._nodeLoadDistributionTitle
      .waitFor({ state: 'visible', timeout })
      .then(() => true)
      .catch(() => false);
  }

  async isStorageMigrationPlansVisible(timeout = TestTimeouts.ELEMENT_WAIT): Promise<boolean> {
    return await this._storageMigrationPlansWidget
      .waitFor({ state: 'visible', timeout })
      .then(() => true)
      .catch(() => false);
  }

  async getStorageMigrationPlansStatusNames(
    timeout = TestTimeouts.ELEMENT_WAIT,
  ): Promise<string[]> {
    try {
      await this._storageMigrationPlansWidget.waitFor({ state: 'visible', timeout });
      const statusLabels = this._storageMigrationPlansWidget.locator(
        '[data-test^="status-count-"]',
      );
      const count = await statusLabels.count();
      const names: string[] = [];
      for (let i = 0; i < count; i++) {
        const text = await statusLabels.nth(i).textContent();
        if (text) names.push(text.replace(/\d+$/, '').trim());
      }
      return names;
    } catch {
      return [];
    }
  }

  async navigateToStorageMigrationPlans(_namespace?: string): Promise<void> {
    await this.goTo('/k8s/all-namespaces/storagemigrations');
    await this.page.waitForLoadState('domcontentloaded');
  }

  async navigateToStorageMigrationPlansViaUI(): Promise<void> {
    try {
      await this.goTo('/k8s/all-namespaces/kubevirt.io~v1~VirtualMachine');
      await this.page.waitForLoadState('domcontentloaded');
      const migrationNavBtn = this.page.locator('nav button').filter({ hasText: /^Migration$/ });
      await migrationNavBtn.waitFor({ state: 'visible', timeout: TestTimeouts.DEFAULT });
      const isExpanded = (await migrationNavBtn.getAttribute('aria-expanded')) === 'true';
      if (!isExpanded) {
        await migrationNavBtn.click();
        await this.page.waitForTimeout(TestTimeouts.UI_DELAY_SHORT);
      }
      const storageMigrationsLink = this.page.locator(
        '[data-test-id="storagemigrations-nav-item"]',
      );
      await storageMigrationsLink.waitFor({
        state: 'visible',
        timeout: TestTimeouts.ELEMENT_WAIT,
      });
      await this.robustClick(storageMigrationsLink);
      await this.page.waitForLoadState('domcontentloaded');
    } catch {
      await this.goTo('/k8s/all-namespaces/storagemigrations');
      await this.page.waitForLoadState('domcontentloaded');
    }
  }

  async verifyStorageMigrationPlansPageLoaded(): Promise<boolean> {
    try {
      const heading = this.locator(
        'h1:has-text("Storage migration plans"), h1:has-text("StorageMigrationPlan"), h1:has-text("storage migration")',
      );
      await heading.first().waitFor({ state: 'visible', timeout: TestTimeouts.DEFAULT });
      return true;
    } catch {
      return false;
    }
  }

  async isStorageMigrationEmptyStateVisible(): Promise<boolean> {
    try {
      const emptyState = this.locator(
        '[data-test="empty-message"], div:has-text("No storage migration found"), div:has-text("No StorageMigrationPlan")',
      );
      return await emptyState
        .first()
        .isVisible({ timeout: TestTimeouts.SHORT_WAIT })
        .catch(() => false);
    } catch {
      return false;
    }
  }

  async isStorageMigrationContentVisible(): Promise<boolean> {
    const hasEmptyState = await this.isStorageMigrationEmptyStateVisible();
    if (hasEmptyState) return true;

    const rows = this.locator('[data-test="storage-migrations-list"] tbody tr, tbody tr');
    return (await rows.count().catch(() => 0)) > 0;
  }

  async getStorageMigrationPlansColumnNames(): Promise<string[]> {
    const columnMgmtBtn = this.locator('[data-test="manage-columns"]');
    await columnMgmtBtn.waitFor({ state: 'visible', timeout: TestTimeouts.ELEMENT_WAIT });
    await this.robustClick(columnMgmtBtn);

    const dialog = this.page.getByRole('dialog', { name: /Manage columns/i });
    await dialog.waitFor({ state: 'visible', timeout: TestTimeouts.ELEMENT_WAIT });

    const listItems = dialog.locator('[role="list"] li');
    const count = await listItems.count();
    const names: string[] = [];
    for (let i = 0; i < count; i++) {
      const text = await listItems.nth(i).textContent();
      if (text?.trim()) names.push(text.trim());
    }

    const cancelBtn = dialog.locator('button:has-text("Cancel")');
    await cancelBtn.click();

    return names;
  }

  async getMigrationPlanProgress(): Promise<{ percentage: number; title: string }> {
    const statusCell = this.locator('[data-test^="storage-migration-status-"]').first();
    await statusCell.waitFor({ state: 'visible', timeout: TestTimeouts.DEFAULT });

    const progressBar = statusCell.locator('[role="progressbar"]');
    await progressBar.waitFor({ state: 'visible', timeout: TestTimeouts.ELEMENT_WAIT });

    const ariaLabel = (await progressBar.getAttribute('aria-label')) ?? '';
    const ariaValueNow = await progressBar.getAttribute('aria-valuenow');
    const percentage = ariaValueNow ? Number(ariaValueNow) : NaN;

    const titleMatch = ariaLabel.match(/^(.+?):/);
    const title = titleMatch ? titleMatch[1].trim() : ariaLabel;

    return { percentage, title };
  }

  async deleteMigrationPlanFromListAndGetRedirectUrl(): Promise<string> {
    const firstRow = this.locator('tbody tr').first();
    await firstRow.waitFor({ state: 'visible', timeout: TestTimeouts.DEFAULT });

    await this.kebab.openKebabForRow(firstRow);
    await this.kebab.clickMenuItemByText('Delete');
    await this.page.waitForTimeout(TestTimeouts.UI_DELAY_SHORT);

    const confirmButton = this.locator(
      '[data-test="confirm-action"], .pf-v6-c-modal-box__footer button.pf-m-danger, .pf-v6-c-modal-box button.pf-m-danger',
    ).first();
    await confirmButton.waitFor({ state: 'visible', timeout: TestTimeouts.ELEMENT_WAIT });
    await this.robustClick(confirmButton);

    await this.page.waitForLoadState('domcontentloaded');
    await this.page.waitForTimeout(TestTimeouts.UI_DELAY_MEDIUM);

    return this.page.url();
  }
  async isNoDataAlertVisible(): Promise<boolean> {
    try {
      const alert = this.page.getByText('No data to display yet.');
      await alert.waitFor({ state: 'visible', timeout: TestTimeouts.ELEMENT_WAIT });
      return true;
    } catch {
      return false;
    }
  }

  async clickCreateVmLinkInNoDataAlert(): Promise<void> {
    const noDataText = this.page.getByText('No data to display yet.');
    await noDataText.waitFor({ state: 'visible', timeout: TestTimeouts.ELEMENT_WAIT });
    const createVmLink = this.page
      .locator('a, button')
      .filter({ hasText: /^Create VM$/ })
      .first();
    await createVmLink.waitFor({ state: 'visible', timeout: TestTimeouts.ELEMENT_WAIT });
    await this.robustClick(createVmLink);
  }

  async isOverviewAlertFullWidth(): Promise<boolean> {
    return this.metrics.isOverviewAlertFullWidth();
  }

  async isResourceAllocationNoDataVisible(): Promise<boolean> {
    return this.metrics.isResourceAllocationNoDataVisible();
  }

  async isCreateSplitButtonVisible(): Promise<boolean> {
    try {
      const splitBtn = this.locator(
        '[data-test-id="details-actions"] .pf-v6-c-menu-toggle.pf-m-split-button',
      );
      await splitBtn.waitFor({ state: 'visible', timeout: TestTimeouts.ELEMENT_WAIT });
      return true;
    } catch {
      return false;
    }
  }
  async clickLocalClusterInTree(): Promise<void> {
    let treeVisible = await this._treeView
      .waitFor({ state: 'visible', timeout: TestTimeouts.UI_DELAY_MEDIUM })
      .then(() => true)
      .catch(() => false);

    if (!treeVisible) {
      await this.goTo('/k8s/all-namespaces/kubevirt.io~v1~VirtualMachine');
      await this.page.waitForLoadState('domcontentloaded');
      treeVisible = await this._treeView
        .waitFor({ state: 'visible', timeout: TestTimeouts.ELEMENT_WAIT })
        .then(() => true)
        .catch(() => false);
    }

    const treeItem = this._treeView
      .locator('[role="treeitem"]')
      .filter({
        has: this.page.locator('button', { hasText: 'Local cluster' }),
      })
      .first();
    await treeItem.waitFor({ state: 'visible', timeout: TestTimeouts.ELEMENT_WAIT });

    const labelButton = treeItem.locator('button', { hasText: 'Local cluster' }).last();
    await labelButton.waitFor({ state: 'visible', timeout: TestTimeouts.ELEMENT_WAIT });
    await this.robustClick(labelButton);

    const tabOrError = this.page.locator('[role="tab"], :text("Something wrong happened")').first();
    await tabOrError
      .waitFor({ state: 'visible', timeout: TestTimeouts.ELEMENT_WAIT })
      .catch(() => undefined);

    await this.recoverFromErrorBoundaryIfNeeded();
  }

  async clickClusterNodeInTree(clusterName: string): Promise<void> {
    const clusterNode = this._treeView.locator('button', { hasText: clusterName }).first();
    await clusterNode.waitFor({ state: 'visible', timeout: TestTimeouts.ELEMENT_WAIT });
    await this.robustClick(clusterNode);
    await this.page.waitForTimeout(TestTimeouts.UI_DELAY_SHORT);
  }

  async verifyClusterStatusSectionWidgetsVisible(
    timeout = TestTimeouts.ELEMENT_WAIT,
    dataLoadTimeout = TestTimeouts.DEFAULT,
  ): Promise<{ allVisible: boolean; missing: string[] }> {
    return this.metrics.verifyClusterStatusSectionWidgetsVisible(timeout, dataLoadTimeout);
  }

  async getSelectedTabName(timeout = TestTimeouts.ELEMENT_WAIT): Promise<null | string> {
    try {
      const selectedTab = this.locator('[role="tab"][aria-selected="true"]');
      await selectedTab.waitFor({ state: 'visible', timeout });
      return (await selectedTab.textContent())?.trim() ?? null;
    } catch {
      return null;
    }
  }

  async verifyNoErrorBoundary(waitMs = 3000): Promise<boolean> {
    const errorIndicator = this._somethingWrongHappened;
    const hasError = await errorIndicator.isVisible({ timeout: waitMs }).catch(() => false);
    return !hasError;
  }
  async recoverFromErrorBoundaryIfNeeded(timeout = TestTimeouts.ELEMENT_WAIT): Promise<boolean> {
    return this.metrics.recoverFromErrorBoundaryIfNeeded(timeout);
  }

  async captureAcmSearchRequestsForCluster(clusterName: string): Promise<{
    totalSearchRequests: number;
    clusterFilteredRequests: Array<{ kind: string; cluster: string }>;
  }> {
    return this.metrics.captureAcmSearchRequestsForCluster(
      clusterName,
      this.hostTree,
      this.clickClusterNodeInTree.bind(this),
    );
  }

  async mockVmListMetricsResponses(vmMetrics: VmMetricEntry[]): Promise<void> {
    return this.metrics.mockVmListMetricsResponses(vmMetrics);
  }

  async clearVmListMetricsMocks(): Promise<void> {
    return this.metrics.clearVmListMetricsMocks();
  }

  async getVmTableMetricValues(): Promise<
    Array<{ vmName: string; memory: string; cpu: string; network: string }>
  > {
    return this.metrics.getVmTableMetricValues();
  }

  async getClusterUtilizationMetrics(
    timeout = TestTimeouts.DEFAULT,
  ): Promise<{ name: string; percentage: string; hasProgressBar: boolean }[]> {
    return this.metrics.getClusterUtilizationMetrics(timeout);
  }

  async getHealthSectionWidgetsVisibility(
    timeout = TestTimeouts.DEFAULT,
  ): Promise<{ allVisible: boolean; missing: string[] }> {
    return this.metrics.getHealthSectionWidgetsVisibility(timeout);
  }

  async verifyVirtualMachinesHealthSectionWidgetsVisible(
    timeout = TestTimeouts.ELEMENT_WAIT,
  ): Promise<{ allVisible: boolean; missing: string[] }> {
    return this.metrics.verifyVirtualMachinesHealthSectionWidgetsVisible(timeout);
  }

  async expectResourceAllocationDataKeywordsVisible(
    dataLoadTimeout = TestTimeouts.DEFAULT,
  ): Promise<void> {
    return this.metrics.expectResourceAllocationDataKeywordsVisible(dataLoadTimeout);
  }

  async getResourceAllocationChartsVisibility(
    timeout = TestTimeouts.DEFAULT,
  ): Promise<{ count: number; allVisible: boolean }> {
    return this.metrics.getResourceAllocationChartsVisibility(timeout);
  }

  async waitForResourceAllocationChartsVisible(timeout = TestTimeouts.DEFAULT): Promise<void> {
    return this.metrics.waitForResourceAllocationChartsVisible(timeout);
  }

  async verifyResourceAllocationWidgetsVisible(
    timeout = TestTimeouts.ELEMENT_WAIT,
    dataLoadTimeout = TestTimeouts.DEFAULT,
  ): Promise<{ allVisible: boolean; missing: string[] }> {
    return this.metrics.verifyResourceAllocationWidgetsVisible(timeout, dataLoadTimeout);
  }

  async getResourceAllocationCardDisplayedValues(): Promise<{
    runningCount: number;
    vcpu: number;
    memoryMiB: number;
    storageGiB: number;
  }> {
    return this.metrics.getResourceAllocationCardDisplayedValues();
  }

  async checkResourceAllocationCardTextOverflow(): Promise<{
    hasTruncation: boolean;
    cards: { title: string; truncated: boolean; element?: string }[];
  }> {
    return this.metrics.checkResourceAllocationCardTextOverflow();
  }

  async verifyRunningVmsCountInHealthSection(
    namespace: string,
    expectedCount: number,
    timeout = TestTimeouts.ELEMENT_WAIT,
  ): Promise<{ matches: boolean; actualText?: string; message?: string }> {
    return this.metrics.verifyRunningVmsCountInHealthSection(namespace, expectedCount, timeout);
  }

  async clickVmStatusDrillDown(
    namespace: string,
    timeout = TestTimeouts.DEFAULT,
  ): Promise<{ clicked: boolean; url: string }> {
    return this.metrics.clickVmStatusDrillDown(namespace, timeout);
  }
}
