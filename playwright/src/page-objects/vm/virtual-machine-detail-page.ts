/**
 * Page object for VirtualMachine detail/overview page.
 */

import { DISK_NAMES } from '@/data-models';
import { TestTimeouts } from '@/utils/test-config';
import type { Page } from '@playwright/test';

import PageCommons from '../page-commons';

import VirtualMachineDetailActionsPage from './virtual-machine-detail-actions-page';
import VirtualMachineDetailAlertsPage from './virtual-machine-detail-alerts-page';
import VirtualMachineDetailConfigurationPage from './virtual-machine-detail-configuration-page';
import VirtualMachineDetailConsolePage from './virtual-machine-detail-console-page';
import VirtualMachineDetailDiagnosticsPage from './virtual-machine-detail-diagnostics-page';
import VirtualMachineDetailDisksPage from './virtual-machine-detail-disks-page';
import VirtualMachineDetailMetricsSnapshotsPage from './virtual-machine-detail-metrics-snapshots-page';
import VirtualMachineDetailNavigationPage from './virtual-machine-detail-navigation-page';
import VirtualMachineDetailNetworkPage from './virtual-machine-detail-network-page';
import VirtualMachineDetailOverviewTabPage from './virtual-machine-detail-overview-tab-page';
import VirtualMachineDetailOverviewWidgetsPage from './virtual-machine-detail-overview-widgets-page';
import VirtualMachineDetailSchedulingPage from './virtual-machine-detail-scheduling-page';

export default class VirtualMachineDetailPage extends PageCommons {
  // VM action locators - inherited from PageCommons:
  // _vmActionsDropdown, _vmControlMenu, _vmActionStart, _vmActionStop, _vmActionStopButton,
  // _vmActionRestart, _vmActionRestartButton, _vmActionReset, _vmActionPause, _vmActionPauseButton,
  // _vmActionUnpause, _vmActionUnpauseButton, _vmActionClone, _vmActionDelete
  override readonly _createButton = this.locator(
    'button.pf-v6-c-button.pf-m-primary.pf-m-progress',
  );

  readonly actions: VirtualMachineDetailActionsPage;
  readonly alerts: VirtualMachineDetailAlertsPage;
  readonly configuration: VirtualMachineDetailConfigurationPage;
  readonly console: VirtualMachineDetailConsolePage;
  readonly diagnostics: VirtualMachineDetailDiagnosticsPage;
  readonly disks: VirtualMachineDetailDisksPage;
  readonly metricsSnapshots: VirtualMachineDetailMetricsSnapshotsPage;
  readonly navigation: VirtualMachineDetailNavigationPage;
  readonly network: VirtualMachineDetailNetworkPage;
  readonly overviewTab: VirtualMachineDetailOverviewTabPage;
  readonly overviewWidgets: VirtualMachineDetailOverviewWidgetsPage;
  readonly scheduling: VirtualMachineDetailSchedulingPage;

  constructor(page: Page) {
    super(page);
    this.configuration = new VirtualMachineDetailConfigurationPage(page);
    this.scheduling = new VirtualMachineDetailSchedulingPage(page);
    this.disks = new VirtualMachineDetailDisksPage(page);
    this.console = new VirtualMachineDetailConsolePage(page);
    this.metricsSnapshots = new VirtualMachineDetailMetricsSnapshotsPage(page);
    this.diagnostics = new VirtualMachineDetailDiagnosticsPage(page);
    this.overviewWidgets = new VirtualMachineDetailOverviewWidgetsPage(page);
    this.alerts = new VirtualMachineDetailAlertsPage(page);
    this.network = new VirtualMachineDetailNetworkPage(page);
    this.navigation = new VirtualMachineDetailNavigationPage(page);
    this.actions = new VirtualMachineDetailActionsPage(page);
    this.overviewTab = new VirtualMachineDetailOverviewTabPage(
      page,
      this.overviewWidgets,
      this.configuration,
    );
  }

  async addBlankDisk(diskName: string, size = '1', storageClass?: string): Promise<boolean> {
    return this.disks.addBlankDisk(diskName, size, storageClass);
  }

  async addCDROMDisk(
    diskName: string,
    cdromSource: 'Upload new ISO' | 'Use existing ISO' | 'Leave empty drive' = 'Upload new ISO',
    sourceValue?: string,
  ): Promise<boolean> {
    return this.disks.addCDROMDisk(diskName, cdromSource, sourceValue);
  }

  async addLUNDisk(diskName: string = DISK_NAMES.LUN_DISK): Promise<string> {
    return this.disks.addLUNDisk(diskName);
  }

  async addShareableDisk(diskName: string = DISK_NAMES.SHAREABLE_DISK): Promise<string> {
    return this.disks.addShareableDisk(diskName);
  }

  async assertAlertMoreLinkInsideMessage(): Promise<boolean> {
    return this.alerts.assertAlertMoreLinkInsideMessage();
  }

  async cancelAffinityRulesModal(): Promise<void> {
    return this.scheduling.cancelAffinityRulesModal();
  }

  async cancelRestoreModal(): Promise<void> {
    return this.metricsSnapshots.cancelRestoreModal();
  }

