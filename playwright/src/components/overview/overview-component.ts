/**
 * Component for the OpenShift Virtualization Overview page.
 * Thin facade: composed domain page objects mirror the full public API.
 */

import OverviewDashboardPage from '@/page-objects/overview/overview-dashboard-page';
import OverviewMigrationsPage from '@/page-objects/overview/overview-migrations-page';
import OverviewQuickStartsPage from '@/page-objects/overview/overview-quick-starts-page';
import OverviewSettingsPage from '@/page-objects/overview/overview-settings-page';
import OverviewSshKeysPage from '@/page-objects/overview/overview-ssh-keys-page';
import OverviewVirtualizationFeaturesPage from '@/page-objects/overview/overview-virtualization-features-page';
import type { Page } from '@playwright/test';

import BaseComponent from '../shared/base-component';

export default class OverviewComponent extends BaseComponent {
  private readonly _dashboard: OverviewDashboardPage;
  private readonly _settings: OverviewSettingsPage;
  readonly migrations: OverviewMigrationsPage;
  readonly quickStarts: OverviewQuickStartsPage;

  readonly sshKeys: OverviewSshKeysPage;
  readonly virtualizationFeatures: OverviewVirtualizationFeaturesPage;

  constructor(page: Page) {
    super(page);
    this._dashboard = new OverviewDashboardPage(page);
    this._settings = new OverviewSettingsPage(page);
    this.migrations = new OverviewMigrationsPage(page);
    this.quickStarts = new OverviewQuickStartsPage(page);
    this.virtualizationFeatures = new OverviewVirtualizationFeaturesPage(page);
    this.sshKeys = new OverviewSshKeysPage(page);
  }

