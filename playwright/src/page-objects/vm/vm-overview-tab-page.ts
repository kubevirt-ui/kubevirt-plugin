// VmOverviewTabPage — Page object for vm overview tab interactions.

import { VmListOverviewWidgetsComponent } from '@/components/vm/vm-list-overview-components';
import { VmListSearchComponent } from '@/components/vm/vm-list-search-components';
import {
  VmListEmptyStateComponent,
  VmListTemplateCreateComponent,
} from '@/components/vm/vm-list-state-migration-components';
import { VmOverviewTabResourceHealthComponent } from '@/components/vm/vm-overview-tab-components';
import type { VmMetricEntry } from '@/data-factories/vm-metrics-mock-factory';
import { buildPrometheusVectorResponse } from '@/data-factories/vm-metrics-mock-factory';
import PageCommons from '@/page-objects/page-commons';
import { TestTimeouts } from '@/utils/test-config';
import type { Page } from '@playwright/test';

export default class VmOverviewTabPage extends PageCommons {
  readonly resourceHealth: VmOverviewTabResourceHealthComponent;
  readonly widgets: VmListOverviewWidgetsComponent;
  readonly emptyState: VmListEmptyStateComponent;
  readonly search: VmListSearchComponent;
  readonly templateCreate: VmListTemplateCreateComponent;

  constructor(page: Page) {
    super(page);
    this.resourceHealth = new VmOverviewTabResourceHealthComponent(page);
    this.widgets = new VmListOverviewWidgetsComponent(page, {
      searchTreeView: async () => {},
    });
    this.emptyState = new VmListEmptyStateComponent(page);
    this.search = new VmListSearchComponent(page);
    this.templateCreate = new VmListTemplateCreateComponent(page);
  }

  async verifyClusterAndProjectFilterButtonsVisible(): Promise<boolean> {
    try {
      if (!(await this.filterToolbar.isFilterToolbarVisible())) {
        return false;
      }
      await this.locator('#filter-toolbar button', { hasText: 'Cluster' }).waitFor({
        state: 'visible',
        timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
      });
      await this.locator('#filter-toolbar button', { hasText: 'Project' }).waitFor({
        state: 'visible',
        timeout: TestTimeouts.UI_ELEMENT_VISIBILITY,
      });
      return true;
    } catch {
      return false;
    }
  }

  async openProjectFilter(): Promise<void> {
    await this.filterToolbar.openFilterButton('Project');
  }

  async selectProjectInFilterMenu(projectName: string): Promise<void> {
    await this.filterToolbar.selectMenuItem(projectName, { force: true });
  }

  async filterByStatus(status: string) {
    await this.filterToolbar.openFilterButton('Status');
    await this.filterToolbar.selectMenuItem(status);
  }

  async filterByOs(osName: string) {
    await this.filterToolbar.openFilterButton('Operating system');
    await this.filterToolbar.selectMenuItem(osName);
  }

  async filterByInstanceType(instanceType: string, check = true) {
    await this.filterToolbar.openFilterButton('Status');
    await this.filterToolbar.toggleRowFilter(instanceType, check);
    await this.page.waitForTimeout(TestTimeouts.UI_FILTER_APPLY);
  }

  async filterByIpAddress(ipPrefix: string) {
    await this.filterToolbar.openFilterButton('Status');
    await this.locator('button:has-text("Name")').click();
    await this.page.waitForTimeout(TestTimeouts.UI_DELAY_SHORT);
    await this.locator('button:has-text("IP Address")').click();
    await this.page.waitForTimeout(TestTimeouts.UI_DELAY_SHORT);
    const filterInput = this.locator('[data-test-id="filter-input"]');
    await this.filterToolbar.fillFilterInput(filterInput, ipPrefix);
    await this.page.waitForTimeout(TestTimeouts.UI_ACTION_COMPLETE);
  }

  async toggleOverviewSection(sectionDataTest: string): Promise<void> {
    return this.widgets.toggleOverviewSection(sectionDataTest);
  }

