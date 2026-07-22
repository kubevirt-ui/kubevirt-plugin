import BaseComponent from '@/components/shared/base-component';
import NavigationComponent from '@/components/shared/navigation-component';
import type { VmMetricEntry } from '@/data-factories/vm-metrics-mock-factory';
import { buildPrometheusVectorResponse } from '@/data-factories/vm-metrics-mock-factory';
import { TestTimeouts } from '@/utils/test-config';
import type { Page } from '@playwright/test';
import { expect } from '@playwright/test';

export default class VmListOverviewWidgetsComponent extends BaseComponent {
  private static readonly RESOURCE_ALLOCATION_CARD_TITLES = [
    'Virtual Machines',
    'vCPU usage',
    'Memory usage',
    'Storage allocated',
  ] as const;
  private readonly _clusterResourcesCard = this.testId('cluster-resources-card');
  private readonly _clusterStatusWidget = this.testId('cluster-status-widget');
  private readonly _clusterUtilizationWidget = this.testId('cluster-utilization-widget');
  private readonly _guestAgentIssuesWidget = this.testId('guest-agent-issues-widget');
  private readonly _migrationsWidget = this.testId('migrations-widget');
  private readonly _nodeLoadDistributionTitle = this.locator('.pf-v6-c-card__title-text', {
    hasText: 'Node load distribution',
  });
  private readonly _overviewTab = this.locator('button[role="tab"]', { hasText: /^Overview$/ });
  private readonly _resourceAllocationCharts = this.testId('resource-allocation-widget').locator(
    '.resource-allocation-widget__chart',
  );
  private readonly _resourceAllocationWidget = this.testId('resource-allocation-widget');
  private readonly _somethingWrongHappened = this.locator('text=Something wrong happened');
  private readonly _storageMigrationPlansWidget = this.testId('storage-migration-plans-widget');
  private readonly _treeView = this.locator('.pf-v6-c-tree-view');
  private readonly _vmAlertsWidget = this.testId('vm-alerts-widget');
  private readonly _vmListSummary = this.testId('vm-list-summary');
  private readonly _vmListTab = this.locator('button[role="tab"]', {
    hasText: /^Virtual machines$/,
  });

  private readonly _vmStatusesCard = this.testId('vm-statuses-card');

  private readonly nav: NavigationComponent;

  constructor(
    page: Page,
    private readonly hostTree: {
      searchTreeView: (searchText: string) => Promise<void>;
    },
  ) {
    super(page);
    this.nav = new NavigationComponent(page);
  }

  async captureAcmSearchRequestsForCluster(clusterName: string): Promise<{
    totalSearchRequests: number;
    clusterFilteredRequests: Array<{ kind: string; cluster: string }>;
  }> {
    const searchRequests: Array<{ body: string }> = [];

    const handler = (request: {
      method: () => string;
      url: () => string;
      postData: () => string | null;
    }) => {
      if (request.method() === 'POST' && request.url().includes('/proxy/search')) {
        searchRequests.push({ body: request.postData() ?? '' });
      }
    };

    this.page.on('request', handler);

    await this.hostTree.searchTreeView(clusterName);
    await this.clickClusterNodeInTree(clusterName);
    await this.page.waitForTimeout(5000);

    this.page.removeListener('request', handler);

    const clusterFilteredRequests: Array<{ kind: string; cluster: string }> = [];
    for (const req of searchRequests) {
      try {
        const parsed = JSON.parse(req.body);
        const filters = parsed?.variables?.input?.[0]?.filters ?? [];
        const clusterFilter = filters.find(
          (f: { property: string; values: string[] }) =>
            f.property === 'cluster' && f.values?.includes(clusterName),
        );
        if (clusterFilter) {
          const kindFilter = filters.find((f: { property: string }) => f.property === 'kind');
          clusterFilteredRequests.push({
            kind: kindFilter?.values?.[0] ?? 'unknown',
            cluster: clusterName,
          });
        }
      } catch {
        // Silently ignore unparseable POST bodies
      }
    }

    return { totalSearchRequests: searchRequests.length, clusterFilteredRequests };
  }

