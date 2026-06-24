// VirtualMachineDetailPage — Page object for virtual machine detail interactions.

import {
  VirtualMachineDetailActionsComponent,
  VirtualMachineDetailAlertsComponent,
} from '@/components/vm/vm-detail-actions-components';
import { VirtualMachineDetailConfigurationComponent } from '@/components/vm/vm-detail-config-components';
import {
  VirtualMachineDetailConsoleComponent,
  VirtualMachineDetailDiagnosticsComponent,
} from '@/components/vm/vm-detail-console-components';
import {
  VirtualMachineDetailNetworkComponent,
  VirtualMachineDetailOverviewTabComponent,
  VirtualMachineDetailOverviewWidgetsComponent,
  VirtualMachineDetailSchedulingComponent,
} from '@/components/vm/vm-detail-overview-scheduling-components';
import {
  VirtualMachineDetailDisksComponent,
  VirtualMachineDetailMetricsSnapshotsComponent,
  VirtualMachineDetailNavigationComponent,
} from '@/components/vm/vm-detail-storage-metrics-components';
import { DISK_NAMES } from '@/data-models';
import { TestTimeouts } from '@/utils/test-config';
import type { Page } from '@playwright/test';

import PageCommons from '../page-commons';

export class VirtualMachineDetailPage extends PageCommons {
  // VM action locators - inherited from PageCommons:
  // _vmActionsDropdown, _vmControlMenu, _vmActionStart, _vmActionStop, _vmActionStopButton,
  // _vmActionRestart, _vmActionRestartButton, _vmActionReset, _vmActionPause, _vmActionPauseButton,
  // _vmActionUnpause, _vmActionUnpauseButton, _vmActionClone, _vmActionDelete
  override readonly _createButton = this.locator(
    'button.pf-v6-c-button.pf-m-primary.pf-m-progress',
  );

  readonly configuration: VirtualMachineDetailConfigurationComponent;
  readonly scheduling: VirtualMachineDetailSchedulingComponent;
  readonly disks: VirtualMachineDetailDisksComponent;
  readonly console: VirtualMachineDetailConsoleComponent;
  readonly metricsSnapshots: VirtualMachineDetailMetricsSnapshotsComponent;
  readonly diagnostics: VirtualMachineDetailDiagnosticsComponent;
  readonly overviewWidgets: VirtualMachineDetailOverviewWidgetsComponent;
  readonly alerts: VirtualMachineDetailAlertsComponent;
  readonly network: VirtualMachineDetailNetworkComponent;
  readonly detailNav: VirtualMachineDetailNavigationComponent;
  readonly actions: VirtualMachineDetailActionsComponent;
  readonly overviewTab: VirtualMachineDetailOverviewTabComponent;

  constructor(page: Page) {
    super(page);
    this.configuration = new VirtualMachineDetailConfigurationComponent(page);
    this.scheduling = new VirtualMachineDetailSchedulingComponent(page);
    this.disks = new VirtualMachineDetailDisksComponent(page);
    this.console = new VirtualMachineDetailConsoleComponent(page);
    this.metricsSnapshots = new VirtualMachineDetailMetricsSnapshotsComponent(page);
    this.diagnostics = new VirtualMachineDetailDiagnosticsComponent(page);
    this.overviewWidgets = new VirtualMachineDetailOverviewWidgetsComponent(page);
    this.alerts = new VirtualMachineDetailAlertsComponent(page);
    this.network = new VirtualMachineDetailNetworkComponent(page);
    this.detailNav = new VirtualMachineDetailNavigationComponent(page);
    this.actions = new VirtualMachineDetailActionsComponent(page);
    this.overviewTab = new VirtualMachineDetailOverviewTabComponent(
      page,
      this.overviewWidgets,
      this.configuration,
    );
  }

  async verifyMetricsNetworkHasData(): Promise<boolean> {
    return this.metricsSnapshots.verifyMetricsNetworkHasData();
  }

  async verifySnapshotsCardVisible(): Promise<boolean> {
    return this.metricsSnapshots.verifySnapshotsCardVisible();
  }

  async verifySnapshotInCard(): Promise<boolean> {
    return this.metricsSnapshots.verifySnapshotInCard();
  }

  async isAddDiskButtonEnabled(): Promise<boolean> {
    return this.disks.isAddDiskButtonEnabled();
  }