  checkQuickStartYesCheckbox(
    ...args: Parameters<OverviewQuickStartsPage['checkQuickStartYesCheckbox']>
  ): ReturnType<OverviewQuickStartsPage['checkQuickStartYesCheckbox']> {
    return this.quickStarts.checkQuickStartYesCheckbox(...args);
  }
  clickHighAvailabilitySummarySectionToggle(
    ...args: Parameters<
      OverviewVirtualizationFeaturesPage['clickHighAvailabilitySummarySectionToggle']
    >
  ): ReturnType<OverviewVirtualizationFeaturesPage['clickHighAvailabilitySummarySectionToggle']> {
    return this.virtualizationFeatures.clickHighAvailabilitySummarySectionToggle(...args);
  }
  clickLastButton(
    ...args: Parameters<OverviewMigrationsPage['clickLastButton']>
  ): ReturnType<OverviewMigrationsPage['clickLastButton']> {
    return this.migrations.clickLastButton(...args);
  }
  clickLimitationsLink(
    ...args: Parameters<OverviewMigrationsPage['clickLimitationsLink']>
  ): ReturnType<OverviewMigrationsPage['clickLimitationsLink']> {
    return this.migrations.clickLimitationsLink(...args);
  }
  clickQuickStartByTitle(
    ...args: Parameters<OverviewQuickStartsPage['clickQuickStartByTitle']>
  ): ReturnType<OverviewQuickStartsPage['clickQuickStartByTitle']> {
    return this.quickStarts.clickQuickStartByTitle(...args);
  }
  clickQuickStartCloseButton(
    ...args: Parameters<OverviewQuickStartsPage['clickQuickStartCloseButton']>
  ): ReturnType<OverviewQuickStartsPage['clickQuickStartCloseButton']> {
    return this.quickStarts.clickQuickStartCloseButton(...args);
  }
  clickQuickStartNextButton(
    ...args: Parameters<OverviewQuickStartsPage['clickQuickStartNextButton']>
  ): ReturnType<OverviewQuickStartsPage['clickQuickStartNextButton']> {
    return this.quickStarts.clickQuickStartNextButton(...args);
  }
  clickQuickStartStartButton(
    ...args: Parameters<OverviewQuickStartsPage['clickQuickStartStartButton']>
  ): ReturnType<OverviewQuickStartsPage['clickQuickStartStartButton']> {
    return this.quickStarts.clickQuickStartStartButton(...args);
  }
  clickReviewFailed(
    ...args: Parameters<OverviewQuickStartsPage['clickReviewFailed']>
  ): ReturnType<OverviewQuickStartsPage['clickReviewFailed']> {
    return this.quickStarts.clickReviewFailed(...args);
  }
  clickReviewSuccess(
    ...args: Parameters<OverviewQuickStartsPage['clickReviewSuccess']>
  ): ReturnType<OverviewQuickStartsPage['clickReviewSuccess']> {
    return this.quickStarts.clickReviewSuccess(...args);
  }
  clickSearchResultMenuItem(
    ...args: Parameters<OverviewSettingsPage['clickSearchResultMenuItem']>
  ): ReturnType<OverviewSettingsPage['clickSearchResultMenuItem']> {
    return this._settings.clickSearchResultMenuItem(...args);
  }
  clickTimeRangeButton(
    ...args: Parameters<OverviewMigrationsPage['clickTimeRangeButton']>
  ): ReturnType<OverviewMigrationsPage['clickTimeRangeButton']> {
    return this.migrations.clickTimeRangeButton(...args);
  }
  clickVirtualizationFeaturesWizardSubmit(
    ...args: Parameters<
      OverviewVirtualizationFeaturesPage['clickVirtualizationFeaturesWizardSubmit']
    >
  ): ReturnType<OverviewVirtualizationFeaturesPage['clickVirtualizationFeaturesWizardSubmit']> {
    return this.virtualizationFeatures.clickVirtualizationFeaturesWizardSubmit(...args);
  }
  clickVmimNameLink(
    ...args: Parameters<OverviewMigrationsPage['clickVmimNameLink']>
  ): ReturnType<OverviewMigrationsPage['clickVmimNameLink']> {
    return this.migrations.clickVmimNameLink(...args);
  }
  clickVmStatusLink(
    ...args: Parameters<OverviewDashboardPage['clickVmStatusLink']>
  ): ReturnType<OverviewDashboardPage['clickVmStatusLink']> {
    return this._dashboard.clickVmStatusLink(...args);
  }
  closeGuidedTour(
    ...args: Parameters<OverviewSettingsPage['closeGuidedTour']>
  ): ReturnType<OverviewSettingsPage['closeGuidedTour']> {
    return this._settings.closeGuidedTour(...args);
  }
  disableAdvancedCdromFeatures(
    ...args: Parameters<OverviewSettingsPage['disableAdvancedCdromFeatures']>
  ): ReturnType<OverviewSettingsPage['disableAdvancedCdromFeatures']> {
    return this._settings.disableAdvancedCdromFeatures(...args);
  }
  disableCentosStream9ImageCron(
    ...args: Parameters<OverviewSettingsPage['disableCentosStream9ImageCron']>
  ): ReturnType<OverviewSettingsPage['disableCentosStream9ImageCron']> {
    return this._settings.disableCentosStream9ImageCron(...args);
  }
  disableMemoryDensity(
    ...args: Parameters<OverviewMigrationsPage['disableMemoryDensity']>
  ): ReturnType<OverviewMigrationsPage['disableMemoryDensity']> {
    return this.migrations.disableMemoryDensity(...args);
  }
  dismissWelcomeModalCheckbox(
    ...args: Parameters<OverviewSettingsPage['dismissWelcomeModalCheckbox']>
  ): ReturnType<OverviewSettingsPage['dismissWelcomeModalCheckbox']> {
    return this._settings.dismissWelcomeModalCheckbox(...args);
  }
  enableAaq(
    ...args: Parameters<OverviewVirtualizationFeaturesPage['enableAaq']>
  ): ReturnType<OverviewVirtualizationFeaturesPage['enableAaq']> {
    return this.virtualizationFeatures.enableAaq(...args);
  }
  enableAdvancedCdromFeatures(
    ...args: Parameters<OverviewSettingsPage['enableAdvancedCdromFeatures']>
  ): ReturnType<OverviewSettingsPage['enableAdvancedCdromFeatures']> {
    return this._settings.enableAdvancedCdromFeatures(...args);
  }
  enableCentosStream9ImageCron(
    ...args: Parameters<OverviewSettingsPage['enableCentosStream9ImageCron']>
  ): ReturnType<OverviewSettingsPage['enableCentosStream9ImageCron']> {
    return this._settings.enableCentosStream9ImageCron(...args);
  }
  enableClusterObservabilityInWizard(
    ...args: Parameters<OverviewVirtualizationFeaturesPage['enableClusterObservabilityInWizard']>
  ): ReturnType<OverviewVirtualizationFeaturesPage['enableClusterObservabilityInWizard']> {
    return this.virtualizationFeatures.enableClusterObservabilityInWizard(...args);
  }
  enableGuidedTour(
    ...args: Parameters<OverviewSettingsPage['enableGuidedTour']>
  ): ReturnType<OverviewSettingsPage['enableGuidedTour']> {
    return this._settings.enableGuidedTour(...args);
  }
  enableKSM(
    ...args: Parameters<OverviewVirtualizationFeaturesPage['enableKSM']>
  ): ReturnType<OverviewVirtualizationFeaturesPage['enableKSM']> {
    return this.virtualizationFeatures.enableKSM(...args);
  }
  enableMemoryDensity(
    ...args: Parameters<OverviewMigrationsPage['enableMemoryDensity']>
  ): ReturnType<OverviewMigrationsPage['enableMemoryDensity']> {
    return this.migrations.enableMemoryDensity(...args);
  }
  enablePersistentReservation(
    ...args: Parameters<OverviewVirtualizationFeaturesPage['enablePersistentReservation']>
  ): ReturnType<OverviewVirtualizationFeaturesPage['enablePersistentReservation']> {
    return this.virtualizationFeatures.enablePersistentReservation(...args);
  }
  enableSSHOverNodePort(
    ...args: Parameters<OverviewSettingsPage['enableSSHOverNodePort']>
  ): ReturnType<OverviewSettingsPage['enableSSHOverNodePort']> {
    return this._settings.enableSSHOverNodePort(...args);
  }
  enableSSHUsingLoadBalancer(
    ...args: Parameters<OverviewSettingsPage['enableSSHUsingLoadBalancer']>
  ): ReturnType<OverviewSettingsPage['enableSSHUsingLoadBalancer']> {
    return this._settings.enableSSHUsingLoadBalancer(...args);
  }
  enableVirtualizationOptimizedAndCooLoggingMonitoring(
    ...args: Parameters<
      OverviewVirtualizationFeaturesPage['enableVirtualizationOptimizedAndCooLoggingMonitoring']
    >
  ): ReturnType<
    OverviewVirtualizationFeaturesPage['enableVirtualizationOptimizedAndCooLoggingMonitoring']
  > {
    return this.virtualizationFeatures.enableVirtualizationOptimizedAndCooLoggingMonitoring(
      ...args,
    );
  }
  enableWelcomeInformation(
    ...args: Parameters<OverviewSettingsPage['enableWelcomeInformation']>
  ): ReturnType<OverviewSettingsPage['enableWelcomeInformation']> {
    return this._settings.enableWelcomeInformation(...args);
  }
  enableWizardFeatureByLabel(
    ...args: Parameters<OverviewVirtualizationFeaturesPage['enableWizardFeatureByLabel']>
  ): ReturnType<OverviewVirtualizationFeaturesPage['enableWizardFeatureByLabel']> {
    return this.virtualizationFeatures.enableWizardFeatureByLabel(...args);
  }
  ensureWelcomeModalDismissed(
    ...args: Parameters<OverviewSettingsPage['ensureWelcomeModalDismissed']>
  ): ReturnType<OverviewSettingsPage['ensureWelcomeModalDismissed']> {
    return this._settings.ensureWelcomeModalDismissed(...args);
  }
  fillActivationKey(
    ...args: Parameters<OverviewSettingsPage['fillActivationKey']>
  ): ReturnType<OverviewSettingsPage['fillActivationKey']> {
    return this._settings.fillActivationKey(...args);
  }
  fillConfigurationSearchInput(
    ...args: Parameters<OverviewSettingsPage['fillConfigurationSearchInput']>
  ): ReturnType<OverviewSettingsPage['fillConfigurationSearchInput']> {
    return this._settings.fillConfigurationSearchInput(...args);
  }
  finishWizardAndVerifyClosed(
    ...args: Parameters<OverviewVirtualizationFeaturesPage['finishWizardAndVerifyClosed']>
  ): ReturnType<OverviewVirtualizationFeaturesPage['finishWizardAndVerifyClosed']> {
    return this.virtualizationFeatures.finishWizardAndVerifyClosed(...args);
  }
  getClusterSettingsSectionNames(
    ...args: Parameters<OverviewVirtualizationFeaturesPage['getClusterSettingsSectionNames']>
  ): ReturnType<OverviewVirtualizationFeaturesPage['getClusterSettingsSectionNames']> {
    return this.virtualizationFeatures.getClusterSettingsSectionNames(...args);
  }
  getGeneralSettingsSubSections(
    ...args: Parameters<OverviewSettingsPage['getGeneralSettingsSubSections']>
  ): ReturnType<OverviewSettingsPage['getGeneralSettingsSubSections']> {
    return this._settings.getGeneralSettingsSubSections(...args);
  }
  getGuidedTourStepTitles(
    ...args: Parameters<OverviewSettingsPage['getGuidedTourStepTitles']>
  ): ReturnType<OverviewSettingsPage['getGuidedTourStepTitles']> {
    return this._settings.getGuidedTourStepTitles(...args);
  }
  getMemoryDensityToggleState(
    ...args: Parameters<OverviewMigrationsPage['getMemoryDensityToggleState']>
  ): ReturnType<OverviewMigrationsPage['getMemoryDensityToggleState']> {
    return this.migrations.getMemoryDensityToggleState(...args);
  }
  getMigrationStatus(
    ...args: Parameters<OverviewMigrationsPage['getMigrationStatus']>
  ): ReturnType<OverviewMigrationsPage['getMigrationStatus']> {
    return this.migrations.getMigrationStatus(...args);
  }
  getPreviewFeatureLabels(
    ...args: Parameters<OverviewSettingsPage['getPreviewFeatureLabels']>
  ): ReturnType<OverviewSettingsPage['getPreviewFeatureLabels']> {
    return this._settings.getPreviewFeatureLabels(...args);
  }
  getSettingsTabNames(
    ...args: Parameters<OverviewSettingsPage['getSettingsTabNames']>
  ): ReturnType<OverviewSettingsPage['getSettingsTabNames']> {
    return this._settings.getSettingsTabNames(...args);
  }
  getVirtualizationFeatureItems(
    ...args: Parameters<OverviewVirtualizationFeaturesPage['getVirtualizationFeatureItems']>
  ): ReturnType<OverviewVirtualizationFeaturesPage['getVirtualizationFeatureItems']> {
    return this.virtualizationFeatures.getVirtualizationFeatureItems(...args);
  }
  getVmActionsConfirmationState(
    ...args: Parameters<OverviewSettingsPage['getVmActionsConfirmationState']>
  ): ReturnType<OverviewSettingsPage['getVmActionsConfirmationState']> {
    return this._settings.getVmActionsConfirmationState(...args);
  }
  getWelcomeModalButtonTexts(
    ...args: Parameters<OverviewSettingsPage['getWelcomeModalButtonTexts']>
  ): ReturnType<OverviewSettingsPage['getWelcomeModalButtonTexts']> {
    return this._settings.getWelcomeModalButtonTexts(...args);
  }
  handleQuickStartRestartIfNeeded(
    ...args: Parameters<OverviewQuickStartsPage['handleQuickStartRestartIfNeeded']>
  ): ReturnType<OverviewQuickStartsPage['handleQuickStartRestartIfNeeded']> {
    return this.quickStarts.handleQuickStartRestartIfNeeded(...args);
  }
  hasMonitoringError(
    ...args: Parameters<OverviewMigrationsPage['hasMonitoringError']>
  ): ReturnType<OverviewMigrationsPage['hasMonitoringError']> {
    return this.migrations.hasMonitoringError(...args);
  }
  hideGuestCredentials(
    ...args: Parameters<OverviewSettingsPage['hideGuestCredentials']>
  ): ReturnType<OverviewSettingsPage['hideGuestCredentials']> {
    return this._settings.hideGuestCredentials(...args);
  }
  isAaqControlVisible(
    ...args: Parameters<OverviewVirtualizationFeaturesPage['isAaqControlVisible']>
  ): ReturnType<OverviewVirtualizationFeaturesPage['isAaqControlVisible']> {
    return this.virtualizationFeatures.isAaqControlVisible(...args);
  }
  isAaqEnabled(
    ...args: Parameters<OverviewVirtualizationFeaturesPage['isAaqEnabled']>
  ): ReturnType<OverviewVirtualizationFeaturesPage['isAaqEnabled']> {
    return this.virtualizationFeatures.isAaqEnabled(...args);
  }
  isAdvancedCdromFeaturesEnabled(
    ...args: Parameters<OverviewSettingsPage['isAdvancedCdromFeaturesEnabled']>
  ): ReturnType<OverviewSettingsPage['isAdvancedCdromFeaturesEnabled']> {
    return this._settings.isAdvancedCdromFeaturesEnabled(...args);
  }
  isConfigureFeaturesButtonVisible(
    ...args: Parameters<OverviewVirtualizationFeaturesPage['isConfigureFeaturesButtonVisible']>
  ): ReturnType<OverviewVirtualizationFeaturesPage['isConfigureFeaturesButtonVisible']> {
    return this.virtualizationFeatures.isConfigureFeaturesButtonVisible(...args);
  }
  isKsmControlVisible(
    ...args: Parameters<OverviewVirtualizationFeaturesPage['isKsmControlVisible']>
  ): ReturnType<OverviewVirtualizationFeaturesPage['isKsmControlVisible']> {
    return this.virtualizationFeatures.isKsmControlVisible(...args);
  }
  isManageQuotasLinkVisible(
    ...args: Parameters<OverviewVirtualizationFeaturesPage['isManageQuotasLinkVisible']>
  ): ReturnType<OverviewVirtualizationFeaturesPage['isManageQuotasLinkVisible']> {
    return this.virtualizationFeatures.isManageQuotasLinkVisible(...args);
  }
  isPasstBindingChecked(
    ...args: Parameters<OverviewSettingsPage['isPasstBindingChecked']>
  ): ReturnType<OverviewSettingsPage['isPasstBindingChecked']> {
    return this._settings.isPasstBindingChecked(...args);
  }
  isWelcomeModalContentVisible(
    ...args: Parameters<OverviewSettingsPage['isWelcomeModalContentVisible']>
  ): ReturnType<OverviewSettingsPage['isWelcomeModalContentVisible']> {
    return this._settings.isWelcomeModalContentVisible(...args);
  }
  isWelcomeModalFlashing(
    ...args: Parameters<OverviewSettingsPage['isWelcomeModalFlashing']>
  ): ReturnType<OverviewSettingsPage['isWelcomeModalFlashing']> {
    return this._settings.isWelcomeModalFlashing(...args);
  }
  navigateToAutomaticImagesDownload(
    ...args: Parameters<OverviewSettingsPage['navigateToAutomaticImagesDownload']>
  ): ReturnType<OverviewSettingsPage['navigateToAutomaticImagesDownload']> {
    return this._settings.navigateToAutomaticImagesDownload(...args);
  }
  navigateToAutomaticSubscription(
    ...args: Parameters<OverviewSettingsPage['navigateToAutomaticSubscription']>
  ): ReturnType<OverviewSettingsPage['navigateToAutomaticSubscription']> {
    return this._settings.navigateToAutomaticSubscription(...args);
  }
  navigateToCheckups(
    ...args: Parameters<OverviewDashboardPage['navigateToCheckups']>
  ): ReturnType<OverviewDashboardPage['navigateToCheckups']> {
    return this._dashboard.navigateToCheckups(...args);
  }
  navigateToCheckupsViaUI(
    ...args: Parameters<OverviewDashboardPage['navigateToCheckupsViaUI']>
  ): ReturnType<OverviewDashboardPage['navigateToCheckupsViaUI']> {
    return this._dashboard.navigateToCheckupsViaUI(...args);
  }
  navigateToClusterOverview(
    ...args: Parameters<OverviewDashboardPage['navigateToClusterOverview']>
  ): ReturnType<OverviewDashboardPage['navigateToClusterOverview']> {
    return this._dashboard.navigateToClusterOverview(...args);
  }
  navigateToClusterOverviewViaUI(
    ...args: Parameters<OverviewDashboardPage['navigateToClusterOverviewViaUI']>
  ): ReturnType<OverviewDashboardPage['navigateToClusterOverviewViaUI']> {
    return this._dashboard.navigateToClusterOverviewViaUI(...args);
  }
  navigateToGeneralOverview(
    ...args: Parameters<OverviewDashboardPage['navigateToGeneralOverview']>
  ): ReturnType<OverviewDashboardPage['navigateToGeneralOverview']> {
    return this._dashboard.navigateToGeneralOverview(...args);
  }
  navigateToGeneralSettings(
    ...args: Parameters<OverviewSettingsPage['navigateToGeneralSettings']>
  ): ReturnType<OverviewSettingsPage['navigateToGeneralSettings']> {
    return this._settings.navigateToGeneralSettings(...args);
  }
  navigateToGettingStartedResources(
    ...args: Parameters<OverviewSettingsPage['navigateToGettingStartedResources']>
  ): ReturnType<OverviewSettingsPage['navigateToGettingStartedResources']> {
    return this._settings.navigateToGettingStartedResources(...args);
  }
  navigateToGuestManagement(
    ...args: Parameters<OverviewSettingsPage['navigateToGuestManagement']>
  ): ReturnType<OverviewSettingsPage['navigateToGuestManagement']> {
    return this._settings.navigateToGuestManagement(...args);
  }
  navigateToMigrations(
    ...args: Parameters<OverviewMigrationsPage['navigateToMigrations']>
  ): ReturnType<OverviewMigrationsPage['navigateToMigrations']> {
    return this.migrations.navigateToMigrations(...args);
  }
  navigateToPermissions(
    ...args: Parameters<OverviewVirtualizationFeaturesPage['navigateToPermissions']>
  ): ReturnType<OverviewVirtualizationFeaturesPage['navigateToPermissions']> {
    return this.virtualizationFeatures.navigateToPermissions(...args);
  }
  navigateToPreviewFeatures(
    ...args: Parameters<OverviewSettingsPage['navigateToPreviewFeatures']>
  ): ReturnType<OverviewSettingsPage['navigateToPreviewFeatures']> {
    return this._settings.navigateToPreviewFeatures(...args);
  }
  navigateToQuickStart(
    ...args: Parameters<OverviewQuickStartsPage['navigateToQuickStart']>
  ): ReturnType<OverviewQuickStartsPage['navigateToQuickStart']> {
    return this.quickStarts.navigateToQuickStart(...args);
  }
  navigateToQuickStartViaUI(
    ...args: Parameters<OverviewQuickStartsPage['navigateToQuickStartViaUI']>
  ): ReturnType<OverviewQuickStartsPage['navigateToQuickStartViaUI']> {
    return this.quickStarts.navigateToQuickStartViaUI(...args);
  }
  navigateToResourceManagement(
    ...args: Parameters<OverviewVirtualizationFeaturesPage['navigateToResourceManagement']>
  ): ReturnType<OverviewVirtualizationFeaturesPage['navigateToResourceManagement']> {
    return this.virtualizationFeatures.navigateToResourceManagement(...args);
  }
  navigateToSettings(
    ...args: Parameters<OverviewSettingsPage['navigateToSettings']>
  ): ReturnType<OverviewSettingsPage['navigateToSettings']> {
    return this._settings.navigateToSettings(...args);
  }
  navigateToSettingsViaSidebar(
    ...args: Parameters<OverviewSettingsPage['navigateToSettingsViaSidebar']>
  ): ReturnType<OverviewSettingsPage['navigateToSettingsViaSidebar']> {
    return this._settings.navigateToSettingsViaSidebar(...args);
  }
  navigateToSettingsViaUI(
    ...args: Parameters<OverviewSettingsPage['navigateToSettingsViaUI']>
  ): ReturnType<OverviewSettingsPage['navigateToSettingsViaUI']> {
    return this._settings.navigateToSettingsViaUI(...args);
  }
  navigateToSSHKeysManagement(
    ...args: Parameters<OverviewSshKeysPage['navigateToSSHKeysManagement']>
  ): ReturnType<OverviewSshKeysPage['navigateToSSHKeysManagement']> {
    return this.sshKeys.navigateToSSHKeysManagement(...args);
  }
  navigateToStandaloneMigrationsPage(
    ...args: Parameters<OverviewMigrationsPage['navigateToStandaloneMigrationsPage']>
  ): ReturnType<OverviewMigrationsPage['navigateToStandaloneMigrationsPage']> {
    return this.migrations.navigateToStandaloneMigrationsPage(...args);
  }
  navigateToTemplatesAndImagesManagement(
    ...args: Parameters<OverviewSettingsPage['navigateToTemplatesAndImagesManagement']>
  ): ReturnType<OverviewSettingsPage['navigateToTemplatesAndImagesManagement']> {
    return this._settings.navigateToTemplatesAndImagesManagement(...args);
  }
  navigateToTopConsumers(
    ...args: Parameters<OverviewDashboardPage['navigateToTopConsumers']>
  ): ReturnType<OverviewDashboardPage['navigateToTopConsumers']> {
    return this._dashboard.navigateToTopConsumers(...args);
  }
  navigateToVirtualizationFeatures(
    ...args: Parameters<OverviewVirtualizationFeaturesPage['navigateToVirtualizationFeatures']>
  ): ReturnType<OverviewVirtualizationFeaturesPage['navigateToVirtualizationFeatures']> {
    return this.virtualizationFeatures.navigateToVirtualizationFeatures(...args);
  }
  navigateToVirtualizationOverview(
    ...args: Parameters<OverviewDashboardPage['navigateToVirtualizationOverview']>
  ): ReturnType<OverviewDashboardPage['navigateToVirtualizationOverview']> {
    return this._dashboard.navigateToVirtualizationOverview(...args);
  }
  navigateToVirtualizationOverviewViaUI(
    ...args: Parameters<OverviewDashboardPage['navigateToVirtualizationOverviewViaUI']>
  ): ReturnType<OverviewDashboardPage['navigateToVirtualizationOverviewViaUI']> {
    return this._dashboard.navigateToVirtualizationOverviewViaUI(...args);
  }
  navigateToWizardSummaryStep(
    ...args: Parameters<OverviewVirtualizationFeaturesPage['navigateToWizardSummaryStep']>
  ): ReturnType<OverviewVirtualizationFeaturesPage['navigateToWizardSummaryStep']> {
    return this.virtualizationFeatures.navigateToWizardSummaryStep(...args);
  }
  navigateWizardStepsAndVerifySummary(
    ...args: Parameters<OverviewVirtualizationFeaturesPage['navigateWizardStepsAndVerifySummary']>
  ): ReturnType<OverviewVirtualizationFeaturesPage['navigateWizardStepsAndVerifySummary']> {
    return this.virtualizationFeatures.navigateWizardStepsAndVerifySummary(...args);
  }
  openAdvancedCdromFeaturesSettings(
    ...args: Parameters<OverviewSettingsPage['openAdvancedCdromFeaturesSettings']>
  ): ReturnType<OverviewSettingsPage['openAdvancedCdromFeaturesSettings']> {
    return this._settings.openAdvancedCdromFeaturesSettings(...args);
  }
  openConfigureFeaturesWizard(
    ...args: Parameters<OverviewVirtualizationFeaturesPage['openConfigureFeaturesWizard']>
  ): ReturnType<OverviewVirtualizationFeaturesPage['openConfigureFeaturesWizard']> {
    return this.virtualizationFeatures.openConfigureFeaturesWizard(...args);
  }
  openCreateVmFromVolumeQuickStart(
    ...args: Parameters<OverviewQuickStartsPage['openCreateVmFromVolumeQuickStart']>
  ): ReturnType<OverviewQuickStartsPage['openCreateVmFromVolumeQuickStart']> {
    return this.quickStarts.openCreateVmFromVolumeQuickStart(...args);
  }
  openMemoryDensitySettings(
    ...args: Parameters<OverviewMigrationsPage['openMemoryDensitySettings']>
  ): ReturnType<OverviewMigrationsPage['openMemoryDensitySettings']> {
    return this.migrations.openMemoryDensitySettings(...args);
  }
  saveSSHKey(
    ...args: Parameters<OverviewSshKeysPage['saveSSHKey']>
  ): ReturnType<OverviewSshKeysPage['saveSSHKey']> {
    return this.sshKeys.saveSSHKey(...args);
  }
  selectInstanceTypeChart(
    ...args: Parameters<OverviewDashboardPage['selectInstanceTypeChart']>
  ): ReturnType<OverviewDashboardPage['selectInstanceTypeChart']> {
    return this._dashboard.selectInstanceTypeChart(...args);
  }
  selectMigrationsTimeFilter(
    ...args: Parameters<OverviewMigrationsPage['selectMigrationsTimeFilter']>
  ): ReturnType<OverviewMigrationsPage['selectMigrationsTimeFilter']> {
    return this.migrations.selectMigrationsTimeFilter(...args);
  }
  selectProjectByNamespace(
    ...args: Parameters<OverviewSshKeysPage['selectProjectByNamespace']>
  ): ReturnType<OverviewSshKeysPage['selectProjectByNamespace']> {
    return this.sshKeys.selectProjectByNamespace(...args);
  }
  selectProjectInSSHSettings(
    ...args: Parameters<OverviewSshKeysPage['selectProjectInSSHSettings']>
  ): ReturnType<OverviewSshKeysPage['selectProjectInSSHSettings']> {
    return this.sshKeys.selectProjectInSSHSettings(...args);
  }
  setGuestSystemLog(
    ...args: Parameters<OverviewSettingsPage['setGuestSystemLog']>
  ): ReturnType<OverviewSettingsPage['setGuestSystemLog']> {
    return this._settings.setGuestSystemLog(...args);
  }
  setHideYamlTab(
    ...args: Parameters<OverviewSettingsPage['setHideYamlTab']>
  ): ReturnType<OverviewSettingsPage['setHideYamlTab']> {
    return this._settings.setHideYamlTab(...args);
  }
  setLiveMigrationLimits(
    ...args: Parameters<OverviewMigrationsPage['setLiveMigrationLimits']>
  ): ReturnType<OverviewMigrationsPage['setLiveMigrationLimits']> {
    return this.migrations.setLiveMigrationLimits(...args);
  }
  setMemoryDensityPercentage(
    ...args: Parameters<OverviewMigrationsPage['setMemoryDensityPercentage']>
  ): ReturnType<OverviewMigrationsPage['setMemoryDensityPercentage']> {
    return this.migrations.setMemoryDensityPercentage(...args);
  }
  setVmActionsConfirmation(
    ...args: Parameters<OverviewSettingsPage['setVmActionsConfirmation']>
  ): ReturnType<OverviewSettingsPage['setVmActionsConfirmation']> {
    return this._settings.setVmActionsConfirmation(...args);
  }
  testLoadBalanceFeature(
    ...args: Parameters<OverviewVirtualizationFeaturesPage['testLoadBalanceFeature']>
  ): ReturnType<OverviewVirtualizationFeaturesPage['testLoadBalanceFeature']> {
    return this.virtualizationFeatures.testLoadBalanceFeature(...args);
  }
  testPasstBindingSetting(
    ...args: Parameters<OverviewSettingsPage['testPasstBindingSetting']>
  ): ReturnType<OverviewSettingsPage['testPasstBindingSetting']> {
    return this._settings.testPasstBindingSetting(...args);
  }
  testVirtctlDownloadPopover(
    ...args: Parameters<OverviewDashboardPage['testVirtctlDownloadPopover']>
  ): ReturnType<OverviewDashboardPage['testVirtctlDownloadPopover']> {
    return this._dashboard.testVirtctlDownloadPopover(...args);
  }
  testVmFoldersSetting(
    ...args: Parameters<OverviewSettingsPage['testVmFoldersSetting']>
  ): ReturnType<OverviewSettingsPage['testVmFoldersSetting']> {
    return this._settings.testVmFoldersSetting(...args);
  }
  toggleMemoryDensity(
    ...args: Parameters<OverviewMigrationsPage['toggleMemoryDensity']>
  ): ReturnType<OverviewMigrationsPage['toggleMemoryDensity']> {
    return this.migrations.toggleMemoryDensity(...args);
  }
  verifyCentosStream9ImageCronEnabled(
    ...args: Parameters<OverviewSettingsPage['verifyCentosStream9ImageCronEnabled']>
  ): ReturnType<OverviewSettingsPage['verifyCentosStream9ImageCronEnabled']> {
    return this._settings.verifyCentosStream9ImageCronEnabled(...args);
  }
  verifyClusterObservabilityEnabled(
    ...args: Parameters<OverviewVirtualizationFeaturesPage['verifyClusterObservabilityEnabled']>
  ): ReturnType<OverviewVirtualizationFeaturesPage['verifyClusterObservabilityEnabled']> {
    return this.virtualizationFeatures.verifyClusterObservabilityEnabled(...args);
  }
  verifyConfigurationWizard(
    ...args: Parameters<OverviewVirtualizationFeaturesPage['verifyConfigurationWizard']>
  ): ReturnType<OverviewVirtualizationFeaturesPage['verifyConfigurationWizard']> {
    return this.virtualizationFeatures.verifyConfigurationWizard(...args);
  }
  verifyDangerAlertNotVisible(
    ...args: Parameters<OverviewQuickStartsPage['verifyDangerAlertNotVisible']>
  ): ReturnType<OverviewQuickStartsPage['verifyDangerAlertNotVisible']> {
    return this.quickStarts.verifyDangerAlertNotVisible(...args);
  }
  verifyDangerAlertVisible(
    ...args: Parameters<OverviewQuickStartsPage['verifyDangerAlertVisible']>
  ): ReturnType<OverviewQuickStartsPage['verifyDangerAlertVisible']> {
    return this.quickStarts.verifyDangerAlertVisible(...args);
  }
  verifyDashboardMetricCardsVisible(
    ...args: Parameters<OverviewDashboardPage['verifyDashboardMetricCardsVisible']>
  ): ReturnType<OverviewDashboardPage['verifyDashboardMetricCardsVisible']> {
    return this._dashboard.verifyDashboardMetricCardsVisible(...args);
  }
  verifyFeatureHighlightsCard(
    ...args: Parameters<OverviewDashboardPage['verifyFeatureHighlightsCard']>
  ): ReturnType<OverviewDashboardPage['verifyFeatureHighlightsCard']> {
    return this._dashboard.verifyFeatureHighlightsCard(...args);
  }
  verifyFeatureSummaryContainsClusterObservabilityInstalled(
    ...args: Parameters<
      OverviewVirtualizationFeaturesPage['verifyFeatureSummaryContainsClusterObservabilityInstalled']
    >
  ): ReturnType<
    OverviewVirtualizationFeaturesPage['verifyFeatureSummaryContainsClusterObservabilityInstalled']
  > {
    return this.virtualizationFeatures.verifyFeatureSummaryContainsClusterObservabilityInstalled(
      ...args,
    );
  }
  verifyFeatureSummaryItemsContainExpectedTexts(
    ...args: Parameters<
      OverviewVirtualizationFeaturesPage['verifyFeatureSummaryItemsContainExpectedTexts']
    >
  ): ReturnType<
    OverviewVirtualizationFeaturesPage['verifyFeatureSummaryItemsContainExpectedTexts']
  > {
    return this.virtualizationFeatures.verifyFeatureSummaryItemsContainExpectedTexts(...args);
  }
  verifyGuidedTourSteps(
    ...args: Parameters<OverviewSettingsPage['verifyGuidedTourSteps']>
  ): ReturnType<OverviewSettingsPage['verifyGuidedTourSteps']> {
    return this._settings.verifyGuidedTourSteps(...args);
  }
  verifyHealthyConditions(
    ...args: Parameters<OverviewDashboardPage['verifyHealthyConditions']>
  ): ReturnType<OverviewDashboardPage['verifyHealthyConditions']> {
    return this._dashboard.verifyHealthyConditions(...args);
  }
  verifyHighlightedSearchResultsVisible(
    ...args: Parameters<OverviewSettingsPage['verifyHighlightedSearchResultsVisible']>
  ): ReturnType<OverviewSettingsPage['verifyHighlightedSearchResultsVisible']> {
    return this._settings.verifyHighlightedSearchResultsVisible(...args);
  }
  verifyInstalledVersion(
    ...args: Parameters<OverviewMigrationsPage['verifyInstalledVersion']>
  ): ReturnType<OverviewMigrationsPage['verifyInstalledVersion']> {
    return this.migrations.verifyInstalledVersion(...args);
  }
  verifyInstanceTypeChart(
    ...args: Parameters<OverviewDashboardPage['verifyInstanceTypeChart']>
  ): ReturnType<OverviewDashboardPage['verifyInstanceTypeChart']> {
    return this._dashboard.verifyInstanceTypeChart(...args);
  }
  verifyKSMEnabled(
    ...args: Parameters<OverviewVirtualizationFeaturesPage['verifyKSMEnabled']>
  ): ReturnType<OverviewVirtualizationFeaturesPage['verifyKSMEnabled']> {
    return this.virtualizationFeatures.verifyKSMEnabled(...args);
  }
  verifyLiveMigrationSettings(
    ...args: Parameters<OverviewMigrationsPage['verifyLiveMigrationSettings']>
  ): ReturnType<OverviewMigrationsPage['verifyLiveMigrationSettings']> {
    return this.migrations.verifyLiveMigrationSettings(...args);
  }
  verifyMigrationSetting(
    ...args: Parameters<OverviewMigrationsPage['verifyMigrationSetting']>
  ): ReturnType<OverviewMigrationsPage['verifyMigrationSetting']> {
    return this.migrations.verifyMigrationSetting(...args);
  }
  verifyMigrationsTabLoaded(
    ...args: Parameters<OverviewMigrationsPage['verifyMigrationsTabLoaded']>
  ): ReturnType<OverviewMigrationsPage['verifyMigrationsTabLoaded']> {
    return this.migrations.verifyMigrationsTabLoaded(...args);
  }
  verifyMigrationStatusSectionVisible(
    ...args: Parameters<OverviewMigrationsPage['verifyMigrationStatusSectionVisible']>
  ): ReturnType<OverviewMigrationsPage['verifyMigrationStatusSectionVisible']> {
    return this.migrations.verifyMigrationStatusSectionVisible(...args);
  }
  verifyOverviewQuickStartAndCardItemsVisible(
    ...args: Parameters<OverviewDashboardPage['verifyOverviewQuickStartAndCardItemsVisible']>
  ): ReturnType<OverviewDashboardPage['verifyOverviewQuickStartAndCardItemsVisible']> {
    return this._dashboard.verifyOverviewQuickStartAndCardItemsVisible(...args);
  }
  verifyPersistentReservationEnabled(
    ...args: Parameters<OverviewVirtualizationFeaturesPage['verifyPersistentReservationEnabled']>
  ): ReturnType<OverviewVirtualizationFeaturesPage['verifyPersistentReservationEnabled']> {
    return this.virtualizationFeatures.verifyPersistentReservationEnabled(...args);
  }
  verifyPublicSSHKeyVisible(
    ...args: Parameters<OverviewSshKeysPage['verifyPublicSSHKeyVisible']>
  ): ReturnType<OverviewSshKeysPage['verifyPublicSSHKeyVisible']> {
    return this.sshKeys.verifyPublicSSHKeyVisible(...args);
  }
  verifyQuickStartComplete(
    ...args: Parameters<OverviewQuickStartsPage['verifyQuickStartComplete']>
  ): ReturnType<OverviewQuickStartsPage['verifyQuickStartComplete']> {
    return this.quickStarts.verifyQuickStartComplete(...args);
  }
  verifyQuickStartSuccessMessage(
    ...args: Parameters<OverviewQuickStartsPage['verifyQuickStartSuccessMessage']>
  ): ReturnType<OverviewQuickStartsPage['verifyQuickStartSuccessMessage']> {
    return this.quickStarts.verifyQuickStartSuccessMessage(...args);
  }
  verifyQuickStartTileComplete(
    ...args: Parameters<OverviewQuickStartsPage['verifyQuickStartTileComplete']>
  ): ReturnType<OverviewQuickStartsPage['verifyQuickStartTileComplete']> {
    return this.quickStarts.verifyQuickStartTileComplete(...args);
  }
  verifyRelatedOperatorsCard(
    ...args: Parameters<OverviewDashboardPage['verifyRelatedOperatorsCard']>
  ): ReturnType<OverviewDashboardPage['verifyRelatedOperatorsCard']> {
    return this._dashboard.verifyRelatedOperatorsCard(...args);
  }
  verifyResourceCards(
    ...args: Parameters<OverviewDashboardPage['verifyResourceCards']>
  ): ReturnType<OverviewDashboardPage['verifyResourceCards']> {
    return this._dashboard.verifyResourceCards(...args);
  }
  verifyReviewFailed(
    ...args: Parameters<OverviewQuickStartsPage['verifyReviewFailed']>
  ): ReturnType<OverviewQuickStartsPage['verifyReviewFailed']> {
    return this.quickStarts.verifyReviewFailed(...args);
  }
  verifyReviewSuccess(
    ...args: Parameters<OverviewQuickStartsPage['verifyReviewSuccess']>
  ): ReturnType<OverviewQuickStartsPage['verifyReviewSuccess']> {
    return this.quickStarts.verifyReviewSuccess(...args);
  }
  verifySettingsTabLoaded(
    ...args: Parameters<OverviewSettingsPage['verifySettingsTabLoaded']>
  ): ReturnType<OverviewSettingsPage['verifySettingsTabLoaded']> {
    return this._settings.verifySettingsTabLoaded(...args);
  }
  verifyStandaloneMigrationsPageLoaded(
    ...args: Parameters<OverviewMigrationsPage['verifyStandaloneMigrationsPageLoaded']>
  ): ReturnType<OverviewMigrationsPage['verifyStandaloneMigrationsPageLoaded']> {
    return this.migrations.verifyStandaloneMigrationsPageLoaded(...args);
  }
  verifySuccessAlertVisible(
    ...args: Parameters<OverviewQuickStartsPage['verifySuccessAlertVisible']>
  ): ReturnType<OverviewQuickStartsPage['verifySuccessAlertVisible']> {
    return this.quickStarts.verifySuccessAlertVisible(...args);
  }
  verifyTopConsumersCards(
    ...args: Parameters<OverviewDashboardPage['verifyTopConsumersCards']>
  ): ReturnType<OverviewDashboardPage['verifyTopConsumersCards']> {
    return this._dashboard.verifyTopConsumersCards(...args);
  }
  verifyTopConsumersMenuToggleOptions(
    ...args: Parameters<OverviewDashboardPage['verifyTopConsumersMenuToggleOptions']>
  ): ReturnType<OverviewDashboardPage['verifyTopConsumersMenuToggleOptions']> {
    return this._dashboard.verifyTopConsumersMenuToggleOptions(...args);
  }
  verifyTopConsumersTabLoaded(
    ...args: Parameters<OverviewDashboardPage['verifyTopConsumersTabLoaded']>
  ): ReturnType<OverviewDashboardPage['verifyTopConsumersTabLoaded']> {
    return this._dashboard.verifyTopConsumersTabLoaded(...args);
  }
  verifyUserPermissions(
    ...args: Parameters<OverviewVirtualizationFeaturesPage['verifyUserPermissions']>
  ): ReturnType<OverviewVirtualizationFeaturesPage['verifyUserPermissions']> {
    return this.virtualizationFeatures.verifyUserPermissions(...args);
  }
  verifyVirtualizationFeatures(
    ...args: Parameters<OverviewVirtualizationFeaturesPage['verifyVirtualizationFeatures']>
  ): ReturnType<OverviewVirtualizationFeaturesPage['verifyVirtualizationFeatures']> {
    return this.virtualizationFeatures.verifyVirtualizationFeatures(...args);
  }
  verifyVirtualMachineLink(
    ...args: Parameters<OverviewDashboardPage['verifyVirtualMachineLink']>
  ): ReturnType<OverviewDashboardPage['verifyVirtualMachineLink']> {
    return this._dashboard.verifyVirtualMachineLink(...args);
  }
  verifyVmimDetailPage(
    ...args: Parameters<OverviewMigrationsPage['verifyVmimDetailPage']>
  ): ReturnType<OverviewMigrationsPage['verifyVmimDetailPage']> {
    return this.migrations.verifyVmimDetailPage(...args);
  }
  verifyVmPerTemplateCard(
    ...args: Parameters<OverviewDashboardPage['verifyVmPerTemplateCard']>
  ): ReturnType<OverviewDashboardPage['verifyVmPerTemplateCard']> {
    return this._dashboard.verifyVmPerTemplateCard(...args);
  }
  verifyWelcomeInformationUnchecked(
    ...args: Parameters<OverviewSettingsPage['verifyWelcomeInformationUnchecked']>
  ): ReturnType<OverviewSettingsPage['verifyWelcomeInformationUnchecked']> {
    return this._settings.verifyWelcomeInformationUnchecked(...args);
  }
  verifyWelcomeModalCreateFlow(
    ...args: Parameters<OverviewSettingsPage['verifyWelcomeModalCreateFlow']>
  ): ReturnType<OverviewSettingsPage['verifyWelcomeModalCreateFlow']> {
    return this._settings.verifyWelcomeModalCreateFlow(...args);
  }
  waitForMemoryDensityToggleState(
    ...args: Parameters<OverviewMigrationsPage['waitForMemoryDensityToggleState']>
  ): ReturnType<OverviewMigrationsPage['waitForMemoryDensityToggleState']> {
    return this.migrations.waitForMemoryDensityToggleState(...args);
  }
}
