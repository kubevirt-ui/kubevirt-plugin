/**
 * SettingsPage — standalone page object for the Virtualization Settings area.
 *
 * Covers all three tabs reachable from Virtualization → Settings:
 *   /k8s/all-namespaces/virtualization-settings/cluster
 *   /k8s/all-namespaces/virtualization-settings/user
 *   /k8s/all-namespaces/virtualization-settings/features
 *
 * Composes the existing sub-page-objects without going through OverviewPage.
 */

import BasePage from '@/page-objects/base-page';
import OverviewMigrationsPage from '@/page-objects/overview/overview-migrations-page';
import OverviewSettingsPage from '@/page-objects/overview/overview-settings-page';
import OverviewSshKeysPage from '@/page-objects/overview/overview-ssh-keys-page';
import OverviewVirtualizationFeaturesPage from '@/page-objects/overview/overview-virtualization-features-page';
import type { Page } from '@playwright/test';

export default class SettingsPage extends BasePage {
  private readonly _features: OverviewVirtualizationFeaturesPage;
  private readonly _migrations: OverviewMigrationsPage;
  private readonly _settings: OverviewSettingsPage;
  private readonly _sshKeys: OverviewSshKeysPage;

  constructor(page: Page) {
    super(page);
    this._settings = new OverviewSettingsPage(page);
    this._sshKeys = new OverviewSshKeysPage(page);
    this._features = new OverviewVirtualizationFeaturesPage(page);
    this._migrations = new OverviewMigrationsPage(page);
  }

  // ── Navigation ──────────────────────────────────────────────────────────────