  async checkResourceAllocationCardTextOverflow(): Promise<{
    hasTruncation: boolean;
    cards: { title: string; truncated: boolean; element?: string }[];
  }> {
    const cards: { title: string; truncated: boolean; element?: string }[] = [];

    for (const title of VmListOverviewWidgetsComponent.RESOURCE_ALLOCATION_CARD_TITLES) {
      const card = this._resourceAllocationWidget.filter({ hasText: title }).first();
      await card.waitFor({ state: 'visible', timeout: TestTimeouts.ELEMENT_WAIT });

      const result = await card.evaluate((el: HTMLElement) => {
        const allElements = Array.from(el.querySelectorAll('*:not(svg):not(svg *)'));
        for (const child of allElements) {
          const he = child as HTMLElement;
          if (he.clientWidth === 0) continue;
          if (he.scrollWidth > he.clientWidth + 2) {
            const style = window.getComputedStyle(he);
            if (style.overflow === 'hidden' || style.overflowX === 'hidden') {
              const hasText = Array.from(he.childNodes).some(
                (n) => n.nodeType === Node.TEXT_NODE && (n.textContent?.trim().length ?? 0) > 0,
              );
              if (hasText) {
                return {
                  truncated: true,
                  element: `<${he.tagName.toLowerCase()} class="${he.className}">`,
                };
              }
            }
          }
        }
        return { truncated: false };
      });

      cards.push({ title, ...result });
    }

    return { hasTruncation: cards.some((c) => c.truncated), cards };
  }

  async clearVmListMetricsMocks(): Promise<void> {
    await this.page.unrouteAll({ behavior: 'ignoreErrors' });
  }