  /**
   * Configuration → Network: row actions → Edit → change NetworkAttachmentDefinition (live NAD ref).
   * @see STP hotpluggable-nad-ref P0 scenario.
   */
  async changeConfigurationNetworkNicNad(
    nicName: string,
    nadMenuOptionText: string,
  ): Promise<void> {
    await this.navigateToConfigurationNetwork();

    const nicRow = this.locator(`tr.pf-v6-c-table__tr:has-text("${nicName}")`);
    await nicRow.waitFor({ state: 'visible', timeout: TestTimeouts.UI_VISIBILITY_QUICK });

    const actionsBtn = nicRow.locator('.pf-v6-c-table__action button').first();
    await actionsBtn.waitFor({
      state: 'visible',
      timeout: TestTimeouts.INSTANCE_TYPE_VERIFICATION,
    });
    await this.robustClick(actionsBtn);

    const editItem = this.page
      .locator('[role="menu"] [role="menuitem"], [role="menu"] button')
      .filter({ hasText: /^Edit$/ });
    await editItem.first().waitFor({ state: 'visible', timeout: TestTimeouts.UI_DELAY_MEDIUM });
    await this.robustClick(editItem.first());

    await this.page
      .locator('h1')
      .filter({ hasText: 'Edit network interface' })
      .waitFor({ state: 'visible', timeout: TestTimeouts.INSTANCE_TYPE_VERIFICATION });

    const modalScope = this.page
      .locator('[role="dialog"], #tab-modal')
      .filter({ hasText: 'Edit network interface' })
      .first();
    const nadSelectRoot = modalScope.locator(
      '[data-test-id="network-attachment-definition-select"]',
    );
    await nadSelectRoot.waitFor({ state: 'visible', timeout: TestTimeouts.UI_DELAY_MEDIUM });

    const menuToggle = nadSelectRoot
      .locator('button.pf-v6-c-menu-toggle__button, button[aria-label="Menu toggle"]')
      .first();
    await menuToggle.waitFor({ state: 'visible', timeout: TestTimeouts.UI_DELAY_MEDIUM });
    await this.robustClick(menuToggle);

    const nadOption = this.page
      .locator('[role="menu"] button, [role="option"]')
      .filter({ hasText: nadMenuOptionText });
    await nadOption.first().waitFor({ state: 'visible', timeout: TestTimeouts.UI_DELAY_MEDIUM });
    await this.robustClick(nadOption.first());

    await this.clickSave();
    await modalScope
      .waitFor({ state: 'hidden', timeout: TestTimeouts.ELEMENT_WAIT })
      .catch(() => undefined);
    await this.page.waitForTimeout(TestTimeouts.UI_DELAY_MEDIUM);
  }

  async changeMetricsTimeRange() {
    return this.metricsSnapshots.changeMetricsTimeRange();
  }

  async clearDiagnosticsSearch(): Promise<void> {
    return this.diagnostics.clearDiagnosticsSearch();
  }

  async clearFilesystemListMock(): Promise<void> {
    return this.overviewTab.clearFilesystemListMock();
  }

  async clearMetricsMocks(): Promise<void> {
    return this.metricsSnapshots.clearMetricsMocks();
  }

  async clearPrometheusRulesMock(): Promise<void> {
    return this.alerts.clearPrometheusRulesMock();
  }

  override async clickActionsDropdown() {
    return this.actions.clickActionsDropdown();
  }

  async clickConfigurationStorageSubTab() {
    await this.configuration.clickConfigurationStorageSubTab();
  }

  async clickDeleteActionInDropdown() {
    return this.actions.clickDeleteActionInDropdown();
  }

  async clickOpenWebConsoleAndCaptureNewTab(closeTab = true): Promise<string> {
    return this.console.clickOpenWebConsoleAndCaptureNewTab(closeTab);
  }

  async clickPauseActionIcon() {
    return this.actions.clickPauseActionIcon();
  }

  async clickPvcLink(volumeName: string): Promise<boolean> {
    return this.configuration.clickPvcLink(volumeName);
  }

  async clickResetActionIcon() {
    return this.actions.clickResetActionIcon();
  }

  async clickRestartActionIcon() {
    return this.actions.clickRestartActionIcon();
  }

  async clickRestartButton() {
    return this.actions.clickRestartButton();
  }

  async clickSeverityCard(severity: 'critical' | 'warning' | 'healthy' | 'all'): Promise<void> {
    return this.diagnostics.clickSeverityCard(severity);
  }

  async clickSnapshot(snapshotName: string): Promise<void> {
    return this.metricsSnapshots.clickSnapshot(snapshotName);
  }

  async clickStandaloneConsoleLink(vmName: string, namespace: string): Promise<void> {
    return this.console.clickStandaloneConsoleLink(vmName, namespace);
  }

  async clickStartActionIcon() {
    return this.actions.clickStartActionIcon();
  }

  async clickStatusAndVerifyLearnMoreInDialog(): Promise<boolean> {
    return this.actions.clickStatusAndVerifyLearnMoreInDialog();
  }

  async clickStopActionButton() {
    return this.actions.clickStopActionButton();
  }

  async clickStopActionIcon() {
    return this.actions.clickStopActionIcon();
  }

  async clickUnpauseActionIcon() {
    return this.actions.clickUnpauseActionIcon();
  }

  async clickVmActionsDropdown() {
    return this.actions.clickVmActionsDropdown();
  }

  async clickVmiByTestId(vmName: string): Promise<void> {
    const vmiLocator = this.locator(`[data-test-id="${vmName}"]`).first();
    await vmiLocator.waitFor({ state: 'visible', timeout: TestTimeouts.UI_ELEMENT_VISIBILITY });
    await this.robustClick(vmiLocator);
  }

  async clickVncConnectButton(): Promise<void> {
    return this.console.clickVncConnectButton();
  }

  async clickVncEmptyStateConnectButton(): Promise<void> {
    return this.console.clickVncEmptyStateConnectButton();
  }

  async copyNicFqdn(nicName: string): Promise<string | null> {
    return this.scheduling.copyNicFqdn(nicName);
  }

  async createBootableVolumeFromDisk(
    diskName: string,
    bootableVolumeName: string,
  ): Promise<boolean> {
    return this.disks.createBootableVolumeFromDisk(diskName, bootableVolumeName);
  }

