import VmListActionsComponent from '@/components/vm/vm-list-actions-component';
import VmListComponent from '@/components/vm/vm-list-component';
import VmListOverviewWidgetsComponent from '@/components/vm/vm-list-overview-widgets-component';
import { VmListFiltersComponent } from '@/components/vm/vm-list-search-components';
import { VmListSearchComponent } from '@/components/vm/vm-list-search-components';
import { VmListEmptyStateComponent } from '@/components/vm/vm-list-state-migration-components';
import { VmListMigrationComponent } from '@/components/vm/vm-list-state-migration-components';
import { VmListTreeComponent } from '@/components/vm/vm-list-state-migration-components';
import VmListTemplateCreateComponent from '@/components/vm/vm-list-template-create-component';
import type { VmMetricEntry } from '@/data-factories/vm-metrics-mock-factory';
import PageCommons from '@/page-objects/page-commons';
import { TreeContextMenuMixin } from '@/page-objects/vm/tree-context-menu-mixin';
import { TestTimeouts } from '@/utils/test-config';
import type { Page } from '@playwright/test';

export default class VirtualMachinesPage extends TreeContextMenuMixin(PageCommons) {
  // Move to folder modal locators
  private readonly _inputPlaceholderSearchFolder = this.locator(
    'input[placeholder="Search folder"]',
  );
  readonly emptyState: VmListEmptyStateComponent;
  readonly listActions: VmListActionsComponent;
  readonly listFilters: VmListFiltersComponent;
  readonly listMigration: VmListMigrationComponent;
  readonly overviewWidgets: VmListOverviewWidgetsComponent;
  readonly search: VmListSearchComponent;
  readonly templateCreate: VmListTemplateCreateComponent;

  readonly tree: VmListTreeComponent;

  /**
   * Creates a new VirtualMachinesPage instance.
   *
   * @param page - The Playwright page instance for UI interactions
   */
  constructor(page: Page) {
    super(page);
    this.templateCreate = new VmListTemplateCreateComponent(page);
    this.tree = new VmListTreeComponent(page);
    this.emptyState = new VmListEmptyStateComponent(page);
    this.search = new VmListSearchComponent(page);
    this.listActions = new VmListActionsComponent(page);
    this.listFilters = new VmListFiltersComponent(page);
    this.listMigration = new VmListMigrationComponent(page, (vm) =>
      this.listActions.openVmRowActions(vm),
    );
    this.overviewWidgets = new VmListOverviewWidgetsComponent(page, {
      searchTreeView: (t) => this.tree.searchTreeView(t),
    });
  }

  async areAllCheckboxesChecked(): Promise<boolean> {
    return this.listActions.areAllCheckboxesChecked();
  }

  async areNoCheckboxesChecked(): Promise<boolean> {
    return this.listActions.areNoCheckboxesChecked();
  }

  async captureAcmSearchRequestsForCluster(clusterName: string): Promise<{
    totalSearchRequests: number;
    clusterFilteredRequests: Array<{ kind: string; cluster: string }>;
  }> {
    return this.overviewWidgets.captureAcmSearchRequestsForCluster(clusterName);
  }

  async checkResourceAllocationCardTextOverflow(): Promise<{
    hasTruncation: boolean;
    cards: { title: string; truncated: boolean; element?: string }[];
  }> {
    return this.overviewWidgets.checkResourceAllocationCardTextOverflow();
  }

  async clearEmptyStateMocks(): Promise<void> {
    return this.emptyState.clearEmptyStateMocks();
  }

  async clearTreeViewSearch(): Promise<void> {
    return this.tree.clearTreeViewSearch();
  }

  async clearVmListMetricsMocks(): Promise<void> {
    return this.overviewWidgets.clearVmListMetricsMocks();
  }

  async clearVmToolbarSearch(): Promise<void> {
    return this.search.clearVmToolbarSearch();
  }

  override async clickActionsDropdown() {
    return this.listActions.clickActionsDropdown();
  }

  async clickAdvancedSearchButton(): Promise<void> {
    return this.search.clickAdvancedSearchButton();
  }

  async clickAdvancedSearchClose(): Promise<void> {
    return this.search.clickAdvancedSearchClose();
  }

  async clickAdvancedSearchReset(): Promise<void> {
    return this.search.clickAdvancedSearchReset();
  }

  async clickAllSearchResultsFound(): Promise<void> {
    return this.search.clickAllSearchResultsFound();
  }

  async clickBackToVirtualMachinesList(): Promise<void> {
    return this.search.clickBackToVirtualMachinesList();
  }

  async clickBulkMigrateStorage(): Promise<void> {
    return this.listMigration.clickBulkMigrateStorage();
  }

  async clickBulkSelectCheckbox(): Promise<void> {
    return this.listActions.clickBulkSelectCheckbox();
  }

  override async clickClearAllFilters(): Promise<void> {
    return this.listFilters.clickClearAllFilters();
  }

  async clickClearSearchButton(): Promise<void> {
    return this.search.clickClearSearchButton();
  }

  async clickClusterNodeInTree(clusterName: string): Promise<void> {
    return this.overviewWidgets.clickClusterNodeInTree(clusterName);
  }

  override async clickCreateAndSelectOption(
    option: 'From InstanceType' | 'From template' | 'With YAML',
  ): Promise<void> {
    return this.templateCreate.clickVmListCreateSplitOption(option);
  }

  async clickCreateVmLinkInNoDataAlert(): Promise<void> {
    return this.overviewWidgets.clickCreateVmLinkInNoDataAlert();
  }

  // Delete confirmation methods
  override async clickDeleteConfirmationButton(): Promise<void> {
    await super.clickDeleteConfirmationButton();
  }

