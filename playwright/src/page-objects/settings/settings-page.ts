// SettingsPage — Page object for settings interactions.

import {
  OverviewMigrationsComponent,
  OverviewSshKeysComponent,
  OverviewVirtualizationFeaturesComponent,
} from '@/components/overview/overview-dashboard-components';
import { OverviewSettingsComponent } from '@/components/overview/overview-settings-components';
import BasePage from '@/page-objects/base-page';
import type { Page } from '@playwright/test';

export default class SettingsPage extends BasePage {
  private readonly _settings: OverviewSettingsComponent;
  private readonly _sshKeys: OverviewSshKeysComponent;
  private readonly _features: OverviewVirtualizationFeaturesComponent;
  private readonly _migrations: OverviewMigrationsComponent;

  constructor(page: Page) {
    super(page);
    this._settings = new OverviewSettingsComponent(page);
    this._sshKeys = new OverviewSshKeysComponent(page);
    this._features = new OverviewVirtualizationFeaturesComponent(page);
    this._migrations = new OverviewMigrationsComponent(page);
  }

  // ── Navigation ──────────────────────────────────────────────────────────────

  navigateToSettings(
    ...args: Parameters<OverviewSettingsComponent['navigateToSettings']>
  ): ReturnType<OverviewSettingsComponent['navigateToSettings']> {
    return this._settings.navigateToSettings(...args);
  }

  navigateToSettingsViaUI(
    ...args: Parameters<OverviewSettingsComponent['navigateToSettingsViaUI']>
  ): ReturnType<OverviewSettingsComponent['navigateToSettingsViaUI']> {
    return this._settings.navigateToSettingsViaUI(...args);
  }

  navigateToSettingsViaSidebar(
    ...args: Parameters<OverviewSettingsComponent['navigateToSettingsViaSidebar']>
  ): ReturnType<OverviewSettingsComponent['navigateToSettingsViaSidebar']> {
    return this._settings.navigateToSettingsViaSidebar(...args);
  }

  // ── Cluster tab — top-level ──────────────────────────────────────────────────

  verifySettingsTabLoaded(
    ...args: Parameters<OverviewSettingsComponent['verifySettingsTabLoaded']>
  ): ReturnType<OverviewSettingsComponent['verifySettingsTabLoaded']> {
    return this._settings.verifySettingsTabLoaded(...args);
  }

  getSettingsTabNames(
    ...args: Parameters<OverviewSettingsComponent['getSettingsTabNames']>
  ): ReturnType<OverviewSettingsComponent['getSettingsTabNames']> {
    return this._settings.getSettingsTabNames(...args);
  }

  fillConfigurationSearchInput(
    ...args: Parameters<OverviewSettingsComponent['fillConfigurationSearchInput']>
  ): ReturnType<OverviewSettingsComponent['fillConfigurationSearchInput']> {
    return this._settings.fillConfigurationSearchInput(...args);
  }

  verifyHighlightedSearchResultsVisible(
    ...args: Parameters<OverviewSettingsComponent['verifyHighlightedSearchResultsVisible']>
  ): ReturnType<OverviewSettingsComponent['verifyHighlightedSearchResultsVisible']> {
    return this._settings.verifyHighlightedSearchResultsVisible(...args);
  }

  verifyInstalledVersion(
    ...args: Parameters<OverviewVirtualizationFeaturesComponent['verifyInstalledVersion']>
  ): ReturnType<OverviewVirtualizationFeaturesComponent['verifyInstalledVersion']> {
    return this._features.verifyInstalledVersion(...args);
  }

  // ── Cluster tab — Virtualization features section ────────────────────────────

  navigateToVirtualizationFeatures(
    ...args: Parameters<OverviewVirtualizationFeaturesComponent['navigateToVirtualizationFeatures']>
  ): ReturnType<OverviewVirtualizationFeaturesComponent['navigateToVirtualizationFeatures']> {
    return this._features.navigateToVirtualizationFeatures(...args);
  }

  verifyVirtualizationFeatures(
    ...args: Parameters<OverviewVirtualizationFeaturesComponent['verifyVirtualizationFeatures']>
  ): ReturnType<OverviewVirtualizationFeaturesComponent['verifyVirtualizationFeatures']> {
    return this._features.verifyVirtualizationFeatures(...args);
  }

  getVirtualizationFeatureItems(
    ...args: Parameters<OverviewVirtualizationFeaturesComponent['getVirtualizationFeatureItems']>
  ): ReturnType<OverviewVirtualizationFeaturesComponent['getVirtualizationFeatureItems']> {
    return this._features.getVirtualizationFeatureItems(...args);
  }

