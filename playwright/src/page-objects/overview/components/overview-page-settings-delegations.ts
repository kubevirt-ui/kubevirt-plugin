import type { OverviewSettingsBridgeComponent } from '@/components/overview/overview-settings-components';

/* eslint-disable @typescript-eslint/no-explicit-any */
export function applyOverviewSettingsDelegations(proto: any): void {
  proto.navigateToSettings = function (
    this: any,
    ...args: Parameters<OverviewSettingsBridgeComponent['navigateToSettings']>
  ): ReturnType<OverviewSettingsBridgeComponent['navigateToSettings']> {
    return this._settings.navigateToSettings(...args);
  };
  proto.navigateToSettingsViaUI = function (
    this: any,
    ...args: Parameters<OverviewSettingsBridgeComponent['navigateToSettingsViaUI']>
  ): ReturnType<OverviewSettingsBridgeComponent['navigateToSettingsViaUI']> {
    return this._settings.navigateToSettingsViaUI(...args);
  };
  proto.navigateToSettingsViaSidebar = function (
    this: any,
    ...args: Parameters<OverviewSettingsBridgeComponent['navigateToSettingsViaSidebar']>
  ): ReturnType<OverviewSettingsBridgeComponent['navigateToSettingsViaSidebar']> {
    return this._settings.navigateToSettingsViaSidebar(...args);
  };
  proto.fillConfigurationSearchInput = function (
    this: any,
    ...args: Parameters<OverviewSettingsBridgeComponent['fillConfigurationSearchInput']>
  ): ReturnType<OverviewSettingsBridgeComponent['fillConfigurationSearchInput']> {
    return this._settings.fillConfigurationSearchInput(...args);
  };
  proto.verifyHighlightedSearchResultsVisible = function (
    this: any,
    ...args: Parameters<OverviewSettingsBridgeComponent['verifyHighlightedSearchResultsVisible']>
  ): ReturnType<OverviewSettingsBridgeComponent['verifyHighlightedSearchResultsVisible']> {
    return this._settings.verifyHighlightedSearchResultsVisible(...args);
  };
  proto.clickSearchResultMenuItem = function (
    this: any,
    ...args: Parameters<OverviewSettingsBridgeComponent['clickSearchResultMenuItem']>
  ): ReturnType<OverviewSettingsBridgeComponent['clickSearchResultMenuItem']> {
    return this._settings.clickSearchResultMenuItem(...args);
  };
  proto.verifySettingsTabLoaded = function (
    this: any,
    ...args: Parameters<OverviewSettingsBridgeComponent['verifySettingsTabLoaded']>
  ): ReturnType<OverviewSettingsBridgeComponent['verifySettingsTabLoaded']> {
    return this._settings.verifySettingsTabLoaded(...args);
  };
  proto.getSettingsTabNames = function (
    this: any,
    ...args: Parameters<OverviewSettingsBridgeComponent['getSettingsTabNames']>
  ): ReturnType<OverviewSettingsBridgeComponent['getSettingsTabNames']> {
    return this._settings.getSettingsTabNames(...args);
  };
  proto.getGeneralSettingsSubSections = function (
    this: any,
    ...args: Parameters<OverviewSettingsBridgeComponent['getGeneralSettingsSubSections']>
  ): ReturnType<OverviewSettingsBridgeComponent['getGeneralSettingsSubSections']> {
    return this._settings.getGeneralSettingsSubSections(...args);
  };
  proto.enableSSHUsingLoadBalancer = function (
    this: any,
    ...args: Parameters<OverviewSettingsBridgeComponent['enableSSHUsingLoadBalancer']>
  ): ReturnType<OverviewSettingsBridgeComponent['enableSSHUsingLoadBalancer']> {
    return this._settings.enableSSHUsingLoadBalancer(...args);
  };
  proto.enableSSHOverNodePort = function (
    this: any,
    ...args: Parameters<OverviewSettingsBridgeComponent['enableSSHOverNodePort']>
  ): ReturnType<OverviewSettingsBridgeComponent['enableSSHOverNodePort']> {
    return this._settings.enableSSHOverNodePort(...args);
  };
  proto.setGuestSystemLog = function (
    this: any,
    ...args: Parameters<OverviewSettingsBridgeComponent['setGuestSystemLog']>
  ): ReturnType<OverviewSettingsBridgeComponent['setGuestSystemLog']> {
    return this._settings.setGuestSystemLog(...args);
  };
  proto.setHideYamlTab = function (
    this: any,
    ...args: Parameters<OverviewSettingsBridgeComponent['setHideYamlTab']>
  ): ReturnType<OverviewSettingsBridgeComponent['setHideYamlTab']> {
    return this._settings.setHideYamlTab(...args);
  };
  proto.setVmActionsConfirmation = function (
    this: any,
    ...args: Parameters<OverviewSettingsBridgeComponent['setVmActionsConfirmation']>
  ): ReturnType<OverviewSettingsBridgeComponent['setVmActionsConfirmation']> {
    return this._settings.setVmActionsConfirmation(...args);
  };
  proto.getVmActionsConfirmationState = function (
    this: any,
    ...args: Parameters<OverviewSettingsBridgeComponent['getVmActionsConfirmationState']>
  ): ReturnType<OverviewSettingsBridgeComponent['getVmActionsConfirmationState']> {
    return this._settings.getVmActionsConfirmationState(...args);
  };
  proto.hideGuestCredentials = function (
    this: any,
    ...args: Parameters<OverviewSettingsBridgeComponent['hideGuestCredentials']>
  ): ReturnType<OverviewSettingsBridgeComponent['hideGuestCredentials']> {
    return this._settings.hideGuestCredentials(...args);
  };
  proto.navigateToGuestManagement = function (
    this: any,
    ...args: Parameters<OverviewSettingsBridgeComponent['navigateToGuestManagement']>
  ): ReturnType<OverviewSettingsBridgeComponent['navigateToGuestManagement']> {
    return this._settings.navigateToGuestManagement(...args);
  };
  proto.navigateToAutomaticSubscription = function (
    this: any,
    ...args: Parameters<OverviewSettingsBridgeComponent['navigateToAutomaticSubscription']>
  ): ReturnType<OverviewSettingsBridgeComponent['navigateToAutomaticSubscription']> {
    return this._settings.navigateToAutomaticSubscription(...args);
  };
  proto.fillActivationKey = function (
    this: any,
    ...args: Parameters<OverviewSettingsBridgeComponent['fillActivationKey']>
  ): ReturnType<OverviewSettingsBridgeComponent['fillActivationKey']> {
    return this._settings.fillActivationKey(...args);
  };
  proto.navigateToPreviewFeatures = function (
    this: any,
    ...args: Parameters<OverviewSettingsBridgeComponent['navigateToPreviewFeatures']>
  ): ReturnType<OverviewSettingsBridgeComponent['navigateToPreviewFeatures']> {
    return this._settings.navigateToPreviewFeatures(...args);
  };
  proto.getPreviewFeatureLabels = function (
    this: any,
    ...args: Parameters<OverviewSettingsBridgeComponent['getPreviewFeatureLabels']>
  ): ReturnType<OverviewSettingsBridgeComponent['getPreviewFeatureLabels']> {
    return this._settings.getPreviewFeatureLabels(...args);
  };
  proto.enableVmTemplatesPreviewFeature = function (
    this: any,
    ...args: Parameters<OverviewSettingsBridgeComponent['enableVmTemplatesPreviewFeature']>
  ): ReturnType<OverviewSettingsBridgeComponent['enableVmTemplatesPreviewFeature']> {
    return this._settings.enableVmTemplatesPreviewFeature(...args);
  };
  proto.disableVmTemplatesPreviewFeature = function (
    this: any,
    ...args: Parameters<OverviewSettingsBridgeComponent['disableVmTemplatesPreviewFeature']>
  ): ReturnType<OverviewSettingsBridgeComponent['disableVmTemplatesPreviewFeature']> {
    return this._settings.disableVmTemplatesPreviewFeature(...args);
  };
  proto.testVmFoldersSetting = function (
    this: any,
    ...args: Parameters<OverviewSettingsBridgeComponent['testVmFoldersSetting']>
  ): ReturnType<OverviewSettingsBridgeComponent['testVmFoldersSetting']> {
    return this._settings.testVmFoldersSetting(...args);
  };
  proto.testPasstBindingSetting = function (
    this: any,
    ...args: Parameters<OverviewSettingsBridgeComponent['testPasstBindingSetting']>
  ): ReturnType<OverviewSettingsBridgeComponent['testPasstBindingSetting']> {
    return this._settings.testPasstBindingSetting(...args);
  };
  proto.isPasstBindingChecked = function (
    this: any,
    ...args: Parameters<OverviewSettingsBridgeComponent['isPasstBindingChecked']>
  ): ReturnType<OverviewSettingsBridgeComponent['isPasstBindingChecked']> {
    return this._settings.isPasstBindingChecked(...args);
  };
  proto.navigateToGeneralSettings = function (
    this: any,
    ...args: Parameters<OverviewSettingsBridgeComponent['navigateToGeneralSettings']>
  ): ReturnType<OverviewSettingsBridgeComponent['navigateToGeneralSettings']> {
    return this._settings.navigateToGeneralSettings(...args);
  };
  proto.navigateToTemplatesAndImagesManagement = function (
    this: any,
    ...args: Parameters<OverviewSettingsBridgeComponent['navigateToTemplatesAndImagesManagement']>
  ): ReturnType<OverviewSettingsBridgeComponent['navigateToTemplatesAndImagesManagement']> {
    return this._settings.navigateToTemplatesAndImagesManagement(...args);
  };
  proto.navigateToAutomaticImagesDownload = function (
    this: any,
    ...args: Parameters<OverviewSettingsBridgeComponent['navigateToAutomaticImagesDownload']>
  ): ReturnType<OverviewSettingsBridgeComponent['navigateToAutomaticImagesDownload']> {
    return this._settings.navigateToAutomaticImagesDownload(...args);
  };
  proto.disableCentosStream9ImageCron = function (
    this: any,
    ...args: Parameters<OverviewSettingsBridgeComponent['disableCentosStream9ImageCron']>
  ): ReturnType<OverviewSettingsBridgeComponent['disableCentosStream9ImageCron']> {
    return this._settings.disableCentosStream9ImageCron(...args);
  };
  proto.enableCentosStream9ImageCron = function (
    this: any,
    ...args: Parameters<OverviewSettingsBridgeComponent['enableCentosStream9ImageCron']>
  ): ReturnType<OverviewSettingsBridgeComponent['enableCentosStream9ImageCron']> {
    return this._settings.enableCentosStream9ImageCron(...args);
  };
  proto.verifyCentosStream9ImageCronEnabled = function (
    this: any,
    ...args: Parameters<OverviewSettingsBridgeComponent['verifyCentosStream9ImageCronEnabled']>
  ): ReturnType<OverviewSettingsBridgeComponent['verifyCentosStream9ImageCronEnabled']> {
    return this._settings.verifyCentosStream9ImageCronEnabled(...args);
  };
  proto.navigateToGettingStartedResources = function (
    this: any,
    ...args: Parameters<OverviewSettingsBridgeComponent['navigateToGettingStartedResources']>
  ): ReturnType<OverviewSettingsBridgeComponent['navigateToGettingStartedResources']> {
    return this._settings.navigateToGettingStartedResources(...args);
  };
  proto.enableWelcomeInformation = function (
    this: any,
    ...args: Parameters<OverviewSettingsBridgeComponent['enableWelcomeInformation']>
  ): ReturnType<OverviewSettingsBridgeComponent['enableWelcomeInformation']> {
    return this._settings.enableWelcomeInformation(...args);
  };
  proto.verifyWelcomeInformationUnchecked = function (
    this: any,
    ...args: Parameters<OverviewSettingsBridgeComponent['verifyWelcomeInformationUnchecked']>
  ): ReturnType<OverviewSettingsBridgeComponent['verifyWelcomeInformationUnchecked']> {
    return this._settings.verifyWelcomeInformationUnchecked(...args);
  };
  proto.enableGuidedTour = function (
    this: any,
    ...args: Parameters<OverviewSettingsBridgeComponent['enableGuidedTour']>
  ): ReturnType<OverviewSettingsBridgeComponent['enableGuidedTour']> {
    return this._settings.enableGuidedTour(...args);
  };
  proto.verifyGuidedTourSteps = function (
    this: any,
    ...args: Parameters<OverviewSettingsBridgeComponent['verifyGuidedTourSteps']>
  ): ReturnType<OverviewSettingsBridgeComponent['verifyGuidedTourSteps']> {
    return this._settings.verifyGuidedTourSteps(...args);
  };
  proto.getGuidedTourStepTitles = function (
    this: any,
    ...args: Parameters<OverviewSettingsBridgeComponent['getGuidedTourStepTitles']>
  ): ReturnType<OverviewSettingsBridgeComponent['getGuidedTourStepTitles']> {
    return this._settings.getGuidedTourStepTitles(...args);
  };
  proto.closeGuidedTour = function (
    this: any,
    ...args: Parameters<OverviewSettingsBridgeComponent['closeGuidedTour']>
  ): ReturnType<OverviewSettingsBridgeComponent['closeGuidedTour']> {
    return this._settings.closeGuidedTour(...args);
  };
  proto.getWelcomeModalButtonTexts = function (
    this: any,
    ...args: Parameters<OverviewSettingsBridgeComponent['getWelcomeModalButtonTexts']>
  ): ReturnType<OverviewSettingsBridgeComponent['getWelcomeModalButtonTexts']> {
    return this._settings.getWelcomeModalButtonTexts(...args);
  };
  proto.openAdvancedCdromFeaturesSettings = function (
    this: any,
    ...args: Parameters<OverviewSettingsBridgeComponent['openAdvancedCdromFeaturesSettings']>
  ): ReturnType<OverviewSettingsBridgeComponent['openAdvancedCdromFeaturesSettings']> {
    return this._settings.openAdvancedCdromFeaturesSettings(...args);
  };
  proto.enableAdvancedCdromFeatures = function (
    this: any,
    ...args: Parameters<OverviewSettingsBridgeComponent['enableAdvancedCdromFeatures']>
  ): ReturnType<OverviewSettingsBridgeComponent['enableAdvancedCdromFeatures']> {
    return this._settings.enableAdvancedCdromFeatures(...args);
  };
  proto.isAdvancedCdromFeaturesEnabled = function (
    this: any,
    ...args: Parameters<OverviewSettingsBridgeComponent['isAdvancedCdromFeaturesEnabled']>
  ): ReturnType<OverviewSettingsBridgeComponent['isAdvancedCdromFeaturesEnabled']> {
    return this._settings.isAdvancedCdromFeaturesEnabled(...args);
  };
  proto.disableAdvancedCdromFeatures = function (
    this: any,
    ...args: Parameters<OverviewSettingsBridgeComponent['disableAdvancedCdromFeatures']>
  ): ReturnType<OverviewSettingsBridgeComponent['disableAdvancedCdromFeatures']> {
    return this._settings.disableAdvancedCdromFeatures(...args);
  };
  proto.isWelcomeModalContentVisible = function (
    this: any,
    ...args: Parameters<OverviewSettingsBridgeComponent['isWelcomeModalContentVisible']>
  ): ReturnType<OverviewSettingsBridgeComponent['isWelcomeModalContentVisible']> {
    return this._settings.isWelcomeModalContentVisible(...args);
  };
  proto.verifyWelcomeModalCreateFlow = function (
    this: any,
    ...args: Parameters<OverviewSettingsBridgeComponent['verifyWelcomeModalCreateFlow']>
  ): ReturnType<OverviewSettingsBridgeComponent['verifyWelcomeModalCreateFlow']> {
    return this._settings.verifyWelcomeModalCreateFlow(...args);
  };
  proto.dismissWelcomeModalCheckbox = function (
    this: any,
    ...args: Parameters<OverviewSettingsBridgeComponent['dismissWelcomeModalCheckbox']>
  ): ReturnType<OverviewSettingsBridgeComponent['dismissWelcomeModalCheckbox']> {
    return this._settings.dismissWelcomeModalCheckbox(...args);
  };
  proto.ensureWelcomeModalDismissed = function (
    this: any,
    ...args: Parameters<OverviewSettingsBridgeComponent['ensureWelcomeModalDismissed']>
  ): ReturnType<OverviewSettingsBridgeComponent['ensureWelcomeModalDismissed']> {
    return this._settings.ensureWelcomeModalDismissed(...args);
  };
  proto.isWelcomeModalFlashing = function (
    this: any,
    ...args: Parameters<OverviewSettingsBridgeComponent['isWelcomeModalFlashing']>
  ): ReturnType<OverviewSettingsBridgeComponent['isWelcomeModalFlashing']> {
    return this._settings.isWelcomeModalFlashing(...args);
  };
}