  async isOverviewSectionExpanded(sectionDataTest: string): Promise<boolean> {
    return this.widgets.isOverviewSectionExpanded(sectionDataTest);
  }

  async toggleSummary(): Promise<boolean> {
    return this.widgets.toggleSummary();
  }

  async isSummaryVisible(): Promise<boolean> {
    return this.widgets.isSummaryVisible();
  }

  async isSummaryNotVisible(): Promise<boolean> {
    return this.widgets.isSummaryNotVisible();
  }

  async clickOverviewTab(): Promise<void> {
    return this.widgets.clickOverviewTab();
  }

  async isOverviewTabSelected(): Promise<boolean> {
    return this.widgets.isOverviewTabSelected();
  }

  async isMigrationsWidgetVisible(timeout = TestTimeouts.ELEMENT_WAIT): Promise<boolean> {
    return this.widgets.isMigrationsWidgetVisible(timeout);
  }

  async isClusterStatusWidgetPresent(timeout = 5000): Promise<boolean> {
    return this.widgets.isClusterStatusWidgetPresent(timeout);
  }

  async getMigrationStatusSectionTitle(
    timeout = TestTimeouts.ELEMENT_WAIT,
  ): Promise<null | string> {
    return this.widgets.getMigrationStatusSectionTitle(timeout);
  }

  async getComputeMigrationStatusNames(timeout = TestTimeouts.ELEMENT_WAIT): Promise<string[]> {
    return this.widgets.getComputeMigrationStatusNames(timeout);
  }

  async getComputeMigrationStatusCount(
    statusKey: string,
    timeout = TestTimeouts.ELEMENT_WAIT,
  ): Promise<number> {
    return this.widgets.getComputeMigrationStatusCount(statusKey, timeout);
  }

  async getGuestAgentWidgetTitle(timeout = TestTimeouts.ELEMENT_WAIT): Promise<null | string> {
    return this.widgets.getGuestAgentWidgetTitle(timeout);
  }

  async getDeschedulerStatus(
    timeout = TestTimeouts.ELEMENT_WAIT,
  ): Promise<{ label: null | string; value: null | string; hasInfoButton: boolean }> {
    return this.widgets.getDeschedulerStatus(timeout);
  }

  async getNodeLoadDistributionNames(timeout = TestTimeouts.ELEMENT_WAIT): Promise<string[]> {
    return this.widgets.getNodeLoadDistributionNames(timeout);
  }

  async isNodeLoadDistributionVisible(timeout = TestTimeouts.ELEMENT_WAIT): Promise<boolean> {
    return this.widgets.isNodeLoadDistributionVisible(timeout);
  }

  async isStorageMigrationPlansVisible(timeout = TestTimeouts.ELEMENT_WAIT): Promise<boolean> {
    return this.widgets.isStorageMigrationPlansVisible(timeout);
  }

  async getStorageMigrationPlansStatusNames(
    timeout = TestTimeouts.ELEMENT_WAIT,
  ): Promise<string[]> {
    return this.widgets.getStorageMigrationPlansStatusNames(timeout);
  }

  async navigateToStorageMigrationPlans(namespace: string): Promise<void> {
    return this.widgets.navigateToStorageMigrationPlans(namespace);
  }

  async navigateToStorageMigrationPlansViaUI(): Promise<void> {
    return this.widgets.navigateToStorageMigrationPlansViaUI();
  }

  async verifyStorageMigrationPlansPageLoaded(): Promise<boolean> {
    return this.widgets.verifyStorageMigrationPlansPageLoaded();
  }

  async isStorageMigrationEmptyStateVisible(): Promise<boolean> {
    return this.widgets.isStorageMigrationEmptyStateVisible();
  }

  async getStorageMigrationPlansColumnNames(): Promise<string[]> {
    return this.widgets.getStorageMigrationPlansColumnNames();
  }