  isConfigureFeaturesButtonVisible(
    ...args: Parameters<OverviewVirtualizationFeaturesComponent['isConfigureFeaturesButtonVisible']>
  ): ReturnType<OverviewVirtualizationFeaturesComponent['isConfigureFeaturesButtonVisible']> {
    return this._features.isConfigureFeaturesButtonVisible(...args);
  }

  getClusterSettingsSectionNames(
    ...args: Parameters<OverviewVirtualizationFeaturesComponent['getClusterSettingsSectionNames']>
  ): ReturnType<OverviewVirtualizationFeaturesComponent['getClusterSettingsSectionNames']> {
    return this._features.getClusterSettingsSectionNames(...args);
  }

  // ── Cluster tab — General settings section ───────────────────────────────────

  navigateToGeneralSettings(
    ...args: Parameters<OverviewSettingsComponent['navigateToGeneralSettings']>
  ): ReturnType<OverviewSettingsComponent['navigateToGeneralSettings']> {
    return this._settings.navigateToGeneralSettings(...args);
  }

  getGeneralSettingsSubSections(
    ...args: Parameters<OverviewSettingsComponent['getGeneralSettingsSubSections']>
  ): ReturnType<OverviewSettingsComponent['getGeneralSettingsSubSections']> {
    return this._settings.getGeneralSettingsSubSections(...args);
  }

  // Live migration
  setLiveMigrationLimits(
    ...args: Parameters<OverviewVirtualizationFeaturesComponent['setLiveMigrationLimits']>
  ): ReturnType<OverviewVirtualizationFeaturesComponent['setLiveMigrationLimits']> {
    return this._features.setLiveMigrationLimits(...args);
  }

  verifyLiveMigrationSettings(
    ...args: Parameters<OverviewMigrationsComponent['verifyLiveMigrationSettings']>
  ): ReturnType<OverviewMigrationsComponent['verifyLiveMigrationSettings']> {
    return this._migrations.verifyLiveMigrationSettings(...args);
  }

  // Memory density
  openMemoryDensitySettings(
    ...args: Parameters<OverviewMigrationsComponent['openMemoryDensitySettings']>
  ): ReturnType<OverviewMigrationsComponent['openMemoryDensitySettings']> {
    return this._migrations.openMemoryDensitySettings(...args);
  }

  getMemoryDensityToggleState(
    ...args: Parameters<OverviewMigrationsComponent['getMemoryDensityToggleState']>
  ): ReturnType<OverviewMigrationsComponent['getMemoryDensityToggleState']> {
    return this._migrations.getMemoryDensityToggleState(...args);
  }

  enableMemoryDensity(
    ...args: Parameters<OverviewMigrationsComponent['enableMemoryDensity']>
  ): ReturnType<OverviewMigrationsComponent['enableMemoryDensity']> {
    return this._migrations.enableMemoryDensity(...args);
  }

  disableMemoryDensity(
    ...args: Parameters<OverviewMigrationsComponent['disableMemoryDensity']>
  ): ReturnType<OverviewMigrationsComponent['disableMemoryDensity']> {
    return this._migrations.disableMemoryDensity(...args);
  }

  setMemoryDensityPercentage(
    ...args: Parameters<OverviewMigrationsComponent['setMemoryDensityPercentage']>
  ): ReturnType<OverviewMigrationsComponent['setMemoryDensityPercentage']> {
    return this._migrations.setMemoryDensityPercentage(...args);
  }

  // SSH configurations
  enableSSHUsingLoadBalancer(
    ...args: Parameters<OverviewSettingsComponent['enableSSHUsingLoadBalancer']>
  ): ReturnType<OverviewSettingsComponent['enableSSHUsingLoadBalancer']> {
    return this._settings.enableSSHUsingLoadBalancer(...args);
  }

  enableSSHOverNodePort(
    ...args: Parameters<OverviewSettingsComponent['enableSSHOverNodePort']>
  ): ReturnType<OverviewSettingsComponent['enableSSHOverNodePort']> {
    return this._settings.enableSSHOverNodePort(...args);
  }

  // Templates and images management
  navigateToTemplatesAndImagesManagement(
    ...args: Parameters<OverviewSettingsComponent['navigateToTemplatesAndImagesManagement']>
  ): ReturnType<OverviewSettingsComponent['navigateToTemplatesAndImagesManagement']> {
    return this._settings.navigateToTemplatesAndImagesManagement(...args);
  }