  async createVmFromSnapshot(
    snapshotName: string,
    vmName: string,
    startAfterCreation = false,
  ): Promise<boolean> {
    return this.metricsSnapshots.createVmFromSnapshot(snapshotName, vmName, startAfterCreation);
  }

  async deleteSnapshotFromRow(snapshotName: string): Promise<void> {
    return this.metricsSnapshots.deleteSnapshotFromRow(snapshotName);
  }

  async deleteVm() {
    return this.actions.deleteVm();
  }

  async detachDisk(diskName: string): Promise<boolean> {
    return this.disks.detachDisk(diskName);
  }

  async editDetails(
    vmName: string,
    vmData: {
      description?: string;
      bootMode?: string;
      hostname?: string;
      workload?: string;
      headless?: boolean;
      startInPause?: boolean;
    },
  ): Promise<void> {
    return this.configuration.editDetails(vmName, vmData);
  }

  async editRunStrategy(strategy: string): Promise<boolean> {
    return this.scheduling.editRunStrategy(strategy);
  }

  async editRunStrategyViaActionsMenu(strategy: string): Promise<boolean> {
    return this.scheduling.editRunStrategyViaActionsMenu(strategy);
  }

  async ejectCdrom(diskName?: string): Promise<boolean> {
    return this.disks.ejectCdrom(diskName);
  }

  async ejectCdromByVolumeName(volumeName: string): Promise<boolean> {
    return this.disks.ejectCdromByVolumeName(volumeName);
  }

  async enableSSHOverLoadBalancer(): Promise<boolean> {
    return this.scheduling.enableSSHOverLoadBalancer();
  }

  async enableSSHOverNodePort(nodeAddress?: string): Promise<boolean> {
    return this.scheduling.enableSSHOverNodePort(nodeAddress);
  }

  async expandAlertsAccordion(): Promise<void> {
    return this.alerts.expandAlertsAccordion();
  }

  async expandWarningSeverityAccordion(): Promise<void> {
    return this.alerts.expandWarningSeverityAccordion();
  }

  async getAffinityRulesButtonText(): Promise<string> {
    return this.scheduling.getAffinityRulesButtonText();
  }

  async getAlertMoreLinkText(): Promise<string> {
    return this.alerts.getAlertMoreLinkText();
  }

  async getCDROMModalOptions(): Promise<{
    title: string;
    radioLabels: string[];
    defaultSelected: string;
    submitButtonLabel: string;
  }> {
    return this.disks.getCDROMModalOptions();
  }
  async getCloudInitValues(): Promise<{ username: string; password: string } | null> {
    return this.diagnostics.getCloudInitValues();
  }
  override getCurrentUrl(): string {
    return this.metricsSnapshots.getCurrentUrl();
  }
  async getDiagnosticsOverviewCardCounts(): Promise<{
    critical: number;
    warnings: number;
    healthy: number;
    allStatuses: number;
  }> {
    return this.diagnostics.getDiagnosticsOverviewCardCounts();
  }
  async getDiagnosticsTabBadgeCount(): Promise<number | null> {
    return this.diagnostics.getDiagnosticsTabBadgeCount();
  }
  async getDiskDriveValue(diskName: string): Promise<string | null> {
    return this.disks.getDiskDriveValue(diskName);
  }
  async getDiskInterfaceValue(diskName: string): Promise<string | null> {
    return this.disks.getDiskInterfaceValue(diskName);
  }

  async getDiskSizeValue(diskName: string): Promise<string | null> {
    return this.disks.getDiskSizeValue(diskName);
  }

  async getEditDiskModalSizeInfo(diskName: string): Promise<{
    value: string | null;
    unit: string | null;
    decrementDisabled: boolean;
  }> {
    return this.disks.getEditDiskModalSizeInfo(diskName);
  }
  async getFirstSnapshotNameFromSnapshotsTable(
    timeoutMs: number = TestTimeouts.STATUS_VALIDATION,
  ): Promise<string> {
    return this.metricsSnapshots.getFirstSnapshotNameFromSnapshotsTable(timeoutMs);
  }
  async getLiveMigrationProgressText(): Promise<string> {
    return this.metricsSnapshots.getLiveMigrationProgressText();
  }
  async getMetricsNetworkInterfaceOptions(): Promise<string[]> {
    return this.metricsSnapshots.getMetricsNetworkInterfaceOptions();
  }
  async getMetricsNotAvailableCardTitles(
    timeout: number = TestTimeouts.DEFAULT,
  ): Promise<string[]> {
    return this.metricsSnapshots.getMetricsNotAvailableCardTitles(timeout);
  }
  async getMigrationChartQueryHrefs(): Promise<{ dataChart: string; transferRateChart: string }> {
    return this.metricsSnapshots.getMigrationChartQueryHrefs();
  }
  async getMountCDROMModalOptions(diskName: string): Promise<{
    title: string;
    radioLabels: string[];
    defaultSelected: string;
    hasUploadModeSelector: boolean;
  }> {
    return this.disks.getMountCDROMModalOptions(diskName);
  }
  async getRunStrategyValue(): Promise<string> {
    return this.scheduling.getRunStrategyValue();
  }

  async getSerialConsoleTerminalWidth(): Promise<number> {
    return this.console.getSerialConsoleTerminalWidth();
  }

  async getStatusConditionRows(): Promise<Array<{ conditionType: string; status: string }>> {
    return this.diagnostics.getStatusConditionRows();
  }

  async getStorageUtilizationText(): Promise<string | null> {
    return this.overviewTab.getStorageUtilizationText();
  }

  async getVmiDiskColumnValue(
    diskName: string,
    column: 'drive' | 'interface' | 'name' | 'source' | 'size',
  ): Promise<string | null> {
    return this.disks.getVmiDiskColumnValue(diskName, column);
  }