  async getMigrationPlanProgress(): Promise<{ percentage: number; title: string }> {
    return this.widgets.getMigrationPlanProgress();
  }

  async deleteMigrationPlanFromListAndGetRedirectUrl(): Promise<string> {
    return this.widgets.deleteMigrationPlanFromListAndGetRedirectUrl();
  }

  async isNoVMsMessageVisible(): Promise<boolean> {
    return this.emptyState.isNoVMsMessageVisible();
  }

  async isAdvancedSearchNoResultsVisible(): Promise<boolean> {
    return this.search.isAdvancedSearchNoResultsVisible();
  }

  async isNoVMsMessageNotVisible(): Promise<boolean> {
    return this.emptyState.isNoVMsMessageNotVisible();
  }

  async getEmptyStateBodyText(): Promise<string> {
    return this.emptyState.getEmptyStateBodyText();
  }

  async isEmptyStateCreateButtonVisible(): Promise<boolean> {
    return this.emptyState.isEmptyStateCreateButtonVisible();
  }

  async isProjectHintVisible(timeout: number = TestTimeouts.ELEMENT_WAIT): Promise<boolean> {
    return this.emptyState.isProjectHintVisible(timeout);
  }

  async mockProjectCreatePermission(allowed: boolean): Promise<void> {
    return this.emptyState.mockProjectCreatePermission(allowed);
  }

  async clearEmptyStateMocks(): Promise<void> {
    return this.emptyState.clearEmptyStateMocks();
  }

  async mockConsoleGuidedTourIncomplete(username = 'kubeadmin'): Promise<void> {
    return this.emptyState.mockConsoleGuidedTourIncomplete(username);
  }

  private static readonly _USER_SETTINGS_URL =
    '**/api/kubernetes/api/v1/namespaces/openshift-cnv/configmaps/kubevirt-user-settings';

  private static readonly _VM_LIST_PATH = '/k8s/all-namespaces/kubevirt.io~v1~VirtualMachine';

  async mockUserSettingsAndNavigate(settings: Record<string, unknown>): Promise<void> {
    await this.mockUserSettings(settings);
    await this.goTo(VmOverviewTabPage._VM_LIST_PATH);
  }