  navigateToAutomaticImagesDownload(
    ...args: Parameters<OverviewSettingsComponent['navigateToAutomaticImagesDownload']>
  ): ReturnType<OverviewSettingsComponent['navigateToAutomaticImagesDownload']> {
    return this._settings.navigateToAutomaticImagesDownload(...args);
  }

  disableCentosStream9ImageCron(
    ...args: Parameters<OverviewSettingsComponent['disableCentosStream9ImageCron']>
  ): ReturnType<OverviewSettingsComponent['disableCentosStream9ImageCron']> {
    return this._settings.disableCentosStream9ImageCron(...args);
  }

  enableCentosStream9ImageCron(
    ...args: Parameters<OverviewSettingsComponent['enableCentosStream9ImageCron']>
  ): ReturnType<OverviewSettingsComponent['enableCentosStream9ImageCron']> {
    return this._settings.enableCentosStream9ImageCron(...args);
  }

  verifyCentosStream9ImageCronEnabled(
    ...args: Parameters<OverviewSettingsComponent['verifyCentosStream9ImageCronEnabled']>
  ): ReturnType<OverviewSettingsComponent['verifyCentosStream9ImageCronEnabled']> {
    return this._settings.verifyCentosStream9ImageCronEnabled(...args);
  }

  // VirtualMachine actions confirmation
  getVmActionsConfirmationState(
    ...args: Parameters<OverviewSettingsComponent['getVmActionsConfirmationState']>
  ): ReturnType<OverviewSettingsComponent['getVmActionsConfirmationState']> {
    return this._settings.getVmActionsConfirmationState(...args);
  }

  setVmActionsConfirmation(
    ...args: Parameters<OverviewSettingsComponent['setVmActionsConfirmation']>
  ): ReturnType<OverviewSettingsComponent['setVmActionsConfirmation']> {
    return this._settings.setVmActionsConfirmation(...args);
  }

  // YAML tab visibility
  setHideYamlTab(
    ...args: Parameters<OverviewSettingsComponent['setHideYamlTab']>
  ): ReturnType<OverviewSettingsComponent['setHideYamlTab']> {
    return this._settings.setHideYamlTab(...args);
  }

  // Advanced CD-ROM features
  openAdvancedCdromFeaturesSettings(
    ...args: Parameters<OverviewSettingsComponent['openAdvancedCdromFeaturesSettings']>
  ): ReturnType<OverviewSettingsComponent['openAdvancedCdromFeaturesSettings']> {
    return this._settings.openAdvancedCdromFeaturesSettings(...args);
  }

  enableAdvancedCdromFeatures(
    ...args: Parameters<OverviewSettingsComponent['enableAdvancedCdromFeatures']>
  ): ReturnType<OverviewSettingsComponent['enableAdvancedCdromFeatures']> {
    return this._settings.enableAdvancedCdromFeatures(...args);
  }

  disableAdvancedCdromFeatures(
    ...args: Parameters<OverviewSettingsComponent['disableAdvancedCdromFeatures']>
  ): ReturnType<OverviewSettingsComponent['disableAdvancedCdromFeatures']> {
    return this._settings.disableAdvancedCdromFeatures(...args);
  }

  isAdvancedCdromFeaturesEnabled(
    ...args: Parameters<OverviewSettingsComponent['isAdvancedCdromFeaturesEnabled']>
  ): ReturnType<OverviewSettingsComponent['isAdvancedCdromFeaturesEnabled']> {
    return this._settings.isAdvancedCdromFeaturesEnabled(...args);
  }

  // ── Cluster tab — Guest management section ───────────────────────────────────

  navigateToGuestManagement(
    ...args: Parameters<OverviewSettingsComponent['navigateToGuestManagement']>
  ): ReturnType<OverviewSettingsComponent['navigateToGuestManagement']> {
    return this._settings.navigateToGuestManagement(...args);
  }

  setGuestSystemLog(
    ...args: Parameters<OverviewSettingsComponent['setGuestSystemLog']>
  ): ReturnType<OverviewSettingsComponent['setGuestSystemLog']> {
    return this._settings.setGuestSystemLog(...args);
  }

  hideGuestCredentials(
    ...args: Parameters<OverviewSettingsComponent['hideGuestCredentials']>
  ): ReturnType<OverviewSettingsComponent['hideGuestCredentials']> {
    return this._settings.hideGuestCredentials(...args);
  }

  navigateToAutomaticSubscription(
    ...args: Parameters<OverviewSettingsComponent['navigateToAutomaticSubscription']>
  ): ReturnType<OverviewSettingsComponent['navigateToAutomaticSubscription']> {
    return this._settings.navigateToAutomaticSubscription(...args);
  }