  async clickDeleteSavedSearch(saveName: string): Promise<void> {
    return this.search.clickDeleteSavedSearch(saveName);
  }

  async clickFirstVmLinkInTable(): Promise<string> {
    return this.listActions.clickFirstVmLinkInTable();
  }

  async clickFolderNode(folderName: string, namespace: string): Promise<void> {
    return this.tree.clickFolderNode(folderName, namespace);
  }

  async clickFolderOption(folderName: string): Promise<void> {
    // First check if the folder exists as an existing option
    const existingFolderOption = this.locator(`#select-typeahead-${folderName}`);
    const exists = await existingFolderOption.isVisible().catch(() => false);

    if (exists) {
      await this.robustClick(existingFolderOption);
    } else {
      // Try clicking the "Create folder" option for creating new folders
      const createFolderOption = this.page.getByText(`Create folder "${folderName}"`);
      await this.robustClick(createFolderOption);
    }
  }

  async clickFolderSelector(folderName: string, namespace: string): Promise<void> {
    return this.listActions.clickFolderSelector(folderName, namespace);
  }

  async clickFooterSearchButton(): Promise<void> {
    return this.search.clickFooterSearchButton();
  }

  override async clickKebabButton(): Promise<void> {
    return this.listActions.clickKebabButton();
  }

  async clickKebabButtonForVm(vmName: string): Promise<void> {
    return this.listActions.clickKebabButtonForVm(vmName);
  }

  async clickLocalClusterInTree(): Promise<void> {
    return this.overviewWidgets.clickLocalClusterInTree();
  }

  async clickMigrateConfirmationButton(): Promise<void> {
    return this.listActions.clickMigrateConfirmationButton();
  }

  async clickOverviewTab(): Promise<void> {
    return this.overviewWidgets.clickOverviewTab();
  }

  async clickPauseConfirmationButton(): Promise<void> {
    return this.listActions.clickPauseConfirmationButton();
  }

  async clickProjectNode(namespace: string): Promise<void> {
    return this.tree.clickProjectNode(namespace);
  }

  async clickQuickCreateVmButton() {
    return this.templateCreate.clickQuickCreateVmButton();
  }

  async clickResultsAdvancedSearch(): Promise<void> {
    return this.search.clickResultsAdvancedSearch();
  }

  async clickSaveButtonInModal(): Promise<void> {
    return this.search.clickSaveButtonInModal();
  }

  async clickSavedSearchByName(saveName: string): Promise<void> {
    return this.search.clickSavedSearchByName(saveName);
  }

  async clickSavedSearches(): Promise<void> {
    return this.search.clickSavedSearches();
  }

  async clickSaveSearch(): Promise<void> {
    return this.search.clickSaveSearch();
  }

  async clickSearchAllButton(): Promise<void> {
    return this.search.clickSearchAllButton();
  }

  async clickSearchBarResultsButton(buttonText: string): Promise<void> {
    return this.search.clickSearchBarResultsButton(buttonText);
  }

  async clickSearchButton(): Promise<void> {
    return this.search.clickSearchButton();
  }

  async clickSelectedVolumesRadio(): Promise<void> {
    return this.listMigration.clickSelectedVolumesRadio();
  }

  async clickStartAfterCreateCheckbox() {
    return this.templateCreate.clickStartAfterCreateCheckbox();
  }

  override async clickTemplateByTestId(templateTestId: string) {
    return this.templateCreate.clickTemplateByTestId(templateTestId);
  }

  async clickTreeNode(nodeName: string): Promise<void> {
    return this.tree.clickTreeNode(nodeName);
  }

  async clickTreeNodeAndEnsureExpanded(
    nodeName: string,
    vmName?: string,
    namespace?: string,
  ): Promise<void> {
    return this.tree.clickTreeNodeAndEnsureExpanded(nodeName, vmName, namespace);
  }

  async clickVmAction(
    action:
      | 'start'
      | 'restart'
      | 'stop'
      | 'pause'
      | 'unpause'
      | 'bulk-migration'
      | 'move-to-folder'
      | 'edit-labels'
      | 'delete',
  ): Promise<void> {
    return this.listActions.clickVmAction(action);
  }

  async clickVmActionByMenuButton(
    action:
      | 'start'
      | 'restart'
      | 'reset'
      | 'stop'
      | 'pause'
      | 'unpause'
      | 'snapshot'
      | 'bulk-migration'
      | 'migrate-compute'
      | 'migrate-storage'
      | 'move-to-folder'
      | 'edit-labels'
      | 'delete',
  ): Promise<void> {
    return this.listActions.clickVmActionByMenuButton(action);
  }

  async clickVmActionOpenConsole(): Promise<void> {
    return this.listActions.clickVmActionOpenConsole();
  }

  async clickVmActionOpenConsoleAndCaptureNewTab(closeTab?: boolean): Promise<string> {
    return this.listActions.clickVmActionOpenConsoleAndCaptureNewTab(closeTab);
  }

  async clickVmActionsDropdown(): Promise<void> {
    return this.listActions.clickVmActionsDropdown();
  }

  async clickVmByTestId(vmName: string): Promise<void> {
    return this.listActions.clickVmByTestId(vmName);
  }

  async clickVmInFolderInTreeView(vmName: string, namespace: string): Promise<void> {
    return this.tree.clickVmInFolderInTreeView(vmName, namespace);
  }

  async clickVmInTreeView(vmName: string, namespace: string): Promise<void> {
    return this.tree.clickVmInTreeView(vmName, namespace);
  }

  async clickVmListTab(): Promise<void> {
    return this.overviewWidgets.clickVmListTab();
  }

  async clickVmName(vmName: string, namespace: string): Promise<void> {
    return this.listActions.clickVmName(vmName, namespace);
  }