  async mockUserSettings(settings: Record<string, unknown>): Promise<void> {
    const configMapUrl = VmOverviewTabPage._USER_SETTINGS_URL;

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

  async isGuidedTourPopoverVisible(
    timeout: number = TestTimeouts.UI_VISIBILITY_QUICK,
  ): Promise<boolean> {
    return this.emptyState.isGuidedTourPopoverVisible(timeout);
  }

  async isOnboardingPopoverVisible(
    timeout: number = TestTimeouts.UI_VISIBILITY_QUICK,
  ): Promise<boolean> {
    return this.emptyState.isOnboardingPopoverVisible(timeout);
  }

  async getOnboardingPopoverHeaderText(): Promise<string> {
    return this.emptyState.getOnboardingPopoverHeaderText();
  }

  async isNoDataAlertVisible(): Promise<boolean> {
    return this.widgets.isNoDataAlertVisible();
  }

  async clickCreateVmLinkInNoDataAlert(): Promise<void> {
    return this.widgets.clickCreateVmLinkInNoDataAlert();
  }

  async isOverviewAlertFullWidth(): Promise<boolean> {
    return this.widgets.isOverviewAlertFullWidth();
  }

  async isResourceAllocationNoDataVisible(): Promise<boolean> {
    return this.resourceHealth.isResourceAllocationNoDataVisible();
  }

  async isCreateSplitButtonVisible(): Promise<boolean> {
    return this.widgets.isCreateSplitButtonVisible();
  }

  async getCreateSplitButtonDropdownOptions(): Promise<string[]> {
    return this.templateCreate.getCreateSplitButtonDropdownOptions();
  }

  async verifyClusterStatusSectionWidgetsVisible(
    timeout = TestTimeouts.ELEMENT_WAIT,
    dataLoadTimeout = TestTimeouts.DEFAULT,
  ): Promise<{ allVisible: boolean; missing: string[] }> {
    return this.resourceHealth.verifyClusterStatusSectionWidgetsVisible(timeout, dataLoadTimeout);
  }

  async getClusterUtilizationMetrics(
    timeout = TestTimeouts.DEFAULT,
  ): Promise<{ name: string; percentage: string; hasProgressBar: boolean }[]> {
    return this.resourceHealth.getClusterUtilizationMetrics(timeout);
  }

  async getHealthSectionWidgetsVisibility(
    timeout = TestTimeouts.DEFAULT,
  ): Promise<{ allVisible: boolean; missing: string[] }> {
    return this.resourceHealth.getHealthSectionWidgetsVisibility(timeout);
  }

  async verifyVirtualMachinesHealthSectionWidgetsVisible(
    timeout = TestTimeouts.ELEMENT_WAIT,
  ): Promise<{ allVisible: boolean; missing: string[] }> {
    return this.resourceHealth.verifyVirtualMachinesHealthSectionWidgetsVisible(timeout);
  }

  async expectResourceAllocationDataKeywordsVisible(
    dataLoadTimeout = TestTimeouts.DEFAULT,
  ): Promise<void> {
    return this.resourceHealth.expectResourceAllocationDataKeywordsVisible(dataLoadTimeout);
  }

  async getResourceAllocationChartsVisibility(
    timeout = TestTimeouts.DEFAULT,
  ): Promise<{ count: number; allVisible: boolean }> {
    return this.resourceHealth.getResourceAllocationChartsVisibility(timeout);
  }

  async waitForResourceAllocationChartsVisible(timeout = TestTimeouts.DEFAULT): Promise<void> {
    return this.resourceHealth.waitForResourceAllocationChartsVisible(timeout);
  }

  async verifyResourceAllocationWidgetsVisible(
    timeout = TestTimeouts.ELEMENT_WAIT,
    dataLoadTimeout = TestTimeouts.DEFAULT,
  ): Promise<{ allVisible: boolean; missing: string[] }> {
    return this.resourceHealth.verifyResourceAllocationWidgetsVisible(timeout, dataLoadTimeout);
  }

  async getResourceAllocationCardDisplayedValues(): Promise<{
    runningCount: number;
    vcpu: number;
    memoryMiB: number;
    storageGiB: number;
  }> {
    return this.resourceHealth.getResourceAllocationCardDisplayedValues();
  }

  async checkResourceAllocationCardTextOverflow(): Promise<{
    hasTruncation: boolean;
    cards: { title: string; truncated: boolean; element?: string }[];
  }> {
    return this.resourceHealth.checkResourceAllocationCardTextOverflow();
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

  async clickVmStatusDrillDown(
    namespace: string,
    timeout = TestTimeouts.DEFAULT,
  ): Promise<{ clicked: boolean; url: string }> {
    return this.resourceHealth.clickVmStatusDrillDown(namespace, timeout);
  }

  async getOverviewViewAllLinks(
    timeout = TestTimeouts.ELEMENT_WAIT,
  ): Promise<{ section: string; href: string; visible: boolean }[]> {
    return this.resourceHealth.getOverviewViewAllLinks(timeout);
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

  async getStatusScoreItemTooltipInfo(timeout = TestTimeouts.ELEMENT_WAIT): Promise<{
    itemCount: number;
    checkedItem: { text: string; tooltipText: null | string } | null;
  }> {
    return this.resourceHealth.getStatusScoreItemTooltipInfo(timeout);
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
    const errorIndicator = this.page.locator('text=Something wrong happened');
    const hasError = await errorIndicator.isVisible({ timeout: waitMs }).catch(() => false);
    return !hasError;
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

  async clearVmListMetricsMocks(): Promise<void> {
    await this.page.unrouteAll({ behavior: 'ignoreErrors' });
  }
}