  fillActivationKey(
    ...args: Parameters<OverviewSettingsComponent['fillActivationKey']>
  ): ReturnType<OverviewSettingsComponent['fillActivationKey']> {
    return this._settings.fillActivationKey(...args);
  }

  // ── Cluster tab — Resource management section ────────────────────────────────

  navigateToResourceManagement(
    ...args: Parameters<OverviewVirtualizationFeaturesComponent['navigateToResourceManagement']>
  ): ReturnType<OverviewVirtualizationFeaturesComponent['navigateToResourceManagement']> {
    return this._features.navigateToResourceManagement(...args);
  }

  isKsmControlVisible(
    ...args: Parameters<OverviewVirtualizationFeaturesComponent['isKsmControlVisible']>
  ): ReturnType<OverviewVirtualizationFeaturesComponent['isKsmControlVisible']> {
    return this._features.isKsmControlVisible(...args);
  }

  enableKSM(
    ...args: Parameters<OverviewVirtualizationFeaturesComponent['enableKSM']>
  ): ReturnType<OverviewVirtualizationFeaturesComponent['enableKSM']> {
    return this._features.enableKSM(...args);
  }

  verifyKSMEnabled(
    ...args: Parameters<OverviewVirtualizationFeaturesComponent['verifyKSMEnabled']>
  ): ReturnType<OverviewVirtualizationFeaturesComponent['verifyKSMEnabled']> {
    return this._features.verifyKSMEnabled(...args);
  }

  isAaqControlVisible(
    ...args: Parameters<OverviewVirtualizationFeaturesComponent['isAaqControlVisible']>
  ): ReturnType<OverviewVirtualizationFeaturesComponent['isAaqControlVisible']> {
    return this._features.isAaqControlVisible(...args);
  }

  isAaqEnabled(
    ...args: Parameters<OverviewVirtualizationFeaturesComponent['isAaqEnabled']>
  ): ReturnType<OverviewVirtualizationFeaturesComponent['isAaqEnabled']> {
    return this._features.isAaqEnabled(...args);
  }

  enableAaq(
    ...args: Parameters<OverviewVirtualizationFeaturesComponent['enableAaq']>
  ): ReturnType<OverviewVirtualizationFeaturesComponent['enableAaq']> {
    return this._features.enableAaq(...args);
  }

  isManageQuotasLinkVisible(
    ...args: Parameters<OverviewVirtualizationFeaturesComponent['isManageQuotasLinkVisible']>
  ): ReturnType<OverviewVirtualizationFeaturesComponent['isManageQuotasLinkVisible']> {
    return this._features.isManageQuotasLinkVisible(...args);
  }

  // ── Cluster tab — SCSI persistent reservation section ───────────────────────

  enablePersistentReservation(
    ...args: Parameters<OverviewVirtualizationFeaturesComponent['enablePersistentReservation']>
  ): ReturnType<OverviewVirtualizationFeaturesComponent['enablePersistentReservation']> {
    return this._features.enablePersistentReservation(...args);
  }

  verifyPersistentReservationEnabled(
    ...args: Parameters<
      OverviewVirtualizationFeaturesComponent['verifyPersistentReservationEnabled']
    >
  ): ReturnType<OverviewVirtualizationFeaturesComponent['verifyPersistentReservationEnabled']> {
    return this._features.verifyPersistentReservationEnabled(...args);
  }

  // ── User tab ─────────────────────────────────────────────────────────────────

  navigateToSSHKeysManagement(
    ...args: Parameters<OverviewSshKeysComponent['navigateToSSHKeysManagement']>
  ): ReturnType<OverviewSshKeysComponent['navigateToSSHKeysManagement']> {
    return this._sshKeys.navigateToSSHKeysManagement(...args);
  }

  selectProjectInSSHSettings(
    ...args: Parameters<OverviewSshKeysComponent['selectProjectInSSHSettings']>
  ): ReturnType<OverviewSshKeysComponent['selectProjectInSSHSettings']> {
    return this._sshKeys.selectProjectInSSHSettings(...args);
  }

  verifyPublicSSHKeyVisible(
    ...args: Parameters<OverviewSshKeysComponent['verifyPublicSSHKeyVisible']>
  ): ReturnType<OverviewSshKeysComponent['verifyPublicSSHKeyVisible']> {
    return this._sshKeys.verifyPublicSSHKeyVisible(...args);
  }

  saveSSHKey(
    ...args: Parameters<OverviewSshKeysComponent['saveSSHKey']>
  ): ReturnType<OverviewSshKeysComponent['saveSSHKey']> {
    return this._sshKeys.saveSSHKey(...args);
  }