  async increaseCpuAndMemory(): Promise<void> {
    return this.configuration.increaseCpuAndMemory();
  }

  async isAddDiskButtonEnabled(): Promise<boolean> {
    return this.disks.isAddDiskButtonEnabled();
  }

  async isDeleteActionDisabled(): Promise<boolean> {
    return this.actions.isDeleteActionDisabled();
  }

  async isDeleteProtectionSet(): Promise<boolean> {
    return this.actions.isDeleteProtectionSet();
  }

  async isDiagnosticsTabVisible(): Promise<boolean> {
    return this.navigation.isDiagnosticsTabVisible();
  }

  async isHorizontalNavbarRoutesPresent(): Promise<boolean> {
    return this.navigation.isHorizontalNavbarRoutesPresent();
  }

  async isMetricsNetworkDropdownVisible(
    timeout: number = TestTimeouts.UI_VISIBILITY_QUICK,
  ): Promise<boolean> {
    return this.metricsSnapshots.isMetricsNetworkDropdownVisible(timeout);
  }

  async isMetricsPrometheusWarningAlertVisible(
    timeout: number = TestTimeouts.DEFAULT,
  ): Promise<boolean> {
    return this.metricsSnapshots.isMetricsPrometheusWarningAlertVisible(timeout);
  }

  async isMetricsTimeRangeVisible(
    timeout: number = TestTimeouts.UI_VISIBILITY_QUICK,
  ): Promise<boolean> {
    return this.metricsSnapshots.isMetricsTimeRangeVisible(timeout);
  }

  async isMigrationSectionVisible(): Promise<boolean> {
    return this.metricsSnapshots.isMigrationSectionVisible();
  }

  async isOpenWebConsoleButtonVisible(
    timeout: number = TestTimeouts.ELEMENT_WAIT,
  ): Promise<boolean> {
    return this.console.isOpenWebConsoleButtonVisible(timeout);
  }

  async isSaveAsTemplateRunningAlertVisible(): Promise<boolean> {
    return this.actions.isSaveAsTemplateRunningAlertVisible();
  }

  async isTabBarVisibleAfterScroll(): Promise<boolean> {
    return this.navigation.isTabBarVisibleAfterScroll();
  }

  async isTextVisible(text: string, timeout: number = TestTimeouts.ELEMENT_WAIT): Promise<boolean> {
    return this.console.isTextVisible(text, timeout);
  }

  async isVmNameSpanVisible(
    vmName: string,
    timeout: number = TestTimeouts.DEFAULT,
  ): Promise<boolean> {
    return this.actions.isVmNameSpanVisible(vmName, timeout);
  }

  async isVmNameVisible(
    expectedName?: string,
    timeout: number = TestTimeouts.DEFAULT,
  ): Promise<boolean> {
    return this.actions.isVmNameVisible(expectedName, timeout);
  }

  async isVncConsoleActive(): Promise<boolean> {
    return this.console.isVncConsoleActive();
  }

  async isVolumeRestorePolicyAbsent(): Promise<boolean> {
    return this.metricsSnapshots.isVolumeRestorePolicyAbsent();
  }

  async makeDiskPersistent(diskName: string): Promise<boolean> {
    return this.disks.makeDiskPersistent(diskName);
  }

  async mockFilesystemListResponse(mockData: {
    items: Array<{
      diskName: string;
      mountPoint: string;
      fileSystemType: string;
      totalBytes: number;
      usedBytes: number;
    }>;
  }): Promise<void> {
    return this.overviewTab.mockFilesystemListResponse(mockData);
  }

  async mockMetricsPrometheusResponses(): Promise<void> {
    return this.metricsSnapshots.mockMetricsPrometheusResponses();
  }

  async mockPrometheusRulesWithWarning(vmName: string, namespace: string): Promise<void> {
    return this.alerts.mockPrometheusRulesWithWarning(vmName, namespace);
  }

  async mountCdrom(
    diskName: string,
    source: string,
    sourceType: 'pvc' | 'upload' = 'pvc',
  ): Promise<boolean> {
    return this.disks.mountCdrom(diskName, source, sourceType);
  }

  async navigateToConfigurationDetails() {
    await this.configuration.navigateToConfigurationDetails();
  }

  async navigateToConfigurationInitialRun() {
    return this.navigation.navigateToConfigurationInitialRun();
  }

  async navigateToConfigurationMetadata() {
    return this.navigation.navigateToConfigurationMetadata();
  }

  async navigateToConfigurationNetwork() {
    return this.navigation.navigateToConfigurationNetwork();
  }

  async navigateToConfigurationScheduling() {
    await this.scheduling.navigateToConfigurationScheduling();
  }

  async navigateToConfigurationSSH() {
    await this.scheduling.navigateToConfigurationSSH();
  }

  async navigateToConfigurationStorage() {
    await this.configuration.navigateToConfigurationStorage();
  }

  async navigateToConfigurationTab() {
    return this.navigation.navigateToConfigurationTab();
  }

  async navigateToConsole() {
    return this.navigation.navigateToConsole();
  }

  async navigateToDiagnostics() {
    return this.navigation.navigateToDiagnostics();
  }

  async navigateToDisks(): Promise<void> {
    return this.navigation.navigateToDisks();
  }

  async navigateToEvents() {
    return this.navigation.navigateToEvents();
  }

  async navigateToMetrics() {
    return this.navigation.navigateToMetrics();
  }

  async navigateToNetworks(): Promise<void> {
    return this.navigation.navigateToNetworks();
  }

  async navigateToNetworkTabFromOverview(): Promise<void> {
    return this.network.navigateToNetworkTabFromOverview();
  }

  async navigateToOverview() {
    return this.navigation.navigateToOverview();
  }