  // --------------------------------------------------------------------------
  // Composed sub-pages — one-line delegations (public API preserved on VirtualMachinesPage)
  // --------------------------------------------------------------------------

  async clickVmRowAction(
    vmName: string,
    action:
      | 'start'
      | 'stop'
      | 'restart'
      | 'reset'
      | 'pause'
      | 'unpause'
      | 'snapshot'
      | 'migrate'
      | 'delete'
      | 'clone',
  ) {
    return this.listActions.clickVmRowAction(vmName, action);
  }

  async clickVmStatusAndVerifyLearnMoreInDialog(vmName: string): Promise<boolean> {
    return this.listActions.clickVmStatusAndVerifyLearnMoreInDialog(vmName);
  }

  async clickVmStatusButton(vmName: string): Promise<void> {
    return this.listActions.clickVmStatusButton(vmName);
  }

  async clickVmStatusDrillDown(
    namespace: string,
    timeout?: number,
  ): Promise<{ clicked: boolean; url: string }> {
    return this.overviewWidgets.clickVmStatusDrillDown(namespace, timeout);
  }

  async cloneVm(vmName: string, newVmName: string, startOnClone = false) {
    return this.listActions.cloneVm(vmName, newVmName, startOnClone);
  }

  async closeMigrationModal(): Promise<void> {
    return this.listMigration.closeMigrationModal();
  }

  async completeMigrationWizardWithStorageClass(
    destinationStorageClass: string,
    migrationCompletionTimeoutMs?: number,
    keepOriginalVolumes?: boolean,
  ): Promise<boolean> {
    return this.listMigration.completeMigrationWizardWithStorageClass(
      destinationStorageClass,
      migrationCompletionTimeoutMs,
      keepOriginalVolumes,
    );
  }

  async createProject(projectName: string): Promise<void> {
    return this.tree.createProject(projectName);
  }

  async deleteMigrationPlanFromListAndGetRedirectUrl(): Promise<string> {
    return this.overviewWidgets.deleteMigrationPlanFromListAndGetRedirectUrl();
  }

  async doTreeViewNodesHaveDistinguishableIcons(
    timeout = TestTimeouts.ELEMENT_WAIT,
  ): Promise<boolean> {
    return this.tree.doTreeViewNodesHaveDistinguishableIcons(timeout);
  }

  async expandTreeNode(nodeName: string): Promise<void> {
    return this.tree.expandTreeNode(nodeName);
  }

  async expectResourceAllocationDataKeywordsVisible(dataLoadTimeout?: number): Promise<void> {
    return this.overviewWidgets.expectResourceAllocationDataKeywordsVisible(dataLoadTimeout);
  }

  // Move to folder methods
  async fillMoveToFolderSearch(folderName: string): Promise<void> {
    await this._inputPlaceholderSearchFolder.clear();
    await this._inputPlaceholderSearchFolder.fill(folderName);
  }

  async fillSaveSearchDescription(saveDescription: string): Promise<void> {
    return this.search.fillSaveSearchDescription(saveDescription);
  }

  async fillSaveSearchName(saveName: string): Promise<void> {
    return this.search.fillSaveSearchName(saveName);
  }

  async fillTemplateVmName(vmName: string) {
    return this.templateCreate.fillTemplateVmName(vmName);
  }

  async fillVmSearchInput(searchText: string): Promise<void> {
    return this.search.fillVmSearchInput(searchText);
  }

  async filterByInstanceType(instanceType: string, check = true): Promise<void> {
    return this.listFilters.filterByInstanceType(instanceType, check);
  }

  async filterByIpAddress(ipPrefix: string): Promise<void> {
    return this.listFilters.filterByIpAddress(ipPrefix);
  }

  async filterByOs(osName: string): Promise<void> {
    return this.listFilters.filterByOs(osName);
  }

  async filterByStatus(status: string): Promise<void> {
    return this.listFilters.filterByStatus(status);
  }

  async getAdvancedSearchIpValidationWarning(): Promise<string | null> {
    return this.search.getAdvancedSearchIpValidationWarning();
  }

  async getAdvancedSearchProjectOptions(): Promise<string[]> {
    return this.search.getAdvancedSearchProjectOptions();
  }

  async getClusterUtilizationMetrics(
    timeout?: number,
  ): Promise<{ name: string; percentage: string; hasProgressBar: boolean }[]> {
    return this.overviewWidgets.getClusterUtilizationMetrics(timeout);
  }

  async getComputeMigrationStatusCount(statusKey: string, timeout?: number): Promise<number> {
    return this.overviewWidgets.getComputeMigrationStatusCount(statusKey, timeout);
  }

  async getComputeMigrationStatusNames(timeout?: number): Promise<string[]> {
    return this.overviewWidgets.getComputeMigrationStatusNames(timeout);
  }

  async getCreateSplitButtonDropdownOptions(): Promise<string[]> {
    return this.templateCreate.getCreateSplitButtonDropdownOptions();
  }

  async getDeleteModalDescriptionText(): Promise<string> {
    return this.listActions.getDeleteModalDescriptionText();
  }

  async getDeletionCountFromModal(): Promise<number | null> {
    return this.listActions.getDeletionCountFromModal();
  }

  async getDeschedulerStatus(timeout?: number): Promise<{
    label: string | null;
    value: string | null;
    hasInfoButton: boolean;
  }> {
    return this.overviewWidgets.getDeschedulerStatus(timeout);
  }

  async getEmptyStateBodyText(): Promise<string> {
    return this.emptyState.getEmptyStateBodyText();
  }

  async getGuestAgentWidgetTitle(timeout?: number): Promise<string | null> {
    return this.overviewWidgets.getGuestAgentWidgetTitle(timeout);
  }