  navigateToPermissions(
    ...args: Parameters<OverviewVirtualizationFeaturesComponent['navigateToPermissions']>
  ): ReturnType<OverviewVirtualizationFeaturesComponent['navigateToPermissions']> {
    return this._features.navigateToPermissions(...args);
  }

  verifyUserPermissions(
    ...args: Parameters<OverviewVirtualizationFeaturesComponent['verifyUserPermissions']>
  ): ReturnType<OverviewVirtualizationFeaturesComponent['verifyUserPermissions']> {
    return this._features.verifyUserPermissions(...args);
  }

  // ── User tab — Getting started resources section ──────────────────────────────

  navigateToGettingStartedResources(
    ...args: Parameters<OverviewSettingsComponent['navigateToGettingStartedResources']>
  ): ReturnType<OverviewSettingsComponent['navigateToGettingStartedResources']> {
    return this._settings.navigateToGettingStartedResources(...args);
  }

  enableWelcomeInformation(
    ...args: Parameters<OverviewSettingsComponent['enableWelcomeInformation']>
  ): ReturnType<OverviewSettingsComponent['enableWelcomeInformation']> {
    return this._settings.enableWelcomeInformation(...args);
  }

  enableGuidedTour(
    ...args: Parameters<OverviewSettingsComponent['enableGuidedTour']>
  ): ReturnType<OverviewSettingsComponent['enableGuidedTour']> {
    return this._settings.enableGuidedTour(...args);
  }

  // ── Preview features tab ─────────────────────────────────────────────────────

  navigateToPreviewFeatures(
    ...args: Parameters<OverviewSettingsComponent['navigateToPreviewFeatures']>
  ): ReturnType<OverviewSettingsComponent['navigateToPreviewFeatures']> {
    return this._settings.navigateToPreviewFeatures(...args);
  }

  getPreviewFeatureLabels(
    ...args: Parameters<OverviewSettingsComponent['getPreviewFeatureLabels']>
  ): ReturnType<OverviewSettingsComponent['getPreviewFeatureLabels']> {
    return this._settings.getPreviewFeatureLabels(...args);
  }

  testVmFoldersSetting(
    ...args: Parameters<OverviewSettingsComponent['testVmFoldersSetting']>
  ): ReturnType<OverviewSettingsComponent['testVmFoldersSetting']> {
    return this._settings.testVmFoldersSetting(...args);
  }

  testPasstBindingSetting(
    ...args: Parameters<OverviewSettingsComponent['testPasstBindingSetting']>
  ): ReturnType<OverviewSettingsComponent['testPasstBindingSetting']> {
    return this._settings.testPasstBindingSetting(...args);
  }

  isPasstBindingChecked(
    ...args: Parameters<OverviewSettingsComponent['isPasstBindingChecked']>
  ): ReturnType<OverviewSettingsComponent['isPasstBindingChecked']> {
    return this._settings.isPasstBindingChecked(...args);
  }

  enableVmTemplatesPreviewFeature(
    ...args: Parameters<OverviewSettingsComponent['enableVmTemplatesPreviewFeature']>
  ): ReturnType<OverviewSettingsComponent['enableVmTemplatesPreviewFeature']> {
    return this._settings.enableVmTemplatesPreviewFeature(...args);
  }

  disableVmTemplatesPreviewFeature(
    ...args: Parameters<OverviewSettingsComponent['disableVmTemplatesPreviewFeature']>
  ): ReturnType<OverviewSettingsComponent['disableVmTemplatesPreviewFeature']> {
    return this._settings.disableVmTemplatesPreviewFeature(...args);
  }

  // ── User tab — Auto-hide navigation ────────────────────────────────────────

  navigateToUserTabGeneralSection(
    ...args: Parameters<OverviewSettingsComponent['navigateToUserTabGeneralSection']>
  ): ReturnType<OverviewSettingsComponent['navigateToUserTabGeneralSection']> {
    return this._settings.navigateToUserTabGeneralSection(...args);
  }

  setAutoHideNavigation(
    ...args: Parameters<OverviewSettingsComponent['setAutoHideNavigation']>
  ): ReturnType<OverviewSettingsComponent['setAutoHideNavigation']> {
    return this._settings.setAutoHideNavigation(...args);
  }

  getAutoHideNavigationState(
    ...args: Parameters<OverviewSettingsComponent['getAutoHideNavigationState']>
  ): ReturnType<OverviewSettingsComponent['getAutoHideNavigationState']> {
    return this._settings.getAutoHideNavigationState(...args);
  }
}