  async clickClusterNodeInTree(clusterName: string): Promise<void> {
    const clusterNode = this._treeView.locator('button', { hasText: clusterName }).first();
    await clusterNode.waitFor({ state: 'visible', timeout: TestTimeouts.ELEMENT_WAIT });
    await this.robustClick(clusterNode);
    await this.page.waitForTimeout(TestTimeouts.UI_DELAY_SHORT);
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

  async clickOverviewTab(): Promise<void> {
    await this._overviewTab.waitFor({ state: 'visible', timeout: TestTimeouts.ELEMENT_WAIT });
    await this.robustClick(this._overviewTab);
    await this.page.waitForTimeout(TestTimeouts.UI_DELAY_SHORT);
  }

  async clickVmListTab(): Promise<void> {
    await this._vmListTab.waitFor({ state: 'visible', timeout: TestTimeouts.ELEMENT_WAIT });
    await this.robustClick(this._vmListTab);
    await this.page.waitForTimeout(TestTimeouts.UI_DELAY_SHORT);
  }

  async clickVmStatusDrillDown(
    namespace: string,
    timeout = TestTimeouts.DEFAULT,
  ): Promise<{ clicked: boolean; url: string }> {
    const candidates = [
      this.locator(`a[href*="status=Running"][href*="tab=vms"][href*="${namespace}"]`).first(),
      this.locator('a[href*="status=Running"][href*="tab=vms"]').first(),
      this.locator(
        `a[href*="rowFilter-status=Running"][href*="tab=vms"][href*="${namespace}"]`,
      ).first(),
      this.locator('a[href*="rowFilter-status"][href*="tab=vms"]').first(),
    ];

    for (const link of candidates) {
      const visible = await link
        .waitFor({ state: 'visible', timeout: timeout / candidates.length })
        .then(() => true)
        .catch(() => false);

      if (visible) {
        await link.click();
        await this.page.waitForTimeout(TestTimeouts.UI_DELAY_SHORT);
        return { clicked: true, url: this.page.url() };
      }
    }

    return { clicked: false, url: this.page.url() };
  }

  async deleteMigrationPlanFromListAndGetRedirectUrl(): Promise<string> {
    const firstRow = this.locator('tbody tr').first();
    await firstRow.waitFor({ state: 'visible', timeout: TestTimeouts.DEFAULT });

    const kebab = firstRow
      .getByTestId('kebab-button')
      .or(firstRow.locator('button[aria-label="Actions"]'));
    await this.robustClick(kebab.first());
    await this.page.waitForTimeout(TestTimeouts.UI_DELAY_SHORT);

    const deleteAction = this.locator(
      '[id="migplan-delete-action"], [data-test-action="Delete"], button:has-text("Delete")',
    ).first();
    await deleteAction.waitFor({ state: 'visible', timeout: TestTimeouts.ELEMENT_WAIT });
    await this.robustClick(deleteAction);
    await this.page.waitForTimeout(TestTimeouts.UI_DELAY_SHORT);

    const confirmButton = this.testId('save-button')
      .or(this.locator('.pf-v6-c-modal-box__footer button.pf-m-danger'))
      .or(this.locator('.pf-v6-c-modal-box button.pf-m-danger'))
      .first();
    await confirmButton.waitFor({ state: 'visible', timeout: TestTimeouts.ELEMENT_WAIT });
    await this.robustClick(confirmButton);

    await this.page.waitForLoadState('domcontentloaded');
    await this.page.waitForTimeout(TestTimeouts.UI_DELAY_MEDIUM);

    return this.page.url();
  }

  async expectResourceAllocationDataKeywordsVisible(
    dataLoadTimeout = TestTimeouts.DEFAULT,
  ): Promise<void> {
    const keywords = ['running', 'vCPU', 'MiB', 'GiB'];
    const contentLocator = this._resourceAllocationWidget.locator('[data-pf-content="true"]');
    const startTime = Date.now();
    while (Date.now() - startTime < dataLoadTimeout) {
      const texts = await contentLocator.allTextContents();
      const combined = texts.join(' ').toLowerCase();
      if (keywords.every((k) => combined.includes(k.toLowerCase()))) {
        return;
      }
      await this.page.waitForTimeout(500);
    }
    const texts = await contentLocator.allTextContents();
    const combined = texts.join(' ').toLowerCase();
    for (const k of keywords) {
      if (!combined.includes(k.toLowerCase())) {
        throw new Error(`Keyword "${k}" not found in resource allocation widget`);
      }
    }
  }

  async getClusterUtilizationMetrics(
    timeout = TestTimeouts.DEFAULT,
  ): Promise<{ name: string; percentage: string; hasProgressBar: boolean }[]> {
    const widget = this._clusterUtilizationWidget;
    await widget.waitFor({ state: 'visible', timeout });

    const bars = widget.locator('.utilization-bar');
    const count = await bars.count();
    const metrics: { name: string; percentage: string; hasProgressBar: boolean }[] = [];

    for (let i = 0; i < count; i++) {
      const bar = bars.nth(i);
      const name = (await bar.locator('.utilization-bar__title').textContent())?.trim() ?? '';
      const percentage =
        (await bar.locator('.utilization-bar__percentage').textContent())?.trim() ?? '';
      const hasProgressBar = (await bar.locator('[role="progressbar"]').count()) > 0;
      metrics.push({ name, percentage, hasProgressBar });
    }

    return metrics;
  }

  async getComputeMigrationStatusCount(
    statusKey: string,
    timeout = TestTimeouts.ELEMENT_WAIT,
  ): Promise<number> {
    try {
      await this._migrationsWidget.waitFor({ state: 'visible', timeout });
      const tile = this._migrationsWidget.getByTestId(`status-count-${statusKey}`);
      const text = await tile.textContent();
      if (!text) return 0;
      const match = text.match(/(\d+)/);
      return match ? parseInt(match[1], 10) : 0;
    } catch {
      return 0;
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

  async getDeschedulerStatus(
    timeout = TestTimeouts.ELEMENT_WAIT,
  ): Promise<{ label: string | null; value: string | null; hasInfoButton: boolean }> {
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

  async getGuestAgentWidgetTitle(timeout = TestTimeouts.ELEMENT_WAIT): Promise<string | null> {
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

  async getHealthSectionWidgetsVisibility(
    timeout = TestTimeouts.DEFAULT,
  ): Promise<{ allVisible: boolean; missing: string[] }> {
    const widgets: { name: string; locator: ReturnType<typeof this.locator> }[] = [
      { name: 'vm-alerts-widget', locator: this._vmAlertsWidget },
      { name: 'vm-statuses-card', locator: this._vmStatusesCard },
      { name: 'guest-agent-issues-widget', locator: this._guestAgentIssuesWidget },
    ];
    const missing: string[] = [];
    for (const { name, locator } of widgets) {
      const visible = await locator
        .waitFor({ state: 'visible', timeout })
        .then(() => true)
        .catch(() => false);
      if (!visible) missing.push(name);
    }
    return { allVisible: missing.length === 0, missing };
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

  async getMigrationStatusSectionTitle(
    timeout = TestTimeouts.ELEMENT_WAIT,
  ): Promise<string | null> {
    try {
      const migrationStatusSection = this.testId('migration-status-section');
      await migrationStatusSection.waitFor({ state: 'visible', timeout });
      const heading = migrationStatusSection.locator('h3').first();
      return await heading.textContent();
    } catch {
      return null;
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

  async getResourceAllocationCardDisplayedValues(): Promise<{
    runningCount: number;
    vcpu: number;
    memoryMiB: number;
    storageGiB: number;
  }> {
    const result = { runningCount: 0, vcpu: 0, memoryMiB: 0, storageGiB: 0 };
    const vmCard = this._resourceAllocationWidget.filter({ hasText: 'Virtual Machines' }).first();
    const vcpuCard = this._resourceAllocationWidget.filter({ hasText: 'vCPU usage' }).first();
    const memoryCard = this._resourceAllocationWidget.filter({ hasText: 'Memory usage' }).first();
    const storageCard = this._resourceAllocationWidget
      .filter({ hasText: 'Storage allocated' })
      .first();

    const vmText = (await vmCard.textContent()) ?? '';
    const runningMatch = vmText.match(/(\d+)\s*running/i);
    if (runningMatch) result.runningCount = parseInt(runningMatch[1], 10);

    const vcpuText = (await vcpuCard.textContent()) ?? '';
    const vcpuMatch = vcpuText.match(/(\d+)\s*vCPU/i) || vcpuText.match(/(\d+)vCPU/i);
    if (vcpuMatch) result.vcpu = parseInt(vcpuMatch[1], 10);

    const memoryText = (await memoryCard.textContent()) ?? '';
    const memoryMatch = memoryText.match(/(\d+(?:\.\d+)?)\s*MiB/i);
    if (memoryMatch) result.memoryMiB = parseFloat(memoryMatch[1]);

    const storageText = (await storageCard.textContent()) ?? '';
    const storageMatch = storageText.match(/(\d+(?:\.\d+)?)\s*GiB/i);
    if (storageMatch) result.storageGiB = parseFloat(storageMatch[1]);

    return result;
  }

  async getResourceAllocationChartsVisibility(
    timeout = TestTimeouts.DEFAULT,
  ): Promise<{ count: number; allVisible: boolean }> {
    const charts = this._resourceAllocationCharts;
    await expect(charts).toHaveCount(4, { timeout });
    let allVisible = true;
    for (let i = 0; i < 4; i++) {
      const visible = await charts.nth(i).isVisible();
      if (!visible) allVisible = false;
    }
    const count = await charts.count();
    return { count, allVisible };
  }

  async getSelectedTabName(timeout = TestTimeouts.ELEMENT_WAIT): Promise<string | null> {
    try {
      const selectedTab = this.locator('[role="tab"][aria-selected="true"]');
      await selectedTab.waitFor({ state: 'visible', timeout });
      return (await selectedTab.textContent())?.trim() ?? null;
    } catch {
      return null;
    }
  }

  async getStorageMigrationPlansColumnNames(): Promise<string[]> {
    const columnMgmtBtn = this.testId('manage-columns');
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

  async getVmTableMetricValues(): Promise<
    Array<{ vmName: string; memory: string; cpu: string; network: string }>
  > {
    const table = this.testId('VirtualMachines table').or(
      this.locator('table[aria-label*="VirtualMachines"]'),
    );
    await table.waitFor({ state: 'visible', timeout: TestTimeouts.DEFAULT });

    const rows = table.locator('tbody tr[data-ouia-component-type="PF6/TableRow"]');
    const count = await rows.count();
    const results: Array<{ vmName: string; memory: string; cpu: string; network: string }> = [];

    for (let i = 0; i < count; i++) {
      const row = rows.nth(i);
      const cells = row.locator('td');
      const cellCount = await cells.count();

      const nameCell = row.locator('td:nth-child(2)');
      const vmName = (await nameCell.locator('a').textContent())?.trim() ?? '';

      const memoryCell = cells.nth(cellCount >= 9 ? 5 : 4);
      const cpuCell = cells.nth(cellCount >= 9 ? 6 : 5);
      const networkCell = cells.nth(cellCount >= 9 ? 7 : 6);

      results.push({
        vmName,
        memory: (await memoryCell.textContent())?.trim() ?? '-',
        cpu: (await cpuCell.textContent())?.trim() ?? '-',
        network: (await networkCell.textContent())?.trim() ?? '-',
      });
    }

    return results;
  }
  async isClusterStatusWidgetPresent(timeout = 5000): Promise<boolean> {
    return await this._clusterStatusWidget
      .waitFor({ state: 'attached', timeout })
      .then(() => true)
      .catch(() => false);
  }

  async isCreateSplitButtonVisible(): Promise<boolean> {
    try {
      const splitBtn = this.locator('.pf-v6-c-menu-toggle.pf-m-split-button');
      await splitBtn.waitFor({ state: 'visible', timeout: TestTimeouts.ELEMENT_WAIT });
      return true;
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

  async isNoDataAlertVisible(): Promise<boolean> {
    try {
      const alert = this.page.getByText('No data to display yet.');
      await alert.waitFor({ state: 'visible', timeout: TestTimeouts.ELEMENT_WAIT });
      return true;
    } catch {
      return false;
    }
  }

  async isNodeLoadDistributionVisible(timeout = TestTimeouts.ELEMENT_WAIT): Promise<boolean> {
    return await this._nodeLoadDistributionTitle
      .waitFor({ state: 'visible', timeout })
      .then(() => true)
      .catch(() => false);
  }
  async isOverviewAlertFullWidth(): Promise<boolean> {
    try {
      const alertText = this.page.getByText('No data to display yet.');
      await alertText.waitFor({ state: 'visible', timeout: TestTimeouts.ELEMENT_WAIT });

      return await alertText.evaluate((el) => {
        let alertContainer = (el as HTMLElement).closest(
          '[class*="c-alert"]',
        ) as HTMLElement | null;
        if (!alertContainer) alertContainer = el.parentElement;
        if (!alertContainer) return false;

        const alertWidth = alertContainer.getBoundingClientRect().width;
        const tabPanel = (el as HTMLElement).closest('[role="tabpanel"]') as HTMLElement | null;
        if (!tabPanel) return false;

        const panelWidth = tabPanel.getBoundingClientRect().width;
        return alertWidth / panelWidth > 0.85;
      });
    } catch {
      return false;
    }
  }

  async isOverviewSectionExpanded(sectionDataTest: string): Promise<boolean> {
    const toggle = this.testId(sectionDataTest).locator(
      '.pf-v6-c-expandable-section__toggle button',
    );
    const ariaExpanded = await toggle.getAttribute('aria-expanded').catch(() => null);
    return ariaExpanded === 'true';
  }

  async isOverviewTabSelected(): Promise<boolean> {
    try {
      await this._overviewTab.waitFor({ state: 'visible', timeout: TestTimeouts.ELEMENT_WAIT });
      return (await this._overviewTab.getAttribute('aria-selected')) === 'true';
    } catch {
      return false;
    }
  }
  async isResourceAllocationNoDataVisible(): Promise<boolean> {
    try {
      const section = this.testId('resource-allocation-section').or(
        this.locator('text=Virtualization resource allocation'),
      );
      await section.first().waitFor({ state: 'visible', timeout: TestTimeouts.ELEMENT_WAIT });
      const noData = section.first().getByText('No data available');
      const dashIndicator = section.first().getByText('–').or(section.first().getByText('—'));
      return (await noData.count()) > 0 || (await dashIndicator.count()) > 0;
    } catch {
      return false;
    }
  }

  async isStorageMigrationContentVisible(): Promise<boolean> {
    const hasEmptyState = await this.isStorageMigrationEmptyStateVisible();
    if (hasEmptyState) return true;

    const rows = this.testId('storage-migrations-list').locator('tbody tr, tbody tr');
    return (await rows.count().catch(() => 0)) > 0;
  }
  async isStorageMigrationEmptyStateVisible(): Promise<boolean> {
    try {
      const emptyState = this.testId('empty-message')
        .or(this.locator('div:has-text("No storage migration found")'))
        .or(this.locator('div:has-text("No StorageMigrationPlan")'))
        .or(this.locator('div:has-text("don\'t have any storage migrations")'));
      return await emptyState
        .first()
        .isVisible({ timeout: TestTimeouts.SHORT_WAIT })
        .catch(() => false);
    } catch {
      return false;
    }
  }
  async isStorageMigrationPlansVisible(timeout = TestTimeouts.ELEMENT_WAIT): Promise<boolean> {
    return await this._storageMigrationPlansWidget
      .waitFor({ state: 'visible', timeout })
      .then(() => true)
      .catch(() => false);
  }

  async isSummaryNotVisible(): Promise<boolean> {
    return !(await this._vmListSummary.isVisible().catch(() => false));
  }

  async isSummaryVisible(): Promise<boolean> {
    return await this._vmListSummary.isVisible().catch(() => false);
  }

  async mockVmListMetricsResponses(vmMetrics: VmMetricEntry[]): Promise<void> {
    await this.page.route('**/api/prometheus/api/v1/query*', async (route) => {
      const query = decodeURIComponent(route.request().url());

      if (query.includes('kubevirt_vmi_memory_used_bytes')) {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(buildPrometheusVectorResponse(vmMetrics, (e) => e.memoryBytes)),
        });
        return;
      }

      if (query.includes('kubevirt_vmi_cpu_usage_seconds_total')) {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(buildPrometheusVectorResponse(vmMetrics, (e) => e.cpuRate)),
        });
        return;
      }

      if (
        query.includes('kubevirt_vmi_network_transmit_bytes_total') ||
        query.includes('kubevirt_vmi_network_receive_bytes_total')
      ) {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(buildPrometheusVectorResponse(vmMetrics, (e) => e.networkRate)),
        });
        return;
      }

      await route.fallback();
    });
  }

  async navigateToStorageMigrationPlans(namespace: string): Promise<void> {
    const crdRef =
      'migrations.kubevirt.io~v1alpha1~MultiNamespaceVirtualMachineStorageMigrationPlan';
    await this.goTo(`/k8s/ns/${namespace}/${crdRef}`);
    await this.page.waitForLoadState('domcontentloaded');
  }

  async navigateToStorageMigrationPlansViaUI(): Promise<void> {
    await this.nav.clickNavVirtualMachines();
    await this.page.waitForLoadState('domcontentloaded');
    const migrationNavBtn = this.page.locator('nav button').filter({ hasText: /^Migration$/ });
    await migrationNavBtn.waitFor({ state: 'visible', timeout: TestTimeouts.DEFAULT });
    const isExpanded = (await migrationNavBtn.getAttribute('aria-expanded')) === 'true';
    if (!isExpanded) {
      await migrationNavBtn.click();
      await this.page.waitForTimeout(TestTimeouts.UI_DELAY_SHORT);
    }
    const storageMigrationsLink = this.page.getByTestId('storagemigrations-nav-item');
    await storageMigrationsLink.waitFor({
      state: 'visible',
      timeout: TestTimeouts.ELEMENT_WAIT,
    });
    await this.robustClick(storageMigrationsLink);
    await this.page.waitForLoadState('domcontentloaded');
  }

  async recoverFromErrorBoundaryIfNeeded(timeout = TestTimeouts.ELEMENT_WAIT): Promise<boolean> {
    const errorIndicator = this._somethingWrongHappened;
    const hasError = await errorIndicator
      .waitFor({ state: 'visible', timeout: 3000 })
      .then(() => true)
      .catch(() => false);

    if (!hasError) return false;

    const currentUrl = new URL(this.page.url());
    const tabParam = currentUrl.searchParams.get('tab');
    const vmUrl = new URL('/k8s/all-namespaces/kubevirt.io~v1~VirtualMachine', currentUrl.origin);
    if (tabParam) vmUrl.searchParams.set('tab', tabParam);

    await this.page.goto(vmUrl.toString(), { waitUntil: 'domcontentloaded', timeout });
    await this.page.waitForSelector('[role="tab"]', { state: 'visible', timeout });
    await this.page.waitForTimeout(TestTimeouts.UI_DELAY_SHORT);
    return true;
  }

  async toggleOverviewSection(sectionDataTest: string): Promise<void> {
    const toggle = this.testId(sectionDataTest).locator(
      '.pf-v6-c-expandable-section__toggle button',
    );
    await toggle.waitFor({ state: 'visible', timeout: TestTimeouts.ELEMENT_WAIT });
    await toggle.click();
    await this.page.waitForTimeout(TestTimeouts.UI_DELAY_SHORT);
  }

  async toggleSummary(): Promise<boolean> {
    await this.locator(
      '.pf-v6-c-expandable-section__toggle:has(.vm-list-summary__expand-section-toggle)',
    ).click();
    await this.page.waitForTimeout(TestTimeouts.UI_DELAY_SHORT);
    return await this._vmListSummary.isVisible().catch(() => false);
  }

  async verifyClusterStatusSectionWidgetsVisible(
    timeout = TestTimeouts.ELEMENT_WAIT,
    dataLoadTimeout = TestTimeouts.DEFAULT,
  ): Promise<{ allVisible: boolean; missing: string[] }> {
    await this._clusterStatusWidget.waitFor({ state: 'visible', timeout });
    const widgets: { name: string; locator: ReturnType<typeof this.locator> }[] = [
      {
        name: 'openshift-virtualization-widget',
        locator: this.testId('openshift-virtualization-widget'),
      },
      { name: 'cluster-resources-card', locator: this._clusterResourcesCard },
      { name: 'migrations-widget', locator: this._migrationsWidget },
      {
        name: 'cluster-utilization-widget',
        locator: this._clusterUtilizationWidget,
      },
      {
        name: '.two-column-card .distribution-bar-chart',
        locator: this.locator('.two-column-card .distribution-bar-chart'),
      },
      {
        name: '.two-column-card .status-score-list',
        locator: this.locator('.two-column-card .status-score-list'),
      },
    ];
    const missing: string[] = [];
    for (const { name, locator } of widgets) {
      const visible = await locator
        .waitFor({ state: 'visible', timeout })
        .then(() => true)
        .catch(() => false);
      if (!visible) missing.push(name);
    }
    if (missing.length > 0) return { allVisible: false, missing };

    await this._clusterResourcesCard
      .locator('.cluster-resources-card__tile-count')
      .first()
      .waitFor({ state: 'visible', timeout: dataLoadTimeout })
      .catch(() => undefined);
    const countsVisible = await this._clusterResourcesCard
      .locator('.cluster-resources-card__tile-count')
      .first()
      .isVisible()
      .catch(() => false);
    if (!countsVisible) missing.push('cluster-resources-card (data not loaded)');

    return { allVisible: missing.length === 0, missing };
  }

  async verifyNoErrorBoundary(waitMs = 3000): Promise<boolean> {
    const errorIndicator = this._somethingWrongHappened;
    const hasError = await errorIndicator.isVisible({ timeout: waitMs }).catch(() => false);
    return !hasError;
  }

  async verifyResourceAllocationWidgetsVisible(
    timeout = TestTimeouts.ELEMENT_WAIT,
    dataLoadTimeout = TestTimeouts.DEFAULT,
  ): Promise<{ allVisible: boolean; missing: string[] }> {
    const missing: string[] = [];
    const dataPatterns: { title: string; pattern: RegExp }[] = [
      { title: 'Virtual Machines', pattern: /\d+\s*running/i },
      { title: 'vCPU usage', pattern: /\d+\s*vCPU/i },
      { title: 'Memory usage', pattern: /\d+(?:\.\d+)?\s*(?:MiB|GiB|TiB)/i },
      { title: 'Storage allocated', pattern: /\d+(?:\.\d+)?\s*(?:MiB|GiB|TiB)/i },
    ];
    for (const { title, pattern } of dataPatterns) {
      const card = this._resourceAllocationWidget.filter({ hasText: title }).first();
      const visible = await card
        .waitFor({ state: 'visible', timeout })
        .then(() => true)
        .catch(() => false);
      if (!visible) {
        missing.push(title);
        continue;
      }
      const dataLoaded = await card
        .getByText(pattern)
        .waitFor({ state: 'visible', timeout: dataLoadTimeout })
        .then(() => true)
        .catch(() => false);
      if (!dataLoaded) missing.push(`${title} (data not loaded)`);
    }
    return { allVisible: missing.length === 0, missing };
  }

  async verifyRunningVmsCountInHealthSection(
    namespace: string,
    expectedCount: number,
    timeout = TestTimeouts.ELEMENT_WAIT,
  ): Promise<{ matches: boolean; actualText?: string; message?: string }> {
    const newFormatLink = this.locator(`a[href*="status=Running"][href*="tab=vms"]`);
    const legacyLink = this.locator(
      `a[href*="/k8s/ns/${namespace}/"][href*="rowFilter-status=Running"][href*="tab=vms"]`,
    );
    try {
      const link = (await newFormatLink.count()) > 0 ? newFormatLink : legacyLink;
      await link.first().waitFor({ state: 'visible', timeout });
      const text = (await link.first().textContent())?.trim() ?? '';
      const actualCount = parseInt(text, 10);
      const matches = !Number.isNaN(actualCount) && actualCount === expectedCount;
      return {
        matches,
        actualText: text,
        message: matches
          ? undefined
          : `Running VMs link text "${text}" does not match expected count ${expectedCount}`,
      };
    } catch (error: unknown) {
      return {
        matches: false,
        message:
          error instanceof Error
            ? error.message
            : `Running VMs link not found for namespace ${namespace}`,
      };
    }
  }

  async verifyStorageMigrationPlansPageLoaded(): Promise<boolean> {
    try {
      const heading = this.locator(
        'h1:has-text("Storage MigrationPlans"), h1:has-text("Storage migration plans")',
      );
      await heading.first().waitFor({ state: 'visible', timeout: TestTimeouts.DEFAULT });
      return true;
    } catch {
      return false;
    }
  }

  async verifyVirtualMachinesHealthSectionWidgetsVisible(
    timeout = TestTimeouts.ELEMENT_WAIT,
  ): Promise<{ allVisible: boolean; missing: string[] }> {
    await this.page.waitForLoadState('load');
    await this.page.waitForTimeout(TestTimeouts.UI_DELAY_EXTRA);
    const missing: string[] = [];

    const alertsVisible = await this._vmAlertsWidget
      .waitFor({ state: 'visible', timeout })
      .then(() => true)
      .catch(() => false);
    if (!alertsVisible) missing.push('vm-alerts-widget');

    const statusesVisible = await this._vmStatusesCard
      .waitFor({ state: 'visible', timeout })
      .then(() => true)
      .catch(() => false);
    if (!statusesVisible) missing.push('vm-statuses-card');

    const guestVisible = await this._guestAgentIssuesWidget
      .waitFor({ state: 'visible', timeout })
      .then(() => true)
      .catch(() => false);
    if (!guestVisible) missing.push('guest-agent-issues-widget');

    return { allVisible: missing.length === 0, missing };
  }

  async waitForResourceAllocationChartsVisible(timeout = TestTimeouts.DEFAULT): Promise<void> {
    const charts = this._resourceAllocationCharts;
    await expect(charts).toHaveCount(4, { timeout });
    for (let i = 0; i < 4; i++) {
      await charts.nth(i).waitFor({ state: 'visible', timeout });
      await expect(charts.nth(i)).toBeVisible();
    }
  }
}
