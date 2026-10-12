import BaseComponent from '@/components/shared/base-component';
import VmOverviewTabResourceHealthComponent from '@/components/vm/vm-overview-tab-resource-health-component';
import type { VmMetricEntry } from '@/data-factories/vm-metrics-mock-factory';
import { buildPrometheusVectorResponse } from '@/data-factories/vm-metrics-mock-factory';
import { TestTimeouts } from '@/utils/test-config';
import type { Page } from '@playwright/test';

export default class VmOverviewTabComponent extends BaseComponent {
  private static readonly _USER_SETTINGS_URL =
    '**/api/kubernetes/api/v1/namespaces/openshift-cnv/configmaps/kubevirt-user-settings';

  private static readonly _VM_LIST_PATH = '/k8s/all-namespaces/kubevirt.io~v1~VirtualMachine';
  private readonly _clusterStatusWidget = this.testId('cluster-status-widget');
  private readonly _filterToolbar = this.locator('#filter-toolbar');
  private readonly _filterToolbarProjectButton = this._filterToolbar.locator('button', {
    hasText: 'Project',
  });
  private readonly _guestAgentIssuesWidget = this.testId('guest-agent-issues-widget');
  private readonly _migrationsWidget = this.testId('migrations-widget');
  private readonly _nodeLoadDistributionTitle = this.locator('.pf-v6-c-card__title-text', {
    hasText: 'Node load distribution',
  });
  private readonly _overviewTab = this.locator('button[role="tab"]', { hasText: /^Overview$/ });
  private readonly _roleMenuitem = this.locator('[role="menuitem"]');
  private readonly _storageMigrationPlansWidget = this.testId('storage-migration-plans-widget');

  private readonly _vmListSummary = this.testId('vm-list-summary');

  readonly resourceHealth: VmOverviewTabResourceHealthComponent;

  constructor(page: Page) {
    super(page);
    this.resourceHealth = new VmOverviewTabResourceHealthComponent(page);
  }

  async checkResourceAllocationCardTextOverflow(): Promise<{
    hasTruncation: boolean;
    cards: { title: string; truncated: boolean; element?: string }[];
  }> {
    return this.resourceHealth.checkResourceAllocationCardTextOverflow();
  }

  async clearEmptyStateMocks(): Promise<void> {
    await this.page.unrouteAll();
  }