  async getHealthSectionWidgetsVisibility(
    timeout?: number,
  ): Promise<{ allVisible: boolean; missing: string[] }> {
    return this.overviewWidgets.getHealthSectionWidgetsVisibility(timeout);
  }

  async getMigrationPlanProgress(): Promise<{ percentage: number; title: string }> {
    return this.overviewWidgets.getMigrationPlanProgress();
  }

  async getMigrationStatusSectionTitle(timeout?: number): Promise<string | null> {
    return this.overviewWidgets.getMigrationStatusSectionTitle(timeout);
  }

  async getNodeLoadDistributionNames(timeout?: number): Promise<string[]> {
    return this.overviewWidgets.getNodeLoadDistributionNames(timeout);
  }

  async getOnboardingPopoverHeaderText(): Promise<string> {
    return this.emptyState.getOnboardingPopoverHeaderText();
  }

  async getResourceAllocationCardDisplayedValues(): Promise<{
    runningCount: number;
    vcpu: number;
    memoryMiB: number;
    storageGiB: number;
  }> {
    return this.overviewWidgets.getResourceAllocationCardDisplayedValues();
  }

  async getResourceAllocationChartsVisibility(
    timeout?: number,
  ): Promise<{ count: number; allVisible: boolean }> {
    return this.overviewWidgets.getResourceAllocationChartsVisibility(timeout);
  }

  async getSelectedTabName(timeout?: number): Promise<string | null> {
    return this.overviewWidgets.getSelectedTabName(timeout);
  }

  async getStorageMigrationPlansColumnNames(): Promise<string[]> {
    return this.overviewWidgets.getStorageMigrationPlansColumnNames();
  }

  async getStorageMigrationPlansStatusNames(timeout?: number): Promise<string[]> {
    return this.overviewWidgets.getStorageMigrationPlansStatusNames(timeout);
  }

  async getTemplateVmName(): Promise<string> {
    return this.templateCreate.getTemplateVmName();
  }

  async getTreeNodeCount(nodeName: string): Promise<string | null> {
    return this.tree.getTreeNodeCount(nodeName);
  }

  async getTreeViewMatchedCount(): Promise<string | null> {
    return this.tree.getTreeViewMatchedCount();
  }

  async getTreeViewNodeIconViewBoxes(timeout = TestTimeouts.ELEMENT_WAIT): Promise<string[]> {
    return this.tree.getTreeViewNodeIconViewBoxes(timeout);
  }

  async getVisibleMigrationNodeOptions(vmName: string): Promise<string[]> {
    return this.listMigration.getVisibleMigrationNodeOptions(vmName);
  }

  async getVisibleMigrationNodeOptionsFromOpenModal(): Promise<string[]> {
    return this.listMigration.getVisibleMigrationNodeOptionsFromOpenModal();
  }

  async getVmStatus(vmName: string, timeout?: number): Promise<string | null> {
    return this.listActions.getVmStatus(vmName, timeout);
  }

  async getVmTableMetricValues(): Promise<
    Array<{ vmName: string; memory: string; cpu: string; network: string }>
  > {
    return this.overviewWidgets.getVmTableMetricValues();
  }

  async hasStatusButtonWithText(statusText: string, timeout?: number): Promise<boolean> {
    return this.listActions.hasStatusButtonWithText(statusText, timeout);
  }

  override async hoverOverControlMenu(): Promise<void> {
    return this.listActions.hoverOverControlMenu();
  }

  async isAdvancedSearchNoResultsVisible(): Promise<boolean> {
    return this.search.isAdvancedSearchNoResultsVisible();
  }

  async isClusterStatusWidgetPresent(timeout?: number): Promise<boolean> {
    return this.overviewWidgets.isClusterStatusWidgetPresent(timeout);
  }

  async isCreateSplitButtonVisible(): Promise<boolean> {
    return this.overviewWidgets.isCreateSplitButtonVisible();
  }

  async isDeleteModalShareableDiskChecked(): Promise<boolean> {
    return this.listActions.isDeleteModalShareableDiskChecked();
  }

  async isEmptyStateCreateButtonVisible(): Promise<boolean> {
    return this.emptyState.isEmptyStateCreateButtonVisible();
  }

  async isFolderSelectorVisible(folderName: string, namespace: string): Promise<boolean> {
    return this.listActions.isFolderSelectorVisible(folderName, namespace);
  }

  async isGuidedTourPopoverVisible(
    timeout: number = TestTimeouts.UI_VISIBILITY_QUICK,
  ): Promise<boolean> {
    return this.emptyState.isGuidedTourPopoverVisible(timeout);
  }

  async isKebabMenuActionEnabled(actionTestId: string, timeout?: number): Promise<boolean> {
    return this.listActions.isKebabMenuActionEnabled(actionTestId, timeout);
  }

  async isKebabMenuActionVisible(actionTestId: string, timeout?: number): Promise<boolean> {
    return this.listActions.isKebabMenuActionVisible(actionTestId, timeout);
  }

  async isLightspeedIconVisibleForVm(vmName: string): Promise<boolean> {
    return this.listActions.isLightspeedIconVisibleForVm(vmName);
  }

  async isMigrateComputeActionEnabled(vmName: string): Promise<boolean> {
    return this.listActions.isMigrateComputeActionEnabled(vmName);
  }

  async isMigrateStorageActionEnabled(vmName: string): Promise<boolean> {
    return this.listActions.isMigrateStorageActionEnabled(vmName);
  }

  async isMigrationsWidgetVisible(timeout?: number): Promise<boolean> {
    return this.overviewWidgets.isMigrationsWidgetVisible(timeout);
  }