  async navigateToScheduling(): Promise<void> {
    return this.navigation.navigateToScheduling();
  }

  async navigateToSnapshots() {
    return this.navigation.navigateToSnapshots();
  }

  async navigateToVirtualMachineDetail(vmName: string, namespace: string) {
    return this.navigation.navigateToVirtualMachineDetail(vmName, namespace);
  }

  async navigateToVmiDisksTab(vmName: string, namespace: string): Promise<void> {
    return this.disks.navigateToVmiDisksTab(vmName, namespace);
  }

  async navigateToVmSchedulingDirect(vmName: string, namespace: string): Promise<void> {
    return this.scheduling.navigateToVmSchedulingDirect(vmName, namespace);
  }

  async navigateToVncConsoleAndWaitReady(): Promise<boolean> {
    return this.console.navigateToVncConsoleAndWaitReady();
  }

  async navigateToYAML() {
    return this.navigation.navigateToYAML();
  }

  async openActionsDropdownAndClickMigrateCompute(): Promise<void> {
    return this.actions.openActionsDropdownAndClickMigrateCompute();
  }

  async openAffinityRulesModal(): Promise<void> {
    return this.scheduling.openAffinityRulesModal();
  }

  async openPreferredAffinityRuleForm(): Promise<void> {
    return this.scheduling.openPreferredAffinityRuleForm();
  }

  async openRestoreModalForSnapshot(snapshotName: string): Promise<void> {
    return this.metricsSnapshots.openRestoreModalForSnapshot(snapshotName);
  }

  async openWebConsoleAndCheckForRhacmError(
    loadWait = 3000,
  ): Promise<{ url: string; rhacmErrorVisible: boolean }> {
    return this.console.openWebConsoleAndCheckForRhacmError(loadWait);
  }

  async pastePasswordToVncConsole(): Promise<boolean> {
    return this.console.pastePasswordToVncConsole();
  }

  async pasteUsernameToVncConsole(): Promise<boolean> {
    return this.console.pasteUsernameToVncConsole();
  }

  async pauseVmFromActionsDropdown() {
    return this.actions.pauseVmFromActionsDropdown();
  }

  async performVncConsolePaste(): Promise<void> {
    return this.console.performVncConsolePaste();
  }

  async resetVmFromActionsDropdown() {
    return this.actions.resetVmFromActionsDropdown();
  }

  async resizeDisk(diskName: string, newSize: string): Promise<boolean> {
    return this.disks.resizeDisk(diskName, newSize);
  }

  async restartVmFromActionsDropdown() {
    return this.actions.restartVmFromActionsDropdown();
  }

  async restoreTemplateDefaults(): Promise<void> {
    return this.configuration.restoreTemplateDefaults();
  }

  async restoreVmFromSnapshot(
    snapshotName: string,
  ): Promise<{ success: boolean; payload?: unknown }> {
    return this.metricsSnapshots.restoreVmFromSnapshot(snapshotName);
  }

  async saveAsTemplate(templateName: string, project: string): Promise<void> {
    return this.actions.saveAsTemplate(templateName, project);
  }

  async searchConfiguration(searchTerm: string, expectedResult?: string): Promise<boolean> {
    return this.configuration.searchConfiguration(searchTerm, expectedResult);
  }