  async clearVmListMetricsMocks(): Promise<void> {
    await this.page.unrouteAll({ behavior: 'ignoreErrors' });
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

  async clickOverviewTab(): Promise<void> {
    await this._overviewTab.waitFor({ state: 'visible', timeout: TestTimeouts.ELEMENT_WAIT });
    await this.robustClick(this._overviewTab);
    await this.page.waitForTimeout(TestTimeouts.UI_DELAY_SHORT);
  }

  async clickViewAllLink(
    hrefPattern: string,
    timeout = TestTimeouts.ELEMENT_WAIT,
  ): Promise<{ clicked: boolean; url: string }> {
    try {
      const link = this.locator(`a:has-text("View all")[href*="${hrefPattern}"]`).first();
      await link.waitFor({ state: 'visible', timeout });
      await link.click();
      await this.page.waitForLoadState('domcontentloaded');
      return { clicked: true, url: this.page.url() };
    } catch {
      return { clicked: false, url: this.page.url() };
    }
  }

  async clickViewAllLinkAndVerifyInternalNavigation(
    hrefPattern: string,
    timeout = TestTimeouts.ELEMENT_WAIT,
  ): Promise<{ navigated: boolean; url: string; openedNewTab: boolean }> {
    try {
      const link = this.locator(`a:has-text("View all")[href*="${hrefPattern}"]`).first();
      await link.waitFor({ state: 'visible', timeout });

      const pagesBefore = this.page.context().pages().length;
      const urlBefore = this.page.url();

      await link.click();
      await this.page.waitForLoadState('domcontentloaded');
      await this.page.waitForTimeout(TestTimeouts.UI_DELAY_SHORT);

      const pagesAfter = this.page.context().pages().length;
      const urlAfter = this.page.url();

      return {
        navigated: urlAfter !== urlBefore,
        url: urlAfter,
        openedNewTab: pagesAfter > pagesBefore,
      };
    } catch {
      return { navigated: false, url: this.page.url(), openedNewTab: false };
    }
  }

  async clickVmStatusDrillDown(
    namespace: string,
    timeout = TestTimeouts.DEFAULT,
  ): Promise<{ clicked: boolean; url: string }> {
    return this.resourceHealth.clickVmStatusDrillDown(namespace, timeout);
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
    return this.resourceHealth.expectResourceAllocationDataKeywordsVisible(dataLoadTimeout);
  }

  async filterByInstanceType(instanceType: string, check = true) {
    const statusFilterButton = this.locator('#filter-toolbar button', {
      hasText: 'Status',
    });
    await statusFilterButton.waitFor({
      state: 'visible',
      timeout: TestTimeouts.ELEMENT_WAIT,
    });
    await this.robustClick(statusFilterButton);
    const instanceTypeFilter = this.locator(`[data-test-row-filter="${instanceType}"]`).locator(
      'input[type="checkbox"]',
    );
    await instanceTypeFilter.scrollIntoViewIfNeeded();
    const isChecked = await instanceTypeFilter.isChecked();
    if (check !== isChecked) {
      await instanceTypeFilter.click({ force: true });
    }
    await this.page.waitForTimeout(TestTimeouts.UI_FILTER_APPLY);
  }

  async filterByIpAddress(ipPrefix: string) {
    const statusFilterButton = this.locator('#filter-toolbar button', {
      hasText: 'Status',
    });
    await statusFilterButton.waitFor({
      state: 'visible',
      timeout: TestTimeouts.ELEMENT_WAIT,
    });
    await this.robustClick(statusFilterButton);
    await this.locator('button:has-text("Name")').click();
    await this.page.waitForTimeout(TestTimeouts.UI_DELAY_SHORT);
    await this.locator('button:has-text("IP Address")').click();
    await this.page.waitForTimeout(TestTimeouts.UI_DELAY_SHORT);
    const filterInput = this.testId('filter-input');
    await filterInput.clear();
    await filterInput.fill(ipPrefix);
    await filterInput.press('Enter');
    await this.page.waitForTimeout(TestTimeouts.UI_ACTION_COMPLETE);
  }

  async filterByOs(osName: string) {
    const osFilterButton = this.locator('#filter-toolbar button', {
      hasText: 'Operating system',
    });
    await osFilterButton.waitFor({ state: 'visible', timeout: TestTimeouts.ELEMENT_WAIT });
    await this.robustClick(osFilterButton);
    const osFilter = this.locator('#checkbox-select li', { hasText: osName });
    await this.robustClick(osFilter);
  }

  async filterByStatus(status: string) {
    const statusFilterButton = this.locator('#filter-toolbar button', {
      hasText: 'Status',
    });
    await statusFilterButton.waitFor({
      state: 'visible',
      timeout: TestTimeouts.ELEMENT_WAIT,
    });
    await this.robustClick(statusFilterButton);
    const statusFilter = this.locator('#checkbox-select li', { hasText: status });
    await this.robustClick(statusFilter);
  }

  async getClusterUtilizationMetrics(
    timeout = TestTimeouts.DEFAULT,
  ): Promise<{ name: string; percentage: string; hasProgressBar: boolean }[]> {
    return this.resourceHealth.getClusterUtilizationMetrics(timeout);
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

  async getCreateSplitButtonDropdownOptions(): Promise<string[]> {
    try {
      const toggle = this.testId('item-create');
      await this.robustClick(toggle);
      await this.page.waitForTimeout(TestTimeouts.UI_DELAY_SHORT);
      const items = this._roleMenuitem;
      const texts = await items.allTextContents();
      await this.page.keyboard.press('Escape');
      return texts.map((t) => t.trim()).filter(Boolean);
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

  async getEmptyStateBodyText(): Promise<string> {
    try {
      const body = this.locator('.pf-v6-c-empty-state__body');
      await body.first().waitFor({ state: 'visible', timeout: TestTimeouts.ELEMENT_WAIT });
      return (await body.allTextContents()).join(' ');
    } catch {
      return '';
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
    return this.resourceHealth.getHealthSectionWidgetsVisibility(timeout);
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

  async getOnboardingPopoverHeaderText(): Promise<string> {
    try {
      const header = this.page.locator('.pf-v6-c-popover__title-text');
      await header.waitFor({ state: 'visible', timeout: TestTimeouts.DEFAULT });
      return (await header.textContent())?.trim() ?? '';
    } catch {
      return '';
    }
  }

  async getOverviewViewAllLinks(
    timeout = TestTimeouts.ELEMENT_WAIT,
  ): Promise<{ section: string; href: string; visible: boolean }[]> {
    return this.resourceHealth.getOverviewViewAllLinks(timeout);
  }

  async getResourceAllocationCardDisplayedValues(): Promise<{
    runningCount: number;
    vcpu: number;
    memoryMiB: number;
    storageGiB: number;
  }> {
    return this.resourceHealth.getResourceAllocationCardDisplayedValues();
  }

  async getResourceAllocationChartsVisibility(
    timeout = TestTimeouts.DEFAULT,
  ): Promise<{ count: number; allVisible: boolean }> {
    return this.resourceHealth.getResourceAllocationChartsVisibility(timeout);
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

  async getStatusScoreItemTooltipInfo(timeout = TestTimeouts.ELEMENT_WAIT): Promise<{
    itemCount: number;
    checkedItem: { text: string; tooltipText: string | null } | null;
  }> {
    return this.resourceHealth.getStatusScoreItemTooltipInfo(timeout);
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

  async isAdvancedSearchNoResultsVisible(): Promise<boolean> {
    try {
      await this.page.waitForTimeout(TestTimeouts.UI_DELAY_SHORT);

      const emptyMessages = [
        'No VirtualMachines found',
        'No results found',
        'No results match',
        'No resources found',
      ];
      for (const msg of emptyMessages) {
        const loc = this.page.getByText(msg, { exact: false });
        const visible = await loc
          .first()
          .isVisible()
          .catch(() => false);
        if (visible) return true;
      }

      const tableBody = this.page
        .locator('table tbody tr')
        .or(this.page.getByTestId('search-results'));
      const rowCount = await tableBody.count().catch(() => 0);
      if (rowCount === 0) return true;

      const emptyState = this.page.locator(
        '.VirtualMachineEmptyState, .pf-v6-c-empty-state, .pf-c-empty-state, .loading-box',
      );
      return await emptyState
        .first()
        .isVisible()
        .catch(() => false);
    } catch {
      return false;
    }
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

  async isEmptyStateCreateButtonVisible(): Promise<boolean> {
    try {
      const btn = this.locator('.pf-v6-c-empty-state').locator('[data-test="item-create"]');
      await btn.waitFor({ state: 'visible', timeout: TestTimeouts.ELEMENT_WAIT });
      return true;
    } catch {
      return false;
    }
  }

  async isGuidedTourPopoverVisible(
    timeout: number = TestTimeouts.UI_VISIBILITY_QUICK,
  ): Promise<boolean> {
    try {
      const tourPopover = this.locator('.kv-tour-popover');
      await tourPopover.waitFor({ state: 'visible', timeout });
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

  async isNoVMsMessageNotVisible(): Promise<boolean> {
    const noVMsMessage = this.locator('text=No VirtualMachines found');
    return !(await noVMsMessage.isVisible().catch(() => false));
  }

  async isNoVMsMessageVisible(): Promise<boolean> {
    try {
      const noVMsMessage = this.locator(
        '.pf-v6-c-empty-state__title, .pf-v6-c-empty-state h1, .pf-v6-c-empty-state h3, .pf-v6-c-empty-state h4',
      ).filter({ hasText: /no virtual ?machines|don.*t have any virtual ?machines/i });
      await noVMsMessage.first().waitFor({ state: 'visible', timeout: TestTimeouts.ELEMENT_WAIT });
      return true;
    } catch {
      return false;
    }
  }

  async isOnboardingPopoverVisible(
    timeout: number = TestTimeouts.UI_VISIBILITY_QUICK,
  ): Promise<boolean> {
    try {
      const popover = this.page.getByTestId('onboarding-popover');
      await popover.waitFor({ state: 'visible', timeout });
      return true;
    } catch {
      return false;
    }
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

  async isProjectHintVisible(timeout: number = TestTimeouts.ELEMENT_WAIT): Promise<boolean> {
    try {
      const hint = this.page.getByText("Don't have a project yet?");
      await hint.waitFor({ state: 'visible', timeout });
      return true;
    } catch {
      return false;
    }
  }

  async isResourceAllocationNoDataVisible(): Promise<boolean> {
    return this.resourceHealth.isResourceAllocationNoDataVisible();
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

  async mockConsoleGuidedTourIncomplete(username = 'kubeadmin'): Promise<void> {
    const configMapUrl = `**/api/kubernetes/api/v1/namespaces/openshift-console-user-settings/configmaps/user-settings-${username}`;
    const guidedTour = {
      admin: { completed: false },
      dev: { completed: false },
      'virtualization-perspective': { completed: false },
    };
    const configMapBody = {
      apiVersion: 'v1',
      kind: 'ConfigMap',
      metadata: {
        name: `user-settings-${username}`,
        namespace: 'openshift-console-user-settings',
      },
      data: {
        'console.guidedTour': JSON.stringify(guidedTour),
      },
    };

    await this.page.route(configMapUrl, async (route) => {
      const method = route.request().method();
      if (method === 'GET' || method === 'PATCH') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(configMapBody),
        });
        return;
      }
      await route.fallback();
    });
  }

  async mockProjectCreatePermission(allowed: boolean): Promise<void> {
    await this.page.route(
      '**/apis/authorization.k8s.io/v1/selfsubjectaccessreviews',
      async (route) => {
        const request = route.request();
        if (request.method() !== 'POST') {
          await route.fallback();
          return;
        }

        let body: Record<string, unknown> | null = null;
        try {
          body = JSON.parse(request.postData() || '{}') as Record<string, unknown>;
        } catch {
          await route.fallback();
          return;
        }

        const spec = (body?.spec as Record<string, unknown>) || {};
        const resourceAttrs =
          (spec.resourceAttributes as Record<string, string>) ||
          (spec.nonResourceAttributes as Record<string, string>);

        if (resourceAttrs?.resource === 'projectrequests' && resourceAttrs?.verb === 'create') {
          await route.fulfill({
            status: 201,
            contentType: 'application/json',
            body: JSON.stringify({
              apiVersion: 'authorization.k8s.io/v1',
              kind: 'SelfSubjectAccessReview',
              status: { allowed },
            }),
          });
          return;
        }

        await route.fallback();
      },
    );
  }

  async mockUserSettings(settings: Record<string, unknown>): Promise<void> {
    const configMapUrl = VmOverviewTabComponent._USER_SETTINGS_URL;

    await this.page.unroute(configMapUrl);

    const serialized = JSON.stringify(settings);

    await this.page.route(configMapUrl, async (route) => {
      const method = route.request().method();
      if (method === 'GET' || method === 'PATCH') {
        const real = await route.fetch();
        let body: Record<string, unknown> = {};
        try {
          body = await real.json();
        } catch {
          body = {
            apiVersion: 'v1',
            kind: 'ConfigMap',
            metadata: { name: 'kubevirt-user-settings', namespace: 'openshift-cnv' },
            data: {},
          };
        }
        const existingData = (body['data'] as Record<string, string>) ?? {};
        const patchedData: Record<string, string> = {};
        for (const key of Object.keys(existingData)) {
          patchedData[key] = serialized;
        }
        if (Object.keys(patchedData).length === 0) {
          patchedData['kube-admin'] = serialized;
        }
        body['data'] = patchedData;
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(body),
        });
        return;
      }
      await route.fallback();
    });
  }

  async mockUserSettingsAndNavigate(settings: Record<string, unknown>): Promise<void> {
    await this.mockUserSettings(settings);
    await this.goTo(VmOverviewTabComponent._VM_LIST_PATH);
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
      const storageMigrationsLink = this.page.getByTestId('storagemigrations-nav-item');
      await storageMigrationsLink.waitFor({
        state: 'visible',
        timeout: TestTimeouts.ELEMENT_WAIT,
      });
      await this.robustClick(storageMigrationsLink);
      await this.page.waitForLoadState('domcontentloaded');
    } catch {
      const crdRef =
        'migrations.kubevirt.io~v1alpha1~MultiNamespaceVirtualMachineStorageMigrationPlan';
      await this.goTo(`/k8s/all-namespaces/${crdRef}`);
      await this.page.waitForLoadState('domcontentloaded');
    }
  }

  async openProjectFilter(): Promise<void> {
    await this._filterToolbarProjectButton.waitFor({
      state: 'visible',
      timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
    });
    await this.robustClick(this._filterToolbarProjectButton);
  }

  async selectProjectInFilterMenu(projectName: string): Promise<void> {
    const menuitem = this._roleMenuitem.filter({ hasText: projectName }).first();
    await menuitem.waitFor({ state: 'visible', timeout: TestTimeouts.UI_ELEMENT_VISIBILITY });
    await menuitem.click({ force: true });
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

  async verifyClusterAndProjectFilterButtonsVisible(): Promise<boolean> {
    try {
      await this._filterToolbar.waitFor({
        state: 'visible',
        timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
      });
      await this._filterToolbar
        .locator('button', {
          hasText: 'Cluster',
        })
        .waitFor({
          state: 'visible',
          timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
        });
      await this._filterToolbarProjectButton.waitFor({
        state: 'visible',
        timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
      });
      return true;
    } catch {
      return false;
    }
  }

  async verifyClusterStatusSectionWidgetsVisible(
    timeout = TestTimeouts.ELEMENT_WAIT,
    dataLoadTimeout = TestTimeouts.DEFAULT,
  ): Promise<{ allVisible: boolean; missing: string[] }> {
    return this.resourceHealth.verifyClusterStatusSectionWidgetsVisible(timeout, dataLoadTimeout);
  }

  async verifyNoErrorBoundary(waitMs = 3000): Promise<boolean> {
    const errorIndicator = this.page.locator('text=Something wrong happened');
    const hasError = await errorIndicator.isVisible({ timeout: waitMs }).catch(() => false);
    return !hasError;
  }

  async verifyResourceAllocationWidgetsVisible(
    timeout = TestTimeouts.ELEMENT_WAIT,
    dataLoadTimeout = TestTimeouts.DEFAULT,
  ): Promise<{ allVisible: boolean; missing: string[] }> {
    return this.resourceHealth.verifyResourceAllocationWidgetsVisible(timeout, dataLoadTimeout);
  }

  async verifyRunningVmsCountInHealthSection(
    namespace: string,
    expectedCount: number,
    timeout = TestTimeouts.ELEMENT_WAIT,
  ): Promise<{ matches: boolean; actualText?: string; message?: string }> {
    return this.resourceHealth.verifyRunningVmsCountInHealthSection(
      namespace,
      expectedCount,
      timeout,
    );
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
    return this.resourceHealth.verifyVirtualMachinesHealthSectionWidgetsVisible(timeout);
  }

  async waitForResourceAllocationChartsVisible(timeout = TestTimeouts.DEFAULT): Promise<void> {
    return this.resourceHealth.waitForResourceAllocationChartsVisible(timeout);
  }
}