  async isNextButtonDisabled(): Promise<boolean> {
    return this.listMigration.isNextButtonDisabled();
  }

  async isNoDataAlertVisible(): Promise<boolean> {
    return this.overviewWidgets.isNoDataAlertVisible();
  }

  async isNodeLoadDistributionVisible(timeout?: number): Promise<boolean> {
    return this.overviewWidgets.isNodeLoadDistributionVisible(timeout);
  }

  async isNoVMsMessageNotVisible(): Promise<boolean> {
    return this.emptyState.isNoVMsMessageNotVisible();
  }

  async isNoVMsMessageVisible(): Promise<boolean> {
    return this.emptyState.isNoVMsMessageVisible();
  }

  async isOnboardingPopoverVisible(
    timeout: number = TestTimeouts.UI_VISIBILITY_QUICK,
  ): Promise<boolean> {
    return this.emptyState.isOnboardingPopoverVisible(timeout);
  }

  async isOverviewAlertFullWidth(): Promise<boolean> {
    return this.overviewWidgets.isOverviewAlertFullWidth();
  }

  async isOverviewSectionExpanded(sectionDataTest: string): Promise<boolean> {
    return this.overviewWidgets.isOverviewSectionExpanded(sectionDataTest);
  }

  async isOverviewTabSelected(): Promise<boolean> {
    return this.overviewWidgets.isOverviewTabSelected();
  }

  async isProjectContextInSuggestBox(projectName: string): Promise<boolean> {
    return this.search.isProjectContextInSuggestBox(projectName);
  }

  async isProjectHintVisible(timeout: number = TestTimeouts.ELEMENT_WAIT): Promise<boolean> {
    return this.emptyState.isProjectHintVisible(timeout);
  }

  async isQuickCreateVmButtonEnabled(): Promise<boolean> {
    return this.templateCreate.isQuickCreateVmButtonEnabled();
  }

  async isQuickCreateVmButtonVisible(): Promise<boolean> {
    return this.templateCreate.isQuickCreateVmButtonVisible();
  }

  async isResourceAllocationNoDataVisible(): Promise<boolean> {
    return this.overviewWidgets.isResourceAllocationNoDataVisible();
  }

  async isSaveSearchButtonVisible(timeout?: number): Promise<boolean> {
    return this.search.isSaveSearchButtonVisible(timeout);
  }

  async isSaveSearchNameDuplicateErrorVisible(): Promise<boolean> {
    return this.search.isSaveSearchNameDuplicateErrorVisible();
  }

  async isShareableLabelVisibleInDeleteModal(): Promise<boolean> {
    return this.listActions.isShareableLabelVisibleInDeleteModal();
  }

  async isStartAfterCreateCheckboxChecked(): Promise<boolean> {
    return this.templateCreate.isStartAfterCreateCheckboxChecked();
  }

  async isStartAfterCreateCheckboxVisible(): Promise<boolean> {
    return this.templateCreate.isStartAfterCreateCheckboxVisible();
  }

  async isStorageMigrationContentVisible(): Promise<boolean> {
    return this.overviewWidgets.isStorageMigrationContentVisible();
  }

  async isStorageMigrationEmptyStateVisible(): Promise<boolean> {
    return this.overviewWidgets.isStorageMigrationEmptyStateVisible();
  }

  async isStorageMigrationPlansVisible(timeout?: number): Promise<boolean> {
    return this.overviewWidgets.isStorageMigrationPlansVisible(timeout);
  }

  async isSummaryNotVisible(): Promise<boolean> {
    return this.overviewWidgets.isSummaryNotVisible();
  }

  async isSummaryVisible(): Promise<boolean> {
    return this.overviewWidgets.isSummaryVisible();
  }

  async isTemplateVmNameInputVisible(): Promise<boolean> {
    return this.templateCreate.isTemplateVmNameInputVisible();
  }

  async isTreeNodeVisible(nodeName: string): Promise<boolean> {
    return this.tree.isTreeNodeVisible(nodeName);
  }

  async isTreeviewNotVisible(): Promise<boolean> {
    return this.tree.isTreeviewNotVisible();
  }

  async isTreeviewVisible(): Promise<boolean> {
    return this.tree.isTreeviewVisible();
  }

  async isVmNameHidden(vmName: string, timeout?: number): Promise<boolean> {
    return this.listActions.isVmNameHidden(vmName, timeout);
  }

  async isVmNameVisible(vmName: string, namespace: string, timeout?: number): Promise<boolean> {
    return this.listActions.isVmNameVisible(vmName, namespace, timeout);
  }

  async isVmRowActionEnabled(
    vmName: string,
    action:
      | 'start'
      | 'stop'
      | 'restart'
      | 'pause'
      | 'unpause'
      | 'snapshot'
      | 'migrate'
      | 'delete'
      | 'clone',
  ): Promise<boolean> {
    return this.listActions.isVmRowActionEnabled(vmName, action);
  }

  async isVmRowActionVisible(
    vmName: string,
    action:
      | 'start'
      | 'stop'
      | 'restart'
      | 'pause'
      | 'unpause'
      | 'snapshot'
      | 'migrate'
      | 'delete'
      | 'clone',
  ): Promise<boolean> {
    return this.listActions.isVmRowActionVisible(vmName, action);
  }

  async isVmVisibleByDataTest(vmName: string, timeout?: number): Promise<boolean> {
    return this.listActions.isVmVisibleByDataTest(vmName, timeout);
  }

  async isWizardNavStepDisabled(stepName: string): Promise<boolean> {
    return this.listMigration.isWizardNavStepDisabled(stepName);
  }

  async migrateVm(vmName: string): Promise<boolean> {
    return this.listMigration.migrateVm(vmName);
  }