  async searchDiagnostics(text: string): Promise<void> {
    return this.diagnostics.searchDiagnostics(text);
  }
  async selectMetricsNetworkInterface(nicName: string): Promise<{
    urlBefore: string;
    urlAfter: string;
  }> {
    return this.metricsSnapshots.selectMetricsNetworkInterface(nicName);
  }
  async setDeleteProtection() {
    return this.actions.setDeleteProtection();
  }
  async setDescheduler(enabled: boolean): Promise<boolean> {
    return this.scheduling.setDescheduler(enabled);
  }
  async setWindowsDriversOnDiskTab(mount: boolean): Promise<boolean> {
    return this.disks.setWindowsDriversOnDiskTab(mount);
  }
  async startVmFromActionsDropdown() {
    return this.actions.startVmFromActionsDropdown();
  }
  async stopVmFromActionsDropdown() {
    return this.actions.stopVmFromActionsDropdown();
  }
  async switchToSerialConsole(): Promise<void> {
    return this.console.switchToSerialConsole();
  }
  async takeSnapshot(snapshotName: string): Promise<boolean> {
    return this.metricsSnapshots.takeSnapshot(snapshotName);
  }
  async tryDismissVncTryLaterDialog(
    timeout: number = TestTimeouts.UI_DELAY_LONG,
  ): Promise<boolean> {
    return this.console.tryDismissVncTryLaterDialog(timeout);
  }
  async typeInAffinityWeightInput(text: string): Promise<string> {
    return this.scheduling.typeInAffinityWeightInput(text);
  }
  async unpauseVmFromActionsDropdown() {
    return this.actions.unpauseVmFromActionsDropdown();
  }
  async unsetDeleteProtection() {
    return this.actions.unsetDeleteProtection();
  }
  async updateCloudInit(username: string, password: string): Promise<boolean> {
    return this.diagnostics.updateCloudInit(username, password);
  }
  async verifyActiveUsers(present: boolean, timeout = 60000): Promise<boolean> {
    return this.console.verifyActiveUsers(present, timeout);
  }
  async verifyAlertsCard(): Promise<boolean> {
    return this.alerts.verifyAlertsCard();
  }
  async verifyAnnotations(): Promise<boolean> {
    return this.diagnostics.verifyAnnotations();
  }
  async verifyAnnotationsInOverview(): Promise<boolean> {
    return this.overviewTab.verifyAnnotationsInOverview();
  }
  async verifyBootMode(vmName: string, expectedBootMode: string): Promise<boolean> {
    return this.configuration.verifyBootMode(vmName, expectedBootMode);
  }
  async verifyCloudInit(): Promise<boolean> {
    return this.diagnostics.verifyCloudInit();
  }
  async verifyCloudInitCredentialsInConsole(): Promise<boolean> {
    return this.diagnostics.verifyCloudInitCredentialsInConsole();
  }
  async verifyCloudInitInYAML(
    expectedUsername?: string,
    expectedPassword?: string,
  ): Promise<boolean> {
    return this.diagnostics.verifyCloudInitInYAML(expectedUsername, expectedPassword);
  }
  async verifyConfigurationDetails(vmName: string, expectedWorkload?: string): Promise<boolean> {
    return this.configuration.verifyConfigurationDetails(vmName, expectedWorkload);
  }
  /** Returns true if the Configuration → Network table row for the NIC shows the expected NAD name in the third cell. */
  async verifyConfigurationNetworkNicDisplaysNad(
    nicName: string,
    expectedNadName: string,
  ): Promise<boolean> {
    try {
      await this.navigateToConfigurationNetwork();
      const nicRow = this.locator(`tr.pf-v6-c-table__tr:has-text("${nicName}")`);
      await nicRow.waitFor({ state: 'visible', timeout: TestTimeouts.UI_VISIBILITY_QUICK });
      const networkCell = nicRow.locator('td').nth(2);
      await networkCell.waitFor({ state: 'visible', timeout: TestTimeouts.UI_VISIBILITY_QUICK });
      const text = (await networkCell.textContent())?.trim() ?? '';
      return text.includes(expectedNadName);
    } catch {
      return false;
    }
  }
  async verifyConsoleNotVisible(): Promise<boolean> {
    return this.console.verifyConsoleNotVisible();
  }
  async verifyCpuMemory(cpu: string, mem: string): Promise<boolean> {
    return this.configuration.verifyCpuMemory(cpu, mem);
  }
  async verifyDedicatedResources(expectedText: string): Promise<boolean> {
    return this.configuration.verifyDedicatedResources(expectedText);
  }
  async verifyDeschedulerIsOn(): Promise<boolean> {
    return this.scheduling.verifyDeschedulerIsOn();
  }
  async verifyDescription(vmName: string, expectedDescription: string): Promise<boolean> {
    return this.configuration.verifyDescription(vmName, expectedDescription);
  }
  async verifyDetailsCard(
    vmName: string,
    templateName?: string,
    options?: { requireVncPreview?: boolean },
  ): Promise<boolean> {
    return this.actions.verifyDetailsCard(vmName, templateName, options);
  }
  async verifyDiskDoesNotExist(diskName: string): Promise<boolean> {
    return this.disks.verifyDiskDoesNotExist(diskName);
  }
  async verifyDiskDoesNotHavePersistentHotplugLabel(diskName: string): Promise<boolean> {
    return this.disks.verifyDiskDoesNotHavePersistentHotplugLabel(diskName);
  }
  async verifyDiskExists(diskName: string): Promise<boolean> {
    return this.configuration.verifyDiskExists(diskName);
  }
  async verifyDiskExistsByDataLabelName(diskName: string): Promise<boolean> {
    return this.configuration.verifyDiskExistsByDataLabelName(diskName);
  }
  /**
   * Verify disk exists by checking for data-test attribute containing the disk name.
   * Uses pattern: [data-test*="diskName"] to match elements like
   * data-test="pw-vm-detach-disk-xxx-cdrom-iso-upload-diskname"
   */
  async verifyDiskExistsByDataTest(diskName: string): Promise<boolean> {
    return this.configuration.verifyDiskExistsByDataTest(diskName);
  }
  async verifyDiskExistsByDataTestId(diskName: string): Promise<boolean> {
    return this.configuration.verifyDiskExistsByDataTestId(diskName);
  }
  /**
   * Verify disk exists by data-test-id pattern: dv-{vmName}-{diskName}-k8ntab
   * @param vmName - The VM name
   * @param diskName - The disk name
   * @returns true if the disk with the expected data-test-id exists
   */
  async verifyDiskExistsByDataTestIdPattern(vmName: string, diskName: string): Promise<boolean> {
    return this.configuration.verifyDiskExistsByDataTestIdPattern(vmName, diskName);
  }
  async verifyDiskHasAutoDetachHotplugLabel(diskName: string): Promise<boolean> {
    return this.disks.verifyDiskHasAutoDetachHotplugLabel(diskName);
  }
  async verifyDiskHasPersistentHotplugLabel(diskName: string): Promise<boolean> {
    return this.disks.verifyDiskHasPersistentHotplugLabel(diskName);
  }
  async verifyDiskNameExists(diskName: string): Promise<boolean> {
    return this.configuration.verifyDiskNameExists(diskName);
  }
  /**
   * Verifies a disk row is visible by exact `data-test-id` (e.g. `disk-rootdisk`, uploaded ISO DV name).
   */
  async verifyDiskRowVisibleByExactDataTestId(dataTestId: string): Promise<boolean> {
    return this.configuration.verifyDiskRowVisibleByExactDataTestId(dataTestId);
  }
  async verifyDisksCard(): Promise<boolean> {
    return this.overviewWidgets.verifyDisksCard();
  }
  async verifyDiskSource(diskName: string, expectedSource: string): Promise<boolean> {
    return this.disks.verifyDiskSource(diskName, expectedSource);
  }
  /**
   * Verify disk exists by data-test-id pattern: dv-{vmName}-{diskName}-k8ntab
   * @param vmName - The VM name
   * @param diskName - The disk name
   * @returns true if the disk with the expected data-test-id exists
   */
  async verifyDiskSourceByDataTestId(vmName: string, diskName: string): Promise<boolean> {
    return this.configuration.verifyDiskSourceByDataTestId(vmName, diskName);
  }
  async verifyDiskSourceVisible(sourceValue: string): Promise<boolean> {
    return this.disks.verifyDiskSourceVisible(sourceValue);
  }
  async verifyDiskStorageClass(diskName: string, expectedStorageClass: string): Promise<boolean> {
    return this.configuration.verifyDiskStorageClass(diskName, expectedStorageClass);
  }
  async verifyDownload(): Promise<boolean> {
    return await super.verifyTextVisible('Download');
  }
  async verifyEvictionStrategyLiveMigrate(): Promise<boolean> {
    return this.configuration.verifyEvictionStrategyLiveMigrate();
  }
  async verifyEvictionStrategyNone(): Promise<boolean> {
    return this.configuration.verifyEvictionStrategyNone();
  }
  async verifyFolderVisible(folderName: string, namespace?: string): Promise<boolean> {
    return this.diagnostics.verifyFolderVisible(folderName, namespace);
  }
  async verifyGuestLogin(): Promise<boolean> {
    return this.console.verifyGuestLogin();
  }
  async verifyGuestSystemLogDisabled(): Promise<boolean> {
    return this.diagnostics.verifyGuestSystemLogDisabled();
  }
  async verifyGuestSystemLogEnabled(): Promise<boolean> {
    return this.diagnostics.verifyGuestSystemLogEnabled();
  }
  async verifyHardwareDevicesCard(): Promise<boolean> {
    return this.overviewTab.verifyHardwareDevicesCard();
  }
  async verifyHeadlessChecked(expectedChecked: boolean): Promise<boolean> {
    return this.configuration.verifyHeadlessChecked(expectedChecked);
  }
  async verifyHeadlessMode(): Promise<boolean> {
    return this.diagnostics.verifyHeadlessMode();
  }
  async verifyHeadlessServiceFQDN(
    vmName: string,
    namespace: string,
    hostname?: string,
  ): Promise<boolean> {
    return this.network.verifyHeadlessServiceFQDN(vmName, namespace, hostname);
  }
  async verifyHostname(vmName: string, expectedHostname: string): Promise<boolean> {
    return this.overviewTab.verifyHostname(vmName, expectedHostname);
  }
  async verifyInstanceType(expectedInstanceType: string): Promise<boolean> {
    return this.actions.verifyInstanceType(expectedInstanceType);
  }
  async verifyIpAddress(ipAddress: string, timeout = 60000): Promise<boolean> {
    return this.network.verifyIpAddress(ipAddress, timeout);
  }
  async verifyL2BridgeExists(): Promise<boolean> {
    try {
      await this.navigation.navigateToConfigurationNetwork();
      const isVisible = await this.locator('text=L2 bridge')
        .isVisible({ timeout: TestTimeouts.VM_CREATION })
        .catch(() => false);
      return isVisible;
    } catch {
      return false;
    }
  }
  async verifyMasqueradeDoesNotExist(): Promise<boolean> {
    try {
      await this.navigation.navigateToConfigurationNetwork();
      const isVisible = await this.locator('text=Masquerade')
        .isVisible({ timeout: TestTimeouts.INSTANCE_TYPE_VERIFICATION })
        .catch(() => false);
      return !isVisible; // Return true if it doesn't exist (which is what we want)
    } catch {
      return true; // If we can't find it, that's what we want
    }
  }
  // --- Composed sub-pages: one-line delegations (public API preserved on VirtualMachineDetailPage) ---
  async verifyMetricsNetworkHasData(): Promise<boolean> {
    return this.metricsSnapshots.verifyMetricsNetworkHasData();
  }
  async verifyMetricsTimeRangeIs(expectedTimeRange: string): Promise<boolean> {
    return this.metricsSnapshots.verifyMetricsTimeRangeIs(expectedTimeRange);
  }
  async verifyNetworkInterfacesCard(): Promise<boolean> {
    return this.network.verifyNetworkInterfacesCard();
  }
  async verifyNoErrorBoundary(waitMs = 3000): Promise<boolean> {
    const errorIndicator = this.page.locator('text=Something wrong happened');
    const hasError = await errorIndicator.isVisible({ timeout: waitMs }).catch(() => false);
    return !hasError;
  }
  async verifyNoSnapshots(): Promise<boolean> {
    return this.metricsSnapshots.verifyNoSnapshots();
  }
  async verifyNoSnapshotsFoundInLoadingBox(): Promise<boolean> {
    return this.metricsSnapshots.verifyNoSnapshotsFoundInLoadingBox();
  }
  async verifyNoVirtualMachineSnapshotsEmptyState(): Promise<boolean> {
    return this.metricsSnapshots.verifyNoVirtualMachineSnapshotsEmptyState();
  }
  async verifyOperatingSystem(): Promise<boolean> {
    return this.overviewTab.verifyOperatingSystem();
  }
  async verifyOS(expectedOS: string): Promise<boolean> {
    return this.overviewTab.verifyOS(expectedOS);
  }
  /**
   * Returns true if the overview Network interfaces table row for the given NIC shows the IP.
   */
  async verifyOverviewNetworkInterfaceRowHasIp(
    nicName: string,
    ipAddress: string,
    timeout = 60000,
  ): Promise<boolean> {
    try {
      const table = this.locator('[data-test="vm-network-interface-list"]');
      await table.waitFor({ state: 'visible', timeout: TestTimeouts.VM_CREATION });
      const row = table.locator('tr').filter({ hasText: nicName }).filter({ hasText: ipAddress });
      await row.first().waitFor({ state: 'visible', timeout });
      return true;
    } catch {
      return false;
    }
  }
  async verifyPageTabsVisible(): Promise<boolean> {
    return this.navigation.verifyPageTabsVisible();
  }
  async verifyPodNetworking(): Promise<boolean> {
    return this.diagnostics.verifyPodNetworking();
  }
  async verifyPvcDetailsPage(): Promise<boolean> {
    return this.configuration.verifyPvcDetailsPage();
  }
  async verifyRootdisk(): Promise<boolean> {
    return this.diagnostics.verifyRootdisk();
  }
  async verifySchedulingAndResourceRequirements(): Promise<boolean> {
    return this.diagnostics.verifySchedulingAndResourceRequirements();
  }
  async verifySecretOnSSHTab(secretName: string): Promise<boolean> {
    return this.scheduling.verifySecretOnSSHTab(secretName);
  }
  async verifySerialConsoleRenderedProperly(minWidth = 200): Promise<boolean> {
    return this.console.verifySerialConsoleRenderedProperly(minWidth);
  }
  async verifySnapshotExists(snapshotName: string): Promise<boolean> {
    return this.metricsSnapshots.verifySnapshotExists(snapshotName);
  }
  async verifySnapshotInCard(): Promise<boolean> {
    return this.metricsSnapshots.verifySnapshotInCard();
  }
  async verifySnapshotsCardVisible(): Promise<boolean> {
    return this.metricsSnapshots.verifySnapshotsCardVisible();
  }
  async verifySnapshotWithSuccessIcon(): Promise<boolean> {
    return this.metricsSnapshots.verifySnapshotWithSuccessIcon();
  }
  async verifySSHAccess(): Promise<boolean> {
    return this.diagnostics.verifySSHAccess();
  }
  async verifyStatusConditions(): Promise<boolean> {
    return this.diagnostics.verifyStatusConditions();
  }
  async verifySysprepInStorage(): Promise<boolean> {
    return this.configuration.verifySysprepInStorage();
  }
  async verifyTolerations(): Promise<boolean> {
    return this.diagnostics.verifyTolerations();
  }
  async verifyUploadNewISOHasNoUploadModeSelector(): Promise<boolean> {
    return this.disks.verifyUploadNewISOHasNoUploadModeSelector();
  }
  async verifyUtilization(): Promise<boolean> {
    return this.overviewTab.verifyUtilization();
  }
  async verifyUtilizationCard(): Promise<boolean> {
    return this.overviewTab.verifyUtilizationCard();
  }
  async verifyVirtualMachineStuckInUnhealthyStateWarningVisible(): Promise<boolean> {
    return this.alerts.verifyVirtualMachineStuckInUnhealthyStateWarningVisible();
  }
  async verifyVMCannotBeEvictedWarningVisible(): Promise<boolean> {
    return this.alerts.verifyVMCannotBeEvictedWarningVisible();
  }
  async verifyVmHasNoNics(): Promise<boolean> {
    try {
      await this.navigation.navigateToConfigurationNetwork();
      await this.page.waitForTimeout(TestTimeouts.UI_DELAY_LONG);

      await this.locator('text=No network interface definitions found').waitFor({
        state: 'visible',
        timeout: TestTimeouts.INSTANCE_TYPE_VERIFICATION,
      });
      return true;
    } catch {
      return false;
    }
  }
  async verifyVmOverviewStatus(expectedStatus: string): Promise<boolean> {
    return this.actions.verifyVmOverviewStatus(expectedStatus);
  }
  async verifyVmStartEvent(timeout: number = TestTimeouts.DEFAULT): Promise<boolean> {
    const eventText = `Streaming events...`;
    return await super.verifyTextVisible(eventText, true, timeout);
  }
  async verifyVncConsoleReady(timeout: number = TestTimeouts.VNC_CONSOLE_READY): Promise<boolean> {
    return this.console.verifyVncConsoleReady(timeout);
  }
  async verifyVncDisplaySwitching(): Promise<boolean> {
    return this.console.verifyVncDisplaySwitching();
  }
  async verifyVnumaBadge(): Promise<boolean> {
    return this.scheduling.verifyVnumaBadge();
  }
  async verifyWindowsDriversCheckbox(shouldBeChecked: boolean): Promise<boolean> {
    return this.disks.verifyWindowsDriversCheckbox(shouldBeChecked);
  }
  async verifyWindowsDriversDisk(shouldExist: boolean): Promise<boolean> {
    return this.disks.verifyWindowsDriversDisk(shouldExist);
  }
  async verifyWorkload(vmName: string, expectedWorkload: string): Promise<boolean> {
    return this.configuration.verifyWorkload(vmName, expectedWorkload);
  }
  /**
   * Short settle for guest OS metadata before reads.
   */
  async waitForGuestOsInfoResponse(
    vmName: string,
    namespace: string,
    timeout: number = TestTimeouts.DEFAULT,
  ): Promise<void> {
    void vmName;
    void namespace;
    await this.page.waitForTimeout(Math.min(TestTimeouts.NETWORK_DELAY, timeout));
  }
  async waitForPendingChanges(timeout = 60000): Promise<boolean> {
    return this.configuration.waitForPendingChanges(timeout);
  }
  async waitForPendingChangesToDisappear(timeout = 60000): Promise<boolean> {
    return this.configuration.waitForPendingChangesToDisappear(timeout);
  }
  async waitForVmOverviewStatusContains(
    expectedSubstring: string,
    timeout: number = TestTimeouts.DEFAULT,
  ): Promise<void> {
    return this.actions.waitForVmOverviewStatusContains(expectedSubstring, timeout);
  }
  async waitForVncConsoleActive(
    timeout: number = TestTimeouts.VNC_CONSOLE_READY,
  ): Promise<boolean> {
    return this.console.waitForVncConsoleActive(timeout);
  }
  async waitForVncConsoleConnected(timeout?: number): Promise<boolean> {
    return this.console.waitForVncConsoleConnected(timeout);
  }
}