  async getCDROMModalOptions(): Promise<{
    title: string;
    radioLabels: string[];
    defaultSelected: string;
    submitButtonLabel: string;
  }> {
    return this.disks.getCDROMModalOptions();
  }

  async verifyUploadNewISOHasNoUploadModeSelector(): Promise<boolean> {
    return this.disks.verifyUploadNewISOHasNoUploadModeSelector();
  }

  async addCDROMDisk(
    diskName: string,
    cdromSource: 'Leave empty drive' | 'Upload new ISO' | 'Use existing ISO' = 'Upload new ISO',
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

  async addBlankDisk(diskName: string, size = '1', storageClass?: string): Promise<boolean> {
    return this.disks.addBlankDisk(diskName, size, storageClass);
  }

  async makeDiskPersistent(diskName: string): Promise<boolean> {
    return this.disks.makeDiskPersistent(diskName);
  }

  async verifyDiskHasPersistentHotplugLabel(diskName: string): Promise<boolean> {
    return this.disks.verifyDiskHasPersistentHotplugLabel(diskName);
  }

  async verifyDiskDoesNotHavePersistentHotplugLabel(diskName: string): Promise<boolean> {
    return this.disks.verifyDiskDoesNotHavePersistentHotplugLabel(diskName);
  }

  async setWindowsDriversOnDiskTab(mount: boolean): Promise<boolean> {
    return this.disks.setWindowsDriversOnDiskTab(mount);
  }

  async verifyWindowsDriversCheckbox(shouldBeChecked: boolean): Promise<boolean> {
    return this.disks.verifyWindowsDriversCheckbox(shouldBeChecked);
  }

  async verifyWindowsDriversDisk(shouldExist: boolean): Promise<boolean> {
    return this.disks.verifyWindowsDriversDisk(shouldExist);
  }

  async createBootableVolumeFromDisk(
    diskName: string,
    bootableVolumeName: string,
  ): Promise<boolean> {
    return this.disks.createBootableVolumeFromDisk(diskName, bootableVolumeName);
  }

  async detachDisk(diskName: string): Promise<boolean> {
    return this.disks.detachDisk(diskName);
  }

  async verifyDiskHasAutoDetachHotplugLabel(diskName: string): Promise<boolean> {
    return this.disks.verifyDiskHasAutoDetachHotplugLabel(diskName);
  }

  async verifyDiskDoesNotExist(diskName: string): Promise<boolean> {
    return this.disks.verifyDiskDoesNotExist(diskName);
  }

  async resizeDisk(diskName: string, newSize: string): Promise<boolean> {
    return this.disks.resizeDisk(diskName, newSize);
  }

  async verifyDiskSourceVisible(sourceValue: string): Promise<boolean> {
    return this.disks.verifyDiskSourceVisible(sourceValue);
  }

  async verifyDiskSource(diskName: string, expectedSource: string): Promise<boolean> {
    return this.disks.verifyDiskSource(diskName, expectedSource);
  }

  async getDiskSizeValue(diskName: string): Promise<null | string> {
    return this.disks.getDiskSizeValue(diskName);
  }

  async getEditDiskModalSizeInfo(diskName: string): Promise<{
    value: null | string;
    unit: null | string;
    decrementDisabled: boolean;
  }> {
    return this.disks.getEditDiskModalSizeInfo(diskName);
  }

  async getDiskDriveValue(diskName: string): Promise<null | string> {
    return this.disks.getDiskDriveValue(diskName);
  }

  async getDiskInterfaceValue(diskName: string): Promise<null | string> {
    return this.disks.getDiskInterfaceValue(diskName);
  }

  async navigateToVmiDisksTab(vmName: string, namespace: string): Promise<void> {
    return this.disks.navigateToVmiDisksTab(vmName, namespace);
  }

  async getVmiDiskColumnValue(
    diskName: string,
    column: 'drive' | 'interface' | 'name' | 'size' | 'source',
  ): Promise<null | string> {
    return this.disks.getVmiDiskColumnValue(diskName, column);
  }

  async ejectCdrom(diskName?: string): Promise<boolean> {
    return this.disks.ejectCdrom(diskName);
  }

  async ejectCdromByVolumeName(volumeName: string): Promise<boolean> {
    return this.disks.ejectCdromByVolumeName(volumeName);
  }

  async mountCdrom(
    diskName: string,
    source: string,
    sourceType: 'pvc' | 'upload' = 'pvc',
  ): Promise<boolean> {
    return this.disks.mountCdrom(diskName, source, sourceType);
  }

  async getMountCDROMModalOptions(diskName: string): Promise<{
    title: string;
    radioLabels: string[];
    defaultSelected: string;
    hasUploadModeSelector: boolean;
  }> {
    return this.disks.getMountCDROMModalOptions(diskName);
  }

  async verifyConsoleNotVisible(): Promise<boolean> {
    return this.console.verifyConsoleNotVisible();
  }

  async takeSnapshot(snapshotName: string): Promise<boolean> {
    return this.metricsSnapshots.takeSnapshot(snapshotName);
  }

  async createVmFromSnapshot(
    snapshotName: string,
    vmName: string,
    startAfterCreation = false,
  ): Promise<boolean> {
    return this.metricsSnapshots.createVmFromSnapshot(snapshotName, vmName, startAfterCreation);
  }

  async restoreVmFromSnapshot(
    snapshotName: string,
  ): Promise<{ success: boolean; payload?: unknown }> {
    return this.metricsSnapshots.restoreVmFromSnapshot(snapshotName);
  }

  async isVolumeRestorePolicyAbsent(): Promise<boolean> {
    return this.metricsSnapshots.isVolumeRestorePolicyAbsent();
  }

  async openRestoreModalForSnapshot(snapshotName: string): Promise<void> {
    return this.metricsSnapshots.openRestoreModalForSnapshot(snapshotName);
  }

  async cancelRestoreModal(): Promise<void> {
    return this.metricsSnapshots.cancelRestoreModal();
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

  async getMetricsNotAvailableCardTitles(
    timeout: number = TestTimeouts.DEFAULT,
  ): Promise<string[]> {
    return this.metricsSnapshots.getMetricsNotAvailableCardTitles(timeout);
  }

  async mockMetricsPrometheusResponses(): Promise<void> {
    return this.metricsSnapshots.mockMetricsPrometheusResponses();
  }

  async clearMetricsMocks(): Promise<void> {
    return this.metricsSnapshots.clearMetricsMocks();
  }

  async isMetricsNetworkDropdownVisible(
    timeout: number = TestTimeouts.UI_VISIBILITY_QUICK,
  ): Promise<boolean> {
    return this.metricsSnapshots.isMetricsNetworkDropdownVisible(timeout);
  }

  async selectMetricsNetworkInterface(nicName: string): Promise<{
    urlBefore: string;
    urlAfter: string;
  }> {
    return this.metricsSnapshots.selectMetricsNetworkInterface(nicName);
  }

  async getMetricsNetworkInterfaceOptions(): Promise<string[]> {
    return this.metricsSnapshots.getMetricsNetworkInterfaceOptions();
  }

  async tryDismissVncTryLaterDialog(
    timeout: number = TestTimeouts.UI_DELAY_LONG,
  ): Promise<boolean> {
    return this.console.tryDismissVncTryLaterDialog(timeout);
  }

  async verifyNoSnapshots(): Promise<boolean> {
    return this.metricsSnapshots.verifyNoSnapshots();
  }

  async getFirstSnapshotNameFromSnapshotsTable(
    timeoutMs: number = TestTimeouts.STATUS_VALIDATION,
  ): Promise<string> {
    return this.metricsSnapshots.getFirstSnapshotNameFromSnapshotsTable(timeoutMs);
  }

  async verifySnapshotExists(snapshotName: string): Promise<boolean> {
    return this.metricsSnapshots.verifySnapshotExists(snapshotName);
  }

  async clickSnapshot(snapshotName: string): Promise<void> {
    return this.metricsSnapshots.clickSnapshot(snapshotName);
  }

  async deleteSnapshotFromRow(snapshotName: string): Promise<void> {
    return this.metricsSnapshots.deleteSnapshotFromRow(snapshotName);
  }

  async verifyNoVirtualMachineSnapshotsEmptyState(): Promise<boolean> {
    return this.metricsSnapshots.verifyNoVirtualMachineSnapshotsEmptyState();
  }

  async verifyNoSnapshotsFoundInLoadingBox(): Promise<boolean> {
    return this.metricsSnapshots.verifyNoSnapshotsFoundInLoadingBox();
  }

  async verifySnapshotWithSuccessIcon(): Promise<boolean> {
    return this.metricsSnapshots.verifySnapshotWithSuccessIcon();
  }

  async verifyStatusConditions(): Promise<boolean> {
    return this.diagnostics.verifyStatusConditions();
  }

  async verifyGuestSystemLogEnabled(): Promise<boolean> {
    return this.diagnostics.verifyGuestSystemLogEnabled();
  }

  async verifyGuestSystemLogDisabled(): Promise<boolean> {
    return this.diagnostics.verifyGuestSystemLogDisabled();
  }

  async verifyHeadlessMode(): Promise<boolean> {
    return this.diagnostics.verifyHeadlessMode();
  }

  async verifyRootdisk(): Promise<boolean> {
    return this.diagnostics.verifyRootdisk();
  }

  async verifyPodNetworking(): Promise<boolean> {
    return this.diagnostics.verifyPodNetworking();
  }

  async verifyTolerations(): Promise<boolean> {
    return this.diagnostics.verifyTolerations();
  }

  async verifySchedulingAndResourceRequirements(): Promise<boolean> {
    return this.diagnostics.verifySchedulingAndResourceRequirements();
  }

  async verifySSHAccess(): Promise<boolean> {
    return this.diagnostics.verifySSHAccess();
  }

  async verifyCloudInit(): Promise<boolean> {
    return this.diagnostics.verifyCloudInit();
  }

  async updateCloudInit(username: string, password: string): Promise<boolean> {
    return this.diagnostics.updateCloudInit(username, password);
  }

  async getCloudInitValues(): Promise<{ username: string; password: string } | null> {
    return this.diagnostics.getCloudInitValues();
  }

  async verifyCloudInitInYAML(
    expectedUsername?: string,
    expectedPassword?: string,
  ): Promise<boolean> {
    return this.diagnostics.verifyCloudInitInYAML(expectedUsername, expectedPassword);
  }

  async verifyCloudInitCredentialsInConsole(): Promise<boolean> {
    return this.diagnostics.verifyCloudInitCredentialsInConsole();
  }

  async verifyAnnotations(): Promise<boolean> {
    return this.diagnostics.verifyAnnotations();
  }

  async verifyFolderVisible(folderName: string, namespace?: string): Promise<boolean> {
    return this.diagnostics.verifyFolderVisible(folderName, namespace);
  }

  async getDiagnosticsTabBadgeCount(): Promise<null | number> {
    return this.diagnostics.getDiagnosticsTabBadgeCount();
  }

  async getDiagnosticsOverviewCardCounts(): Promise<{
    critical: number;
    warnings: number;
    healthy: number;
    allStatuses: number;
  }> {
    return this.diagnostics.getDiagnosticsOverviewCardCounts();
  }

  async clickSeverityCard(severity: 'all' | 'critical' | 'healthy' | 'warning'): Promise<void> {
    return this.diagnostics.clickSeverityCard(severity);
  }

  async getStatusConditionRows(): Promise<Array<{ conditionType: string; status: string }>> {
    return this.diagnostics.getStatusConditionRows();
  }

  async searchDiagnostics(text: string): Promise<void> {
    return this.diagnostics.searchDiagnostics(text);
  }

  async clearDiagnosticsSearch(): Promise<void> {
    return this.diagnostics.clearDiagnosticsSearch();
  }

  async verifyVncConsoleReady(timeout: number = TestTimeouts.VNC_CONSOLE_READY): Promise<boolean> {
    return this.console.verifyVncConsoleReady(timeout);
  }

  async isVncConsoleActive(): Promise<boolean> {
    return this.console.isVncConsoleActive();
  }

  async waitForVncConsoleActive(
    timeout: number = TestTimeouts.VNC_CONSOLE_READY,
  ): Promise<boolean> {
    return this.console.waitForVncConsoleActive(timeout);
  }

  async waitForVncConsoleConnected(timeout?: number): Promise<boolean> {
    return this.console.waitForVncConsoleConnected(timeout);
  }

  async clickVncConnectButton(): Promise<void> {
    return this.console.clickVncConnectButton();
  }

  async isTextVisible(text: string, timeout: number = TestTimeouts.ELEMENT_WAIT): Promise<boolean> {
    return this.console.isTextVisible(text, timeout);
  }

  async clickVncEmptyStateConnectButton(): Promise<void> {
    return this.console.clickVncEmptyStateConnectButton();
  }

  async navigateToVncConsoleAndWaitReady(): Promise<boolean> {
    return this.console.navigateToVncConsoleAndWaitReady();
  }

  async switchToSerialConsole(): Promise<void> {
    return this.console.switchToSerialConsole();
  }

  async getSerialConsoleTerminalWidth(): Promise<number> {
    return this.console.getSerialConsoleTerminalWidth();
  }

  async verifySerialConsoleRenderedProperly(minWidth = 200): Promise<boolean> {
    return this.console.verifySerialConsoleRenderedProperly(minWidth);
  }

  async pasteUsernameToVncConsole(): Promise<boolean> {
    return this.console.pasteUsernameToVncConsole();
  }

  async pastePasswordToVncConsole(): Promise<boolean> {
    return this.console.pastePasswordToVncConsole();
  }

  async performVncConsolePaste(): Promise<void> {
    return this.console.performVncConsolePaste();
  }

  async verifyVncDisplaySwitching(): Promise<boolean> {
    return this.console.verifyVncDisplaySwitching();
  }

  async verifyActiveUsers(present: boolean, timeout = 60000): Promise<boolean> {
    return this.console.verifyActiveUsers(present, timeout);
  }

  async clickStandaloneConsoleLink(vmName: string, namespace: string): Promise<void> {
    return this.console.clickStandaloneConsoleLink(vmName, namespace);
  }

  async isOpenWebConsoleButtonVisible(
    timeout: number = TestTimeouts.ELEMENT_WAIT,
  ): Promise<boolean> {
    return this.console.isOpenWebConsoleButtonVisible(timeout);
  }

  async openWebConsoleAndCheckForRhacmError(
    loadWait = 3000,
  ): Promise<{ url: string; rhacmErrorVisible: boolean }> {
    return this.console.openWebConsoleAndCheckForRhacmError(loadWait);
  }

  async clickOpenWebConsoleAndCaptureNewTab(closeTab = true): Promise<string> {
    return this.console.clickOpenWebConsoleAndCaptureNewTab(closeTab);
  }

  async changeMetricsTimeRange() {
    return this.metricsSnapshots.changeMetricsTimeRange();
  }

  async verifyMetricsTimeRangeIs(expectedTimeRange: string): Promise<boolean> {
    return this.metricsSnapshots.verifyMetricsTimeRangeIs(expectedTimeRange);
  }

  async getMigrationChartQueryHrefs(): Promise<{ dataChart: string; transferRateChart: string }> {
    return this.metricsSnapshots.getMigrationChartQueryHrefs();
  }

  async isMigrationSectionVisible(): Promise<boolean> {
    return this.metricsSnapshots.isMigrationSectionVisible();
  }

  async getLiveMigrationProgressText(): Promise<string> {
    return this.metricsSnapshots.getLiveMigrationProgressText();
  }

  async verifyGuestLogin(): Promise<boolean> {
    return this.console.verifyGuestLogin();
  }

  async clickActionsDropdown() {
    return this.actions.clickActionsDropdown();
  }

  async verifyDownload(): Promise<boolean> {
    return await super.verifyTextVisible('Download');
  }

  async verifyVmStartEvent(timeout: number = TestTimeouts.DEFAULT): Promise<boolean> {
    const eventText = `Streaming events...`;
    return await super.verifyTextVisible(eventText, true, timeout);
  }

  override getCurrentUrl(): string {
    return this.metricsSnapshots.getCurrentUrl();
  }

  async clickVmiByTestId(vmName: string): Promise<void> {
    const vmiLocator = this.locator(`[data-test-id="${vmName}"]`).first();
    await vmiLocator.waitFor({ state: 'visible', timeout: TestTimeouts.UI_ELEMENT_VISIBILITY });
    await this.robustClick(vmiLocator);
  }

  async waitForGuestOsInfoResponse(
    _vmName: string,
    _namespace: string,
    timeout: number = TestTimeouts.DEFAULT,
  ): Promise<void> {
    await this.page.waitForTimeout(Math.min(TestTimeouts.NETWORK_DELAY, timeout));
  }

  async isVmNameVisible(
    vmName: string,
    timeout = TestTimeouts.UI_ELEMENT_VISIBILITY,
  ): Promise<boolean> {
    const nameLocator = this.locator(`[data-test-id="${vmName}"]`).first();
    try {
      await nameLocator.waitFor({ state: 'visible', timeout });
      return true;
    } catch {
      return false;
    }
  }

  async verifyNoErrorBoundary(waitMs = 3000): Promise<boolean> {
    const errorIndicator = this.page.getByText('Something went wrong');
    const hasError = await errorIndicator.isVisible({ timeout: waitMs }).catch(() => false);
    return !hasError;
  }
}

export default VirtualMachineDetailPage;