  async migrateVmToSpecificNode(vmName: string, nodeName?: string): Promise<boolean> {
    return this.listMigration.migrateVmToSpecificNode(vmName, nodeName);
  }

  async mockConsoleGuidedTourIncomplete(username = 'kubeadmin'): Promise<void> {
    return this.emptyState.mockConsoleGuidedTourIncomplete(username);
  }

  async mockProjectCreatePermission(allowed: boolean): Promise<void> {
    return this.emptyState.mockProjectCreatePermission(allowed);
  }

  async mockUserSettings(settings: Record<string, unknown>): Promise<void> {
    return this.emptyState.mockUserSettings(settings);
  }

  async mockUserSettingsAndNavigate(settings: Record<string, unknown>): Promise<void> {
    return this.emptyState.mockUserSettingsAndNavigate(settings);
  }

  async mockVmListMetricsResponses(vmMetrics: VmMetricEntry[]): Promise<void> {
    return this.overviewWidgets.mockVmListMetricsResponses(vmMetrics);
  }

  /**
   * Navigates to the all-namespaces Virtual Machines list page via URL.
   * Waits for the page to fully load (network idle) before returning.
   * @deprecated Use navigateToVirtualMachinesViaUI() for more reliable navigation
   */
  async navigateToAllNamespacesVirtualMachines() {
    await this.goTo('/k8s/all-namespaces/kubevirt.io~v1~VirtualMachine');
  }

  async navigateToAllProjects(): Promise<void> {
    return this.tree.navigateToAllProjects();
  }

  /**
   * Navigates directly to the Fleet Virtualization VirtualMachines page scoped to a specific
   * cluster and namespace, e.g. to test the empty-state "Create VM" link (CNV-86198).
   * URL format: /fleet-virtualization/kubevirt.io~v1~VirtualMachine/cluster/{name}/ns/{namespace}
   */
  async navigateToFleetVirtualizationVmsForClusterNamespace(
    clusterName: string,
    namespace: string,
  ): Promise<void> {
    await this.goTo(
      `/fleet-virtualization/kubevirt.io~v1~VirtualMachine/cluster/${clusterName}/ns/${namespace}`,
    );
  }

  async navigateToFolderScopedVirtualMachines(
    namespace: string,
    folderName: string,
  ): Promise<void> {
    const label = encodeURIComponent(`vm.openshift.io/folder=${folderName}`);
    await this.goTo(`/k8s/ns/${namespace}/kubevirt.io~v1~VirtualMachine?labels=${label}`);
  }

  /**
   * Navigates directly to the Virtual Machines list page for a specific namespace.
   *
   * @param namespace - The namespace to navigate to
   */
  async navigateToNamespaceVirtualMachines(namespace: string) {
    await this.goTo(`/k8s/ns/${namespace}/kubevirt.io~v1~VirtualMachine`);
  }

  /**
   * Navigates to Virtual Machines page for a specific namespace.
   * Tries sidebar UI click first then selects the namespace; falls back to URL navigation.
   * @param namespace - The namespace to switch to
   */
  async navigateToNamespaceVirtualMachinesViaUI(namespace: string): Promise<void> {
    try {
      await this.clickNavVirtualMachines();
      await this.page.waitForLoadState('domcontentloaded');
      const currentUrl = this.page.url();
      if (!currentUrl.includes(`/ns/${namespace}/`)) {
        await this.navigateToNamespaceVirtualMachines(namespace);
      }
    } catch {
      await this.navigateToNamespaceVirtualMachines(namespace);
    }
  }

  async navigateToNamespaceVmListAndWait(namespace: string): Promise<void> {
    return this.emptyState.navigateToNamespaceVmListAndWait(namespace);
  }

  async navigateToProjectVirtualMachines(projectName: string) {
    await this.goTo(`/k8s/ns/${projectName}/kubevirt.io~v1~VirtualMachine`);
  }

  async navigateToStorageMigrationPlans(namespace: string): Promise<void> {
    return this.overviewWidgets.navigateToStorageMigrationPlans(namespace);
  }

  async navigateToStorageMigrationPlansViaUI(): Promise<void> {
    return this.overviewWidgets.navigateToStorageMigrationPlansViaUI();
  }

  /**
   * Navigates to Virtual Machines page via sidebar UI click, falling back to URL navigation.
   */
  async navigateToVirtualMachinesViaUI(): Promise<void> {
    try {
      await this.clickNavVirtualMachines();
    } catch {
      await this.navigateToAllNamespacesVirtualMachines();
    }
  }

  async openBulkActionsDropdown() {
    return this.listActions.openBulkActionsDropdown();
  }

  async openProjectFilter(): Promise<void> {
    return this.listFilters.openProjectFilter();
  }

  async openStorageMigrationModal(vmName: string, assertNextEnabled?: boolean): Promise<void> {
    return this.listMigration.openStorageMigrationModal(vmName, assertNextEnabled);
  }

  async performBulkStorageClassMigration(destinationStorageClass: string): Promise<boolean> {
    return this.listMigration.performBulkStorageClassMigration(destinationStorageClass);
  }

  async performStorageClassMigration(
    vmName: string,
    destinationStorageClass: string,
    selectedVolumes?: boolean,
    migrationCompletionTimeoutMs?: number,
    keepOriginalVolumes?: boolean,
  ): Promise<boolean> {
    return this.listMigration.performStorageClassMigration(
      vmName,
      destinationStorageClass,
      selectedVolumes,
      migrationCompletionTimeoutMs,
      keepOriginalVolumes,
    );
  }

  async pressKeyInVmSearchInput(key: string): Promise<void> {
    return this.search.pressKeyInVmSearchInput(key);
  }