  adjustMemoryRequestRatio(
    ...args: Parameters<OverviewVirtualizationFeaturesPage['adjustMemoryRequestRatio']>
  ): ReturnType<OverviewVirtualizationFeaturesPage['adjustMemoryRequestRatio']> {
    return this._features.adjustMemoryRequestRatio(...args);
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

  // ── Cluster tab — top-level ──────────────────────────────────────────────────

  disableMemoryDensity(
    ...args: Parameters<OverviewMigrationsPage['disableMemoryDensity']>
  ): ReturnType<OverviewMigrationsPage['disableMemoryDensity']> {
    return this._migrations.disableMemoryDensity(...args);
  }

  disableVmTemplatesPreviewFeature(
    ...args: Parameters<OverviewSettingsPage['disableVmTemplatesPreviewFeature']>
  ): ReturnType<OverviewSettingsPage['disableVmTemplatesPreviewFeature']> {
    return this._settings.disableVmTemplatesPreviewFeature(...args);
  }

  enableAaq(
    ...args: Parameters<OverviewVirtualizationFeaturesPage['enableAaq']>
  ): ReturnType<OverviewVirtualizationFeaturesPage['enableAaq']> {
    return this._features.enableAaq(...args);
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

  // ── Cluster tab — Virtualization features section ────────────────────────────

  enableGuidedTour(
    ...args: Parameters<OverviewSettingsPage['enableGuidedTour']>
  ): ReturnType<OverviewSettingsPage['enableGuidedTour']> {
    return this._settings.enableGuidedTour(...args);
  }

  enableKSM(
    ...args: Parameters<OverviewVirtualizationFeaturesPage['enableKSM']>
  ): ReturnType<OverviewVirtualizationFeaturesPage['enableKSM']> {
    return this._features.enableKSM(...args);
  }

  enableMemoryDensity(
    ...args: Parameters<OverviewMigrationsPage['enableMemoryDensity']>
  ): ReturnType<OverviewMigrationsPage['enableMemoryDensity']> {
    return this._migrations.enableMemoryDensity(...args);
  }

  enablePersistentReservation(
    ...args: Parameters<OverviewVirtualizationFeaturesPage['enablePersistentReservation']>
  ): ReturnType<OverviewVirtualizationFeaturesPage['enablePersistentReservation']> {
    return this._features.enablePersistentReservation(...args);
  }

  enableSSHOverNodePort(
    ...args: Parameters<OverviewSettingsPage['enableSSHOverNodePort']>
  ): ReturnType<OverviewSettingsPage['enableSSHOverNodePort']> {
    return this._settings.enableSSHOverNodePort(...args);
  }

  // ── Cluster tab — General settings section ───────────────────────────────────

  // SSH configurations
  enableSSHUsingLoadBalancer(
    ...args: Parameters<OverviewSettingsPage['enableSSHUsingLoadBalancer']>
  ): ReturnType<OverviewSettingsPage['enableSSHUsingLoadBalancer']> {
    return this._settings.enableSSHUsingLoadBalancer(...args);
  }

  enableVmTemplatesPreviewFeature(
    ...args: Parameters<OverviewSettingsPage['enableVmTemplatesPreviewFeature']>
  ): ReturnType<OverviewSettingsPage['enableVmTemplatesPreviewFeature']> {
    return this._settings.enableVmTemplatesPreviewFeature(...args);
  }

  enableWelcomeInformation(
    ...args: Parameters<OverviewSettingsPage['enableWelcomeInformation']>
  ): ReturnType<OverviewSettingsPage['enableWelcomeInformation']> {
    return this._settings.enableWelcomeInformation(...args);
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

  getClusterSettingsSectionNames(
    ...args: Parameters<OverviewVirtualizationFeaturesPage['getClusterSettingsSectionNames']>
  ): ReturnType<OverviewVirtualizationFeaturesPage['getClusterSettingsSectionNames']> {
    return this._features.getClusterSettingsSectionNames(...args);
  }

  getGeneralSettingsSubSections(
    ...args: Parameters<OverviewSettingsPage['getGeneralSettingsSubSections']>
  ): ReturnType<OverviewSettingsPage['getGeneralSettingsSubSections']> {
    return this._settings.getGeneralSettingsSubSections(...args);
  }

  getMemoryDensityToggleState(
    ...args: Parameters<OverviewMigrationsPage['getMemoryDensityToggleState']>
  ): ReturnType<OverviewMigrationsPage['getMemoryDensityToggleState']> {
    return this._migrations.getMemoryDensityToggleState(...args);
  }

  getMemoryRequestRatioValue(
    ...args: Parameters<OverviewVirtualizationFeaturesPage['getMemoryRequestRatioValue']>
  ): ReturnType<OverviewVirtualizationFeaturesPage['getMemoryRequestRatioValue']> {
    return this._features.getMemoryRequestRatioValue(...args);
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
    return this._features.getVirtualizationFeatureItems(...args);
  }

  // VirtualMachine actions confirmation
  getVmActionsConfirmationState(
    ...args: Parameters<OverviewSettingsPage['getVmActionsConfirmationState']>
  ): ReturnType<OverviewSettingsPage['getVmActionsConfirmationState']> {
    return this._settings.getVmActionsConfirmationState(...args);
  }

  hideGuestCredentials(
    ...args: Parameters<OverviewSettingsPage['hideGuestCredentials']>
  ): ReturnType<OverviewSettingsPage['hideGuestCredentials']> {
    return this._settings.hideGuestCredentials(...args);
  }

  isAaqControlVisible(
    ...args: Parameters<OverviewVirtualizationFeaturesPage['isAaqControlVisible']>
  ): ReturnType<OverviewVirtualizationFeaturesPage['isAaqControlVisible']> {
    return this._features.isAaqControlVisible(...args);
  }

  isAaqEnabled(
    ...args: Parameters<OverviewVirtualizationFeaturesPage['isAaqEnabled']>
  ): ReturnType<OverviewVirtualizationFeaturesPage['isAaqEnabled']> {
    return this._features.isAaqEnabled(...args);
  }

  isAdvancedCdromFeaturesEnabled(
    ...args: Parameters<OverviewSettingsPage['isAdvancedCdromFeaturesEnabled']>
  ): ReturnType<OverviewSettingsPage['isAdvancedCdromFeaturesEnabled']> {
    return this._settings.isAdvancedCdromFeaturesEnabled(...args);
  }

  isConfigureFeaturesButtonVisible(
    ...args: Parameters<OverviewVirtualizationFeaturesPage['isConfigureFeaturesButtonVisible']>
  ): ReturnType<OverviewVirtualizationFeaturesPage['isConfigureFeaturesButtonVisible']> {
    return this._features.isConfigureFeaturesButtonVisible(...args);
  }

  isKsmControlVisible(
    ...args: Parameters<OverviewVirtualizationFeaturesPage['isKsmControlVisible']>
  ): ReturnType<OverviewVirtualizationFeaturesPage['isKsmControlVisible']> {
    return this._features.isKsmControlVisible(...args);
  }

  isManageQuotasLinkVisible(
    ...args: Parameters<OverviewVirtualizationFeaturesPage['isManageQuotasLinkVisible']>
  ): ReturnType<OverviewVirtualizationFeaturesPage['isManageQuotasLinkVisible']> {
    return this._features.isManageQuotasLinkVisible(...args);
  }

  isPasstBindingChecked(
    ...args: Parameters<OverviewSettingsPage['isPasstBindingChecked']>
  ): ReturnType<OverviewSettingsPage['isPasstBindingChecked']> {
    return this._settings.isPasstBindingChecked(...args);
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

  // ── Cluster tab — Guest management section ───────────────────────────────────

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

  navigateToPermissions(
    ...args: Parameters<OverviewVirtualizationFeaturesPage['navigateToPermissions']>
  ): ReturnType<OverviewVirtualizationFeaturesPage['navigateToPermissions']> {
    return this._features.navigateToPermissions(...args);
  }

  navigateToPreviewFeatures(
    ...args: Parameters<OverviewSettingsPage['navigateToPreviewFeatures']>
  ): ReturnType<OverviewSettingsPage['navigateToPreviewFeatures']> {
    return this._settings.navigateToPreviewFeatures(...args);
  }

  // ── Cluster tab — Resource management section ────────────────────────────────

  navigateToResourceManagement(
    ...args: Parameters<OverviewVirtualizationFeaturesPage['navigateToResourceManagement']>
  ): ReturnType<OverviewVirtualizationFeaturesPage['navigateToResourceManagement']> {
    return this._features.navigateToResourceManagement(...args);
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
    return this._sshKeys.navigateToSSHKeysManagement(...args);
  }

  // Templates and images management
  navigateToTemplatesAndImagesManagement(
    ...args: Parameters<OverviewSettingsPage['navigateToTemplatesAndImagesManagement']>
  ): ReturnType<OverviewSettingsPage['navigateToTemplatesAndImagesManagement']> {
    return this._settings.navigateToTemplatesAndImagesManagement(...args);
  }

  navigateToVirtualizationFeatures(
    ...args: Parameters<OverviewVirtualizationFeaturesPage['navigateToVirtualizationFeatures']>
  ): ReturnType<OverviewVirtualizationFeaturesPage['navigateToVirtualizationFeatures']> {
    return this._features.navigateToVirtualizationFeatures(...args);
  }

  // Advanced CD-ROM features
  openAdvancedCdromFeaturesSettings(
    ...args: Parameters<OverviewSettingsPage['openAdvancedCdromFeaturesSettings']>
  ): ReturnType<OverviewSettingsPage['openAdvancedCdromFeaturesSettings']> {
    return this._settings.openAdvancedCdromFeaturesSettings(...args);
  }

  // Memory density
  openMemoryDensitySettings(
    ...args: Parameters<OverviewMigrationsPage['openMemoryDensitySettings']>
  ): ReturnType<OverviewMigrationsPage['openMemoryDensitySettings']> {
    return this._migrations.openMemoryDensitySettings(...args);
  }

  // Memory request ratio
  openMemoryRequestRatioSettings(
    ...args: Parameters<OverviewVirtualizationFeaturesPage['openMemoryRequestRatioSettings']>
  ): ReturnType<OverviewVirtualizationFeaturesPage['openMemoryRequestRatioSettings']> {
    return this._features.openMemoryRequestRatioSettings(...args);
  }

  saveSSHKey(
    ...args: Parameters<OverviewSshKeysPage['saveSSHKey']>
  ): ReturnType<OverviewSshKeysPage['saveSSHKey']> {
    return this._sshKeys.saveSSHKey(...args);
  }

  // ── Cluster tab — SCSI persistent reservation section ───────────────────────

  selectProjectInSSHSettings(
    ...args: Parameters<OverviewSshKeysPage['selectProjectInSSHSettings']>
  ): ReturnType<OverviewSshKeysPage['selectProjectInSSHSettings']> {
    return this._sshKeys.selectProjectInSSHSettings(...args);
  }

  setGuestSystemLog(
    ...args: Parameters<OverviewSettingsPage['setGuestSystemLog']>
  ): ReturnType<OverviewSettingsPage['setGuestSystemLog']> {
    return this._settings.setGuestSystemLog(...args);
  }

  // ── User tab ─────────────────────────────────────────────────────────────────

  // YAML tab visibility
  setHideYamlTab(
    ...args: Parameters<OverviewSettingsPage['setHideYamlTab']>
  ): ReturnType<OverviewSettingsPage['setHideYamlTab']> {
    return this._settings.setHideYamlTab(...args);
  }

  // Live migration
  setLiveMigrationLimits(
    ...args: Parameters<OverviewVirtualizationFeaturesPage['setLiveMigrationLimits']>
  ): ReturnType<OverviewVirtualizationFeaturesPage['setLiveMigrationLimits']> {
    return this._features.setLiveMigrationLimits(...args);
  }

  setMemoryDensityPercentage(
    ...args: Parameters<OverviewMigrationsPage['setMemoryDensityPercentage']>
  ): ReturnType<OverviewMigrationsPage['setMemoryDensityPercentage']> {
    return this._migrations.setMemoryDensityPercentage(...args);
  }

  setVmActionsConfirmation(
    ...args: Parameters<OverviewSettingsPage['setVmActionsConfirmation']>
  ): ReturnType<OverviewSettingsPage['setVmActionsConfirmation']> {
    return this._settings.setVmActionsConfirmation(...args);
  }

  testPasstBindingSetting(
    ...args: Parameters<OverviewSettingsPage['testPasstBindingSetting']>
  ): ReturnType<OverviewSettingsPage['testPasstBindingSetting']> {
    return this._settings.testPasstBindingSetting(...args);
  }

  testVmFoldersSetting(
    ...args: Parameters<OverviewSettingsPage['testVmFoldersSetting']>
  ): ReturnType<OverviewSettingsPage['testVmFoldersSetting']> {
    return this._settings.testVmFoldersSetting(...args);
  }

  // ── User tab — Getting started resources section ──────────────────────────────

  verifyCentosStream9ImageCronEnabled(
    ...args: Parameters<OverviewSettingsPage['verifyCentosStream9ImageCronEnabled']>
  ): ReturnType<OverviewSettingsPage['verifyCentosStream9ImageCronEnabled']> {
    return this._settings.verifyCentosStream9ImageCronEnabled(...args);
  }

  verifyHighlightedSearchResultsVisible(
    ...args: Parameters<OverviewSettingsPage['verifyHighlightedSearchResultsVisible']>
  ): ReturnType<OverviewSettingsPage['verifyHighlightedSearchResultsVisible']> {
    return this._settings.verifyHighlightedSearchResultsVisible(...args);
  }

  verifyInstalledVersion(
    ...args: Parameters<OverviewVirtualizationFeaturesPage['verifyInstalledVersion']>
  ): ReturnType<OverviewVirtualizationFeaturesPage['verifyInstalledVersion']> {
    return this._features.verifyInstalledVersion(...args);
  }

  // ── Preview features tab ─────────────────────────────────────────────────────

  verifyKSMEnabled(
    ...args: Parameters<OverviewVirtualizationFeaturesPage['verifyKSMEnabled']>
  ): ReturnType<OverviewVirtualizationFeaturesPage['verifyKSMEnabled']> {
    return this._features.verifyKSMEnabled(...args);
  }

  verifyLiveMigrationSettings(
    ...args: Parameters<OverviewMigrationsPage['verifyLiveMigrationSettings']>
  ): ReturnType<OverviewMigrationsPage['verifyLiveMigrationSettings']> {
    return this._migrations.verifyLiveMigrationSettings(...args);
  }

  verifyPersistentReservationEnabled(
    ...args: Parameters<OverviewVirtualizationFeaturesPage['verifyPersistentReservationEnabled']>
  ): ReturnType<OverviewVirtualizationFeaturesPage['verifyPersistentReservationEnabled']> {
    return this._features.verifyPersistentReservationEnabled(...args);
  }

  verifyPublicSSHKeyVisible(
    ...args: Parameters<OverviewSshKeysPage['verifyPublicSSHKeyVisible']>
  ): ReturnType<OverviewSshKeysPage['verifyPublicSSHKeyVisible']> {
    return this._sshKeys.verifyPublicSSHKeyVisible(...args);
  }

  verifySettingsTabLoaded(
    ...args: Parameters<OverviewSettingsPage['verifySettingsTabLoaded']>
  ): ReturnType<OverviewSettingsPage['verifySettingsTabLoaded']> {
    return this._settings.verifySettingsTabLoaded(...args);
  }

  verifyUserPermissions(
    ...args: Parameters<OverviewVirtualizationFeaturesPage['verifyUserPermissions']>
  ): ReturnType<OverviewVirtualizationFeaturesPage['verifyUserPermissions']> {
    return this._features.verifyUserPermissions(...args);
  }

  verifyVirtualizationFeatures(
    ...args: Parameters<OverviewVirtualizationFeaturesPage['verifyVirtualizationFeatures']>
  ): ReturnType<OverviewVirtualizationFeaturesPage['verifyVirtualizationFeatures']> {
    return this._features.verifyVirtualizationFeatures(...args);
  }
}
