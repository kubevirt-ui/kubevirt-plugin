// OverviewPage — Page object for overview interactions.

import {
  OverviewDashboardComponent,
  OverviewMigrationsComponent,
  OverviewQuickStartsComponent,
  OverviewSshKeysComponent,
  OverviewVirtualizationFeaturesComponent,
} from '@/components/overview/overview-dashboard-components';
import type { OverviewSettingsComponent } from '@/components/overview/overview-settings-components';
import { OverviewSettingsBridgeComponent } from '@/components/overview/overview-settings-components';
import type BaseComponent from '@/components/shared/base-component';
import { applyOverviewSettingsDelegations } from '@/page-objects/overview/components/overview-page-settings-delegations';
import { applyOverviewVirtualizationFeaturesDelegations } from '@/page-objects/overview/components/overview-page-virt-features-delegations';
import type { Page } from '@playwright/test';

import PageCommons from '../page-commons';

type PublicMethods<T> = {
  [K in keyof T as T[K] extends (...args: never) => unknown
    ? K extends keyof BaseComponent
      ? never
      : K
    : never]: T[K];
};

// eslint-disable-next-line @typescript-eslint/no-unsafe-declaration-merging, @typescript-eslint/no-empty-object-type
export interface OverviewPage
  extends PublicMethods<OverviewSettingsComponent>,
    PublicMethods<OverviewVirtualizationFeaturesComponent> {}

// eslint-disable-next-line @typescript-eslint/no-unsafe-declaration-merging
export class OverviewPage extends PageCommons {
  readonly migrations: OverviewMigrationsComponent;
  readonly quickStarts: OverviewQuickStartsComponent;
  readonly virtualizationFeatures: OverviewVirtualizationFeaturesComponent;
  readonly sshKeys: OverviewSshKeysComponent;

  private readonly _dashboard: OverviewDashboardComponent;
  private readonly _settings: OverviewSettingsBridgeComponent;

  constructor(page: Page) {
    super(page);
    this._dashboard = new OverviewDashboardComponent(page);
    this._settings = new OverviewSettingsBridgeComponent(page);
    this.migrations = new OverviewMigrationsComponent(page);
    this.quickStarts = new OverviewQuickStartsComponent(page);
    this.virtualizationFeatures = new OverviewVirtualizationFeaturesComponent(page);
    this.sshKeys = new OverviewSshKeysComponent(page);
  }