  async recoverFromErrorBoundaryIfNeeded(timeout?: number): Promise<boolean> {
    return this.overviewWidgets.recoverFromErrorBoundaryIfNeeded(timeout);
  }

  async reloadVirtualMachinesView(): Promise<void> {
    return this.listActions.reloadVirtualMachinesView();
  }

  async resetColumns() {
    return this.listFilters.resetColumns();
  }

  async searchInAdvSearchToolbar(searchText: string): Promise<void> {
    return this.search.searchInAdvSearchToolbar(searchText);
  }

  async searchTreeView(searchText: string): Promise<void> {
    return this.tree.searchTreeView(searchText);
  }

  async searchVmAndVerifyNoResults(vmName: string): Promise<boolean> {
    return this.search.searchVmAndVerifyNoResults(vmName);
  }

  async selectAllVMs(): Promise<void> {
    return this.listActions.selectAllVMs();
  }

  async selectAllVmsOnPage() {
    return this.listActions.selectAllVmsOnPage();
  }

  async selectAllVolumesInMigrationModal(): Promise<void> {
    return this.listMigration.selectAllVolumesInMigrationModal();
  }

  async selectProjectInFilterMenu(projectName: string): Promise<void> {
    return this.listFilters.selectProjectInFilterMenu(projectName);
  }

  async selectVmByCheckbox(vmName: string): Promise<void> {
    const vmList = new VmListComponent(this.page);
    return vmList.selectVmByCheckbox(vmName);
  }

  async setAdvancedSearchDate(date: string): Promise<void> {
    return this.search.setAdvancedSearchDate(date);
  }

  async setAdvancedSearchDescription(description: string): Promise<void> {
    return this.search.setAdvancedSearchDescription(description);
  }

  async setAdvancedSearchIp(ipAddress: string): Promise<void> {
    return this.search.setAdvancedSearchIp(ipAddress);
  }

  async setAdvancedSearchLabel(labelKey: string, labelValue: string): Promise<void> {
    return this.search.setAdvancedSearchLabel(labelKey, labelValue);
  }

  async setAdvancedSearchMemory(memValue: string, operator?: string): Promise<void> {
    return this.search.setAdvancedSearchMemory(memValue, operator);
  }

  async setAdvancedSearchNad(nad: string): Promise<void> {
    return this.search.setAdvancedSearchNad(nad);
  }

  async setAdvancedSearchName(name: string): Promise<void> {
    return this.search.setAdvancedSearchName(name);
  }

  async setAdvancedSearchNodes(node: string): Promise<void> {
    return this.search.setAdvancedSearchNodes(node);
  }

  async setAdvancedSearchOs(os: string): Promise<void> {
    return this.search.setAdvancedSearchOs(os);
  }

  async setAdvancedSearchProject(projectName: string): Promise<void> {
    return this.search.setAdvancedSearchProject(projectName);
  }

  async setAdvancedSearchStatus(status: string): Promise<void> {
    return this.search.setAdvancedSearchStatus(status);
  }

  async setAdvancedSearchStorageClass(storageClass: string): Promise<void> {
    return this.search.setAdvancedSearchStorageClass(storageClass);
  }

  async setAdvancedSearchVcpu(vcpuValue: string): Promise<void> {
    return this.search.setAdvancedSearchVcpu(vcpuValue);
  }

  async setAdvancedSearchVmName(vmName: string): Promise<void> {
    return this.search.setAdvancedSearchVmName(vmName);
  }

  async startStorageMigrationAndCancelWhileInProgress(vmName: string): Promise<void> {
    return this.listMigration.startStorageMigrationAndCancelWhileInProgress(vmName);
  }

  async takeSnapshotFromList(vmName: string, snapshotName: string): Promise<boolean> {
    return this.listActions.takeSnapshotFromList(vmName, snapshotName);
  }

  async toggleColumn(columnName: 'status' | 'node' | 'created') {
    return this.listFilters.toggleColumn(columnName);
  }

  async toggleDeleteModalShareableDiskCheckbox(): Promise<void> {
    return this.listActions.toggleDeleteModalShareableDiskCheckbox();
  }

  async toggleEmptyProjectsDisplay(show: boolean): Promise<void> {
    return this.tree.toggleEmptyProjectsDisplay(show);
  }

  async toggleOverviewSection(sectionDataTest: string): Promise<void> {
    return this.overviewWidgets.toggleOverviewSection(sectionDataTest);
  }

  async toggleSummary(): Promise<boolean> {
    return this.overviewWidgets.toggleSummary();
  }

  async toggleTreeviewDrawer(): Promise<boolean> {
    return this.tree.toggleTreeviewDrawer();
  }

  async triggerStorageMigration(
    vmName: string,
    destinationStorageClass: string,
    selectedVolumes?: boolean,
    keepOriginalVolumes?: boolean,
  ): Promise<void> {
    return this.listMigration.triggerStorageMigration(
      vmName,
      destinationStorageClass,
      selectedVolumes,
      keepOriginalVolumes,
    );
  }

  async tryClearAllFilters(): Promise<boolean> {
    return this.listFilters.tryClearAllFilters();
  }

  async typeInVmSearchInput(searchText: string): Promise<void> {
    return this.search.typeInVmSearchInput(searchText);
  }

  async verifyAllSearchResultsFoundButton(): Promise<boolean> {
    return this.search.verifyAllSearchResultsFoundButton();
  }

  async verifyAllStatusCellsContain(expectedStatus: string, timeout?: number): Promise<boolean> {
    return this.listActions.verifyAllStatusCellsContain(expectedStatus, timeout);
  }

  async verifyCloneInfoAlertVisible(): Promise<boolean> {
    const alertText =
      'The cloning process will continue after you close the modal. The cloned VirtualMachine may take some time to appear.';
    const alert = this.page.getByText(alertText);
    try {
      await alert.waitFor({ state: 'visible', timeout: TestTimeouts.UI_ACTION_COMPLETE });
      return true;
    } catch {
      return false;
    }
  }

  async verifyClusterAndProjectFilterButtonsVisible(): Promise<boolean> {
    return this.listFilters.verifyClusterAndProjectFilterButtonsVisible();
  }

  async verifyClusterStatusSectionWidgetsVisible(
    timeout?: number,
    dataLoadTimeout?: number,
  ): Promise<{ allVisible: boolean; missing: string[] }> {
    return this.overviewWidgets.verifyClusterStatusSectionWidgetsVisible(timeout, dataLoadTimeout);
  }

  async verifyNoErrorBoundary(waitMs?: number): Promise<boolean> {
    return this.overviewWidgets.verifyNoErrorBoundary(waitMs);
  }

  async verifyNoVolumePolicyInCloneModal(vmName: string): Promise<boolean> {
    return this.listActions.verifyNoVolumePolicyInCloneModal(vmName);
  }

  override async verifyPageLoaded(
    vmNameOrIndicators?: string | string[],
    includeCreateButton?: boolean,
    timeout?: number,
  ): Promise<boolean> {
    return this.listFilters.verifyPageLoaded(vmNameOrIndicators, includeCreateButton, timeout);
  }

  async verifyResourceAllocationWidgetsVisible(
    timeout?: number,
    dataLoadTimeout?: number,
  ): Promise<{ allVisible: boolean; missing: string[] }> {
    return this.overviewWidgets.verifyResourceAllocationWidgetsVisible(timeout, dataLoadTimeout);
  }

  async verifyRunningVmsCountInHealthSection(
    namespace: string,
    expectedCount: number,
    timeout?: number,
  ): Promise<{ matches: boolean; actualText?: string; message?: string }> {
    return this.overviewWidgets.verifyRunningVmsCountInHealthSection(
      namespace,
      expectedCount,
      timeout,
    );
  }

  async verifySavedSearchNotExists(saveName: string): Promise<boolean> {
    return this.search.verifySavedSearchNotExists(saveName);
  }

  async verifySaveSearchTitle(): Promise<boolean> {
    return this.search.verifySaveSearchTitle();
  }

  async verifySearchBarResultsVisible(): Promise<boolean> {
    return this.search.verifySearchBarResultsVisible();
  }

  async verifySearchResultsSubtitle(): Promise<boolean> {
    return this.search.verifySearchResultsSubtitle();
  }

  async verifySearchSuggestBoxHidden(): Promise<boolean> {
    return this.search.verifySearchSuggestBoxHidden();
  }

  async verifyStorageMigrationPlansPageLoaded(): Promise<boolean> {
    return this.overviewWidgets.verifyStorageMigrationPlansPageLoaded();
  }

  async verifyTableHeaderExists(
    headerLabel: 'Status' | 'Node' | 'Created',
    shouldExist: boolean,
  ): Promise<boolean> {
    return this.listFilters.verifyTableHeaderExists(headerLabel, shouldExist);
  }

  async verifyTagInTagItemContent(expectedTagValue: string): Promise<boolean> {
    return this.listActions.verifyTagInTagItemContent(expectedTagValue);
  }

  async verifyVirtualMachinesHealthSectionWidgetsVisible(
    timeout?: number,
  ): Promise<{ allVisible: boolean; missing: string[] }> {
    return this.overviewWidgets.verifyVirtualMachinesHealthSectionWidgetsVisible(timeout);
  }

  async verifyVmNameInSearchResults(vmName: string): Promise<boolean> {
    return this.search.verifyVmNameInSearchResults(vmName);
  }

  async verifyVmSearchInputEmpty(): Promise<boolean> {
    return this.search.verifyVmSearchInputEmpty();
  }

  async verifyVmsTreeviewExists(): Promise<boolean> {
    return this.tree.verifyVmsTreeviewExists();
  }

  async waitForFolderToDisappear(
    folderName: string,
    namespace: string,
    timeout?: number,
  ): Promise<void> {
    return this.listActions.waitForFolderToDisappear(folderName, namespace, timeout);
  }

  async waitForMultipleVMsToDisappear(vmNames: string[], timeout = 60000): Promise<void> {
    return this.listActions.waitForMultipleVMsToDisappear(vmNames, timeout);
  }

  async waitForResourceAllocationChartsVisible(timeout?: number): Promise<void> {
    return this.overviewWidgets.waitForResourceAllocationChartsVisible(timeout);
  }

  async waitForStorageClassMigrationCompletion(): Promise<boolean> {
    return this.listMigration.waitForStorageClassMigrationCompletion();
  }

  override async waitForTemplateForm() {
    return this.templateCreate.waitForTemplateForm();
  }

  async waitForVmListTableVisible(): Promise<void> {
    return this.listFilters.waitForVmListTableVisible();
  }

  async waitForVmRowDetached(vmName: string, timeout?: number): Promise<void> {
    return this.listActions.waitForVmRowDetached(vmName, timeout);
  }

  async waitForVmRowVisible(vmName: string, timeoutMs?: number): Promise<void> {
    return this.listActions.waitForVmRowVisible(vmName, timeoutMs);
  }

  async waitForVmStatus(
    vmName: string,
    expectedStatus: string,
    timeoutMs?: number,
  ): Promise<boolean> {
    return this.listActions.waitForVmStatus(vmName, expectedStatus, timeoutMs);
  }

  async waitForVMTableToLoad(): Promise<void> {
    const vmList = new VmListComponent(this.page);
    return vmList.waitForVMTableToLoad();
  }
}