  navigateToGeneralOverview(
    ...args: Parameters<OverviewDashboardComponent['navigateToGeneralOverview']>
  ): ReturnType<OverviewDashboardComponent['navigateToGeneralOverview']> {
    return this._dashboard.navigateToGeneralOverview(...args);
  }
  navigateToVirtualizationOverview(
    ...args: Parameters<OverviewDashboardComponent['navigateToVirtualizationOverview']>
  ): ReturnType<OverviewDashboardComponent['navigateToVirtualizationOverview']> {
    return this._dashboard.navigateToVirtualizationOverview(...args);
  }
  navigateToVirtualizationOverviewViaUI(
    ...args: Parameters<OverviewDashboardComponent['navigateToVirtualizationOverviewViaUI']>
  ): ReturnType<OverviewDashboardComponent['navigateToVirtualizationOverviewViaUI']> {
    return this._dashboard.navigateToVirtualizationOverviewViaUI(...args);
  }
  navigateToCheckups(
    ...args: Parameters<OverviewDashboardComponent['navigateToCheckups']>
  ): ReturnType<OverviewDashboardComponent['navigateToCheckups']> {
    return this._dashboard.navigateToCheckups(...args);
  }
  navigateToCheckupsViaUI(
    ...args: Parameters<OverviewDashboardComponent['navigateToCheckupsViaUI']>
  ): ReturnType<OverviewDashboardComponent['navigateToCheckupsViaUI']> {
    return this._dashboard.navigateToCheckupsViaUI(...args);
  }
  navigateToTopConsumers(
    ...args: Parameters<OverviewDashboardComponent['navigateToTopConsumers']>
  ): ReturnType<OverviewDashboardComponent['navigateToTopConsumers']> {
    return this._dashboard.navigateToTopConsumers(...args);
  }
  verifyResourceCards(
    ...args: Parameters<OverviewDashboardComponent['verifyResourceCards']>
  ): ReturnType<OverviewDashboardComponent['verifyResourceCards']> {
    return this._dashboard.verifyResourceCards(...args);
  }
  verifyDashboardMetricCardsVisible(
    ...args: Parameters<OverviewDashboardComponent['verifyDashboardMetricCardsVisible']>
  ): ReturnType<OverviewDashboardComponent['verifyDashboardMetricCardsVisible']> {
    return this._dashboard.verifyDashboardMetricCardsVisible(...args);
  }
  verifyTopConsumersCards(
    ...args: Parameters<OverviewDashboardComponent['verifyTopConsumersCards']>
  ): ReturnType<OverviewDashboardComponent['verifyTopConsumersCards']> {
    return this._dashboard.verifyTopConsumersCards(...args);
  }
  verifyTopConsumersMenuToggleOptions(
    ...args: Parameters<OverviewDashboardComponent['verifyTopConsumersMenuToggleOptions']>
  ): ReturnType<OverviewDashboardComponent['verifyTopConsumersMenuToggleOptions']> {
    return this._dashboard.verifyTopConsumersMenuToggleOptions(...args);
  }
  testVirtctlDownloadPopover(
    ...args: Parameters<OverviewDashboardComponent['testVirtctlDownloadPopover']>
  ): ReturnType<OverviewDashboardComponent['testVirtctlDownloadPopover']> {
    return this._dashboard.testVirtctlDownloadPopover(...args);
  }
  verifyFeatureHighlightsCard(
    ...args: Parameters<OverviewDashboardComponent['verifyFeatureHighlightsCard']>
  ): ReturnType<OverviewDashboardComponent['verifyFeatureHighlightsCard']> {
    return this._dashboard.verifyFeatureHighlightsCard(...args);
  }
  verifyRelatedOperatorsCard(
    ...args: Parameters<OverviewDashboardComponent['verifyRelatedOperatorsCard']>
  ): ReturnType<OverviewDashboardComponent['verifyRelatedOperatorsCard']> {
    return this._dashboard.verifyRelatedOperatorsCard(...args);
  }
  verifyOverviewQuickStartAndCardItemsVisible(
    ...args: Parameters<OverviewDashboardComponent['verifyOverviewQuickStartAndCardItemsVisible']>
  ): ReturnType<OverviewDashboardComponent['verifyOverviewQuickStartAndCardItemsVisible']> {
    return this._dashboard.verifyOverviewQuickStartAndCardItemsVisible(...args);
  }
  verifyVmPerTemplateCard(
    ...args: Parameters<OverviewDashboardComponent['verifyVmPerTemplateCard']>
  ): ReturnType<OverviewDashboardComponent['verifyVmPerTemplateCard']> {
    return this._dashboard.verifyVmPerTemplateCard(...args);
  }
  selectInstanceTypeChart(
    ...args: Parameters<OverviewDashboardComponent['selectInstanceTypeChart']>
  ): ReturnType<OverviewDashboardComponent['selectInstanceTypeChart']> {
    return this._dashboard.selectInstanceTypeChart(...args);
  }
  verifyInstanceTypeChart(
    ...args: Parameters<OverviewDashboardComponent['verifyInstanceTypeChart']>
  ): ReturnType<OverviewDashboardComponent['verifyInstanceTypeChart']> {
    return this._dashboard.verifyInstanceTypeChart(...args);
  }
  navigateToClusterOverview(
    ...args: Parameters<OverviewDashboardComponent['navigateToClusterOverview']>
  ): ReturnType<OverviewDashboardComponent['navigateToClusterOverview']> {
    return this._dashboard.navigateToClusterOverview(...args);
  }
  navigateToClusterOverviewViaUI(
    ...args: Parameters<OverviewDashboardComponent['navigateToClusterOverviewViaUI']>
  ): ReturnType<OverviewDashboardComponent['navigateToClusterOverviewViaUI']> {
    return this._dashboard.navigateToClusterOverviewViaUI(...args);
  }
  verifyHealthyConditions(
    ...args: Parameters<OverviewDashboardComponent['verifyHealthyConditions']>
  ): ReturnType<OverviewDashboardComponent['verifyHealthyConditions']> {
    return this._dashboard.verifyHealthyConditions(...args);
  }
  verifyVirtualMachineLink(
    ...args: Parameters<OverviewDashboardComponent['verifyVirtualMachineLink']>
  ): ReturnType<OverviewDashboardComponent['verifyVirtualMachineLink']> {
    return this._dashboard.verifyVirtualMachineLink(...args);
  }
  verifyTopConsumersTabLoaded(
    ...args: Parameters<OverviewDashboardComponent['verifyTopConsumersTabLoaded']>
  ): ReturnType<OverviewDashboardComponent['verifyTopConsumersTabLoaded']> {
    return this._dashboard.verifyTopConsumersTabLoaded(...args);
  }
  clickVmStatusLink(
    ...args: Parameters<OverviewDashboardComponent['clickVmStatusLink']>
  ): ReturnType<OverviewDashboardComponent['clickVmStatusLink']> {
    return this._dashboard.clickVmStatusLink(...args);
  }
  navigateToMigrations(
    ...args: Parameters<OverviewMigrationsComponent['navigateToMigrations']>
  ): ReturnType<OverviewMigrationsComponent['navigateToMigrations']> {
    return this.migrations.navigateToMigrations(...args);
  }
  navigateToStandaloneMigrationsPage(
    ...args: Parameters<OverviewMigrationsComponent['navigateToStandaloneMigrationsPage']>
  ): ReturnType<OverviewMigrationsComponent['navigateToStandaloneMigrationsPage']> {
    return this.migrations.navigateToStandaloneMigrationsPage(...args);
  }
  verifyStandaloneMigrationsPageLoaded(
    ...args: Parameters<OverviewMigrationsComponent['verifyStandaloneMigrationsPageLoaded']>
  ): ReturnType<OverviewMigrationsComponent['verifyStandaloneMigrationsPageLoaded']> {
    return this.migrations.verifyStandaloneMigrationsPageLoaded(...args);
  }
  verifyMigrationsTabLoaded(
    ...args: Parameters<OverviewMigrationsComponent['verifyMigrationsTabLoaded']>
  ): ReturnType<OverviewMigrationsComponent['verifyMigrationsTabLoaded']> {
    return this.migrations.verifyMigrationsTabLoaded(...args);
  }
  hasMonitoringError(
    ...args: Parameters<OverviewMigrationsComponent['hasMonitoringError']>
  ): ReturnType<OverviewMigrationsComponent['hasMonitoringError']> {
    return this.migrations.hasMonitoringError(...args);
  }
  selectMigrationsTimeFilter(
    ...args: Parameters<OverviewMigrationsComponent['selectMigrationsTimeFilter']>
  ): ReturnType<OverviewMigrationsComponent['selectMigrationsTimeFilter']> {
    return this.migrations.selectMigrationsTimeFilter(...args);
  }
  clickLastButton(
    ...args: Parameters<OverviewMigrationsComponent['clickLastButton']>
  ): ReturnType<OverviewMigrationsComponent['clickLastButton']> {
    return this.migrations.clickLastButton(...args);
  }
  clickTimeRangeButton(
    ...args: Parameters<OverviewMigrationsComponent['clickTimeRangeButton']>
  ): ReturnType<OverviewMigrationsComponent['clickTimeRangeButton']> {
    return this.migrations.clickTimeRangeButton(...args);
  }
  getMigrationStatus(
    ...args: Parameters<OverviewMigrationsComponent['getMigrationStatus']>
  ): ReturnType<OverviewMigrationsComponent['getMigrationStatus']> {
    return this.migrations.getMigrationStatus(...args);
  }
  clickLimitationsLink(
    ...args: Parameters<OverviewMigrationsComponent['clickLimitationsLink']>
  ): ReturnType<OverviewMigrationsComponent['clickLimitationsLink']> {
    return this.migrations.clickLimitationsLink(...args);
  }
  verifyLiveMigrationSettings(
    ...args: Parameters<OverviewMigrationsComponent['verifyLiveMigrationSettings']>
  ): ReturnType<OverviewMigrationsComponent['verifyLiveMigrationSettings']> {
    return this.migrations.verifyLiveMigrationSettings(...args);
  }
  verifyMigrationSetting(
    ...args: Parameters<OverviewMigrationsComponent['verifyMigrationSetting']>
  ): ReturnType<OverviewMigrationsComponent['verifyMigrationSetting']> {
    return this.migrations.verifyMigrationSetting(...args);
  }
  verifyMigrationStatusSectionVisible(
    ...args: Parameters<OverviewMigrationsComponent['verifyMigrationStatusSectionVisible']>
  ): ReturnType<OverviewMigrationsComponent['verifyMigrationStatusSectionVisible']> {
    return this.migrations.verifyMigrationStatusSectionVisible(...args);
  }
  clickVmimNameLink(
    ...args: Parameters<OverviewMigrationsComponent['clickVmimNameLink']>
  ): ReturnType<OverviewMigrationsComponent['clickVmimNameLink']> {
    return this.migrations.clickVmimNameLink(...args);
  }
  verifyVmimDetailPage(
    ...args: Parameters<OverviewMigrationsComponent['verifyVmimDetailPage']>
  ): ReturnType<OverviewMigrationsComponent['verifyVmimDetailPage']> {
    return this.migrations.verifyVmimDetailPage(...args);
  }
  verifyInstalledVersion(
    ...args: Parameters<OverviewMigrationsComponent['verifyInstalledVersion']>
  ): ReturnType<OverviewMigrationsComponent['verifyInstalledVersion']> {
    return this.migrations.verifyInstalledVersion(...args);
  }
  setLiveMigrationLimits(
    ...args: Parameters<OverviewMigrationsComponent['setLiveMigrationLimits']>
  ): ReturnType<OverviewMigrationsComponent['setLiveMigrationLimits']> {
    return this.migrations.setLiveMigrationLimits(...args);
  }
  openMemoryDensitySettings(
    ...args: Parameters<OverviewMigrationsComponent['openMemoryDensitySettings']>
  ): ReturnType<OverviewMigrationsComponent['openMemoryDensitySettings']> {
    return this.migrations.openMemoryDensitySettings(...args);
  }
  getMemoryDensityToggleState(
    ...args: Parameters<OverviewMigrationsComponent['getMemoryDensityToggleState']>
  ): ReturnType<OverviewMigrationsComponent['getMemoryDensityToggleState']> {
    return this.migrations.getMemoryDensityToggleState(...args);
  }
  waitForMemoryDensityToggleState(
    ...args: Parameters<OverviewMigrationsComponent['waitForMemoryDensityToggleState']>
  ): ReturnType<OverviewMigrationsComponent['waitForMemoryDensityToggleState']> {
    return this.migrations.waitForMemoryDensityToggleState(...args);
  }
  toggleMemoryDensity(
    ...args: Parameters<OverviewMigrationsComponent['toggleMemoryDensity']>
  ): ReturnType<OverviewMigrationsComponent['toggleMemoryDensity']> {
    return this.migrations.toggleMemoryDensity(...args);
  }
  enableMemoryDensity(
    ...args: Parameters<OverviewMigrationsComponent['enableMemoryDensity']>
  ): ReturnType<OverviewMigrationsComponent['enableMemoryDensity']> {
    return this.migrations.enableMemoryDensity(...args);
  }
  disableMemoryDensity(
    ...args: Parameters<OverviewMigrationsComponent['disableMemoryDensity']>
  ): ReturnType<OverviewMigrationsComponent['disableMemoryDensity']> {
    return this.migrations.disableMemoryDensity(...args);
  }
  setMemoryDensityPercentage(
    ...args: Parameters<OverviewMigrationsComponent['setMemoryDensityPercentage']>
  ): ReturnType<OverviewMigrationsComponent['setMemoryDensityPercentage']> {
    return this.migrations.setMemoryDensityPercentage(...args);
  }
  navigateToQuickStart(
    ...args: Parameters<OverviewQuickStartsComponent['navigateToQuickStart']>
  ): ReturnType<OverviewQuickStartsComponent['navigateToQuickStart']> {
    return this.quickStarts.navigateToQuickStart(...args);
  }
  navigateToQuickStartViaUI(
    ...args: Parameters<OverviewQuickStartsComponent['navigateToQuickStartViaUI']>
  ): ReturnType<OverviewQuickStartsComponent['navigateToQuickStartViaUI']> {
    return this.quickStarts.navigateToQuickStartViaUI(...args);
  }
  openCreateVmFromVolumeQuickStart(
    ...args: Parameters<OverviewQuickStartsComponent['openCreateVmFromVolumeQuickStart']>
  ): ReturnType<OverviewQuickStartsComponent['openCreateVmFromVolumeQuickStart']> {
    return this.quickStarts.openCreateVmFromVolumeQuickStart(...args);
  }
  handleQuickStartRestartIfNeeded(
    ...args: Parameters<OverviewQuickStartsComponent['handleQuickStartRestartIfNeeded']>
  ): ReturnType<OverviewQuickStartsComponent['handleQuickStartRestartIfNeeded']> {
    return this.quickStarts.handleQuickStartRestartIfNeeded(...args);
  }
  clickQuickStartStartButton(
    ...args: Parameters<OverviewQuickStartsComponent['clickQuickStartStartButton']>
  ): ReturnType<OverviewQuickStartsComponent['clickQuickStartStartButton']> {
    return this.quickStarts.clickQuickStartStartButton(...args);
  }
  verifyReviewFailed(
    ...args: Parameters<OverviewQuickStartsComponent['verifyReviewFailed']>
  ): ReturnType<OverviewQuickStartsComponent['verifyReviewFailed']> {
    return this.quickStarts.verifyReviewFailed(...args);
  }
  verifyReviewSuccess(
    ...args: Parameters<OverviewQuickStartsComponent['verifyReviewSuccess']>
  ): ReturnType<OverviewQuickStartsComponent['verifyReviewSuccess']> {
    return this.quickStarts.verifyReviewSuccess(...args);
  }
  checkQuickStartYesCheckbox(
    ...args: Parameters<OverviewQuickStartsComponent['checkQuickStartYesCheckbox']>
  ): ReturnType<OverviewQuickStartsComponent['checkQuickStartYesCheckbox']> {
    return this.quickStarts.checkQuickStartYesCheckbox(...args);
  }
  clickQuickStartNextButton(
    ...args: Parameters<OverviewQuickStartsComponent['clickQuickStartNextButton']>
  ): ReturnType<OverviewQuickStartsComponent['clickQuickStartNextButton']> {
    return this.quickStarts.clickQuickStartNextButton(...args);
  }
  verifyQuickStartSuccessMessage(
    ...args: Parameters<OverviewQuickStartsComponent['verifyQuickStartSuccessMessage']>
  ): ReturnType<OverviewQuickStartsComponent['verifyQuickStartSuccessMessage']> {
    return this.quickStarts.verifyQuickStartSuccessMessage(...args);
  }
  clickQuickStartCloseButton(
    ...args: Parameters<OverviewQuickStartsComponent['clickQuickStartCloseButton']>
  ): ReturnType<OverviewQuickStartsComponent['clickQuickStartCloseButton']> {
    return this.quickStarts.clickQuickStartCloseButton(...args);
  }
  verifyQuickStartComplete(
    ...args: Parameters<OverviewQuickStartsComponent['verifyQuickStartComplete']>
  ): ReturnType<OverviewQuickStartsComponent['verifyQuickStartComplete']> {
    return this.quickStarts.verifyQuickStartComplete(...args);
  }
  clickQuickStartByTitle(
    ...args: Parameters<OverviewQuickStartsComponent['clickQuickStartByTitle']>
  ): ReturnType<OverviewQuickStartsComponent['clickQuickStartByTitle']> {
    return this.quickStarts.clickQuickStartByTitle(...args);
  }
  clickReviewFailed(
    ...args: Parameters<OverviewQuickStartsComponent['clickReviewFailed']>
  ): ReturnType<OverviewQuickStartsComponent['clickReviewFailed']> {
    return this.quickStarts.clickReviewFailed(...args);
  }
  clickReviewSuccess(
    ...args: Parameters<OverviewQuickStartsComponent['clickReviewSuccess']>
  ): ReturnType<OverviewQuickStartsComponent['clickReviewSuccess']> {
    return this.quickStarts.clickReviewSuccess(...args);
  }
  verifyDangerAlertVisible(
    ...args: Parameters<OverviewQuickStartsComponent['verifyDangerAlertVisible']>
  ): ReturnType<OverviewQuickStartsComponent['verifyDangerAlertVisible']> {
    return this.quickStarts.verifyDangerAlertVisible(...args);
  }
  verifyDangerAlertNotVisible(
    ...args: Parameters<OverviewQuickStartsComponent['verifyDangerAlertNotVisible']>
  ): ReturnType<OverviewQuickStartsComponent['verifyDangerAlertNotVisible']> {
    return this.quickStarts.verifyDangerAlertNotVisible(...args);
  }
  verifySuccessAlertVisible(
    ...args: Parameters<OverviewQuickStartsComponent['verifySuccessAlertVisible']>
  ): ReturnType<OverviewQuickStartsComponent['verifySuccessAlertVisible']> {
    return this.quickStarts.verifySuccessAlertVisible(...args);
  }
  verifyQuickStartTileComplete(
    ...args: Parameters<OverviewQuickStartsComponent['verifyQuickStartTileComplete']>
  ): ReturnType<OverviewQuickStartsComponent['verifyQuickStartTileComplete']> {
    return this.quickStarts.verifyQuickStartTileComplete(...args);
  }
  navigateToSSHKeysManagement(
    ...args: Parameters<OverviewSshKeysComponent['navigateToSSHKeysManagement']>
  ): ReturnType<OverviewSshKeysComponent['navigateToSSHKeysManagement']> {
    return this.sshKeys.navigateToSSHKeysManagement(...args);
  }
  selectProjectByNamespace(
    ...args: Parameters<OverviewSshKeysComponent['selectProjectByNamespace']>
  ): ReturnType<OverviewSshKeysComponent['selectProjectByNamespace']> {
    return this.sshKeys.selectProjectByNamespace(...args);
  }
  selectProjectInSSHSettings(
    ...args: Parameters<OverviewSshKeysComponent['selectProjectInSSHSettings']>
  ): ReturnType<OverviewSshKeysComponent['selectProjectInSSHSettings']> {
    return this.sshKeys.selectProjectInSSHSettings(...args);
  }
  verifyPublicSSHKeyVisible(
    ...args: Parameters<OverviewSshKeysComponent['verifyPublicSSHKeyVisible']>
  ): ReturnType<OverviewSshKeysComponent['verifyPublicSSHKeyVisible']> {
    return this.sshKeys.verifyPublicSSHKeyVisible(...args);
  }
  saveSSHKey(
    ...args: Parameters<OverviewSshKeysComponent['saveSSHKey']>
  ): ReturnType<OverviewSshKeysComponent['saveSSHKey']> {
    return this.sshKeys.saveSSHKey(...args);
  }
}

applyOverviewSettingsDelegations(OverviewPage.prototype);
applyOverviewVirtualizationFeaturesDelegations(OverviewPage.prototype);

export default OverviewPage;
