import type { OverviewVirtualizationFeaturesComponent } from '@/components/overview/overview-dashboard-components';

/* eslint-disable @typescript-eslint/no-explicit-any */
export function applyOverviewVirtualizationFeaturesDelegations(proto: any): void {
  proto.navigateToVirtualizationFeatures = function (
    this: any,
    ...args: Parameters<OverviewVirtualizationFeaturesComponent['navigateToVirtualizationFeatures']>
  ): ReturnType<OverviewVirtualizationFeaturesComponent['navigateToVirtualizationFeatures']> {
    return this.virtualizationFeatures.navigateToVirtualizationFeatures(...args);
  };
  proto.navigateToResourceManagement = function (
    this: any,
    ...args: Parameters<OverviewVirtualizationFeaturesComponent['navigateToResourceManagement']>
  ): ReturnType<OverviewVirtualizationFeaturesComponent['navigateToResourceManagement']> {
    return this.virtualizationFeatures.navigateToResourceManagement(...args);
  };
  proto.verifyVirtualizationFeatures = function (
    this: any,
    ...args: Parameters<OverviewVirtualizationFeaturesComponent['verifyVirtualizationFeatures']>
  ): ReturnType<OverviewVirtualizationFeaturesComponent['verifyVirtualizationFeatures']> {
    return this.virtualizationFeatures.verifyVirtualizationFeatures(...args);
  };
  proto.testLoadBalanceFeature = function (
    this: any,
    ...args: Parameters<OverviewVirtualizationFeaturesComponent['testLoadBalanceFeature']>
  ): ReturnType<OverviewVirtualizationFeaturesComponent['testLoadBalanceFeature']> {
    return this.virtualizationFeatures.testLoadBalanceFeature(...args);
  };
  proto.openConfigureFeaturesWizard = function (
    this: any,
    ...args: Parameters<OverviewVirtualizationFeaturesComponent['openConfigureFeaturesWizard']>
  ): ReturnType<OverviewVirtualizationFeaturesComponent['openConfigureFeaturesWizard']> {
    return this.virtualizationFeatures.openConfigureFeaturesWizard(...args);
  };
  proto.verifyConfigurationWizard = function (
    this: any,
    ...args: Parameters<OverviewVirtualizationFeaturesComponent['verifyConfigurationWizard']>
  ): ReturnType<OverviewVirtualizationFeaturesComponent['verifyConfigurationWizard']> {
    return this.virtualizationFeatures.verifyConfigurationWizard(...args);
  };
  proto.navigateToWizardSummaryStep = function (
    this: any,
    ...args: Parameters<OverviewVirtualizationFeaturesComponent['navigateToWizardSummaryStep']>
  ): ReturnType<OverviewVirtualizationFeaturesComponent['navigateToWizardSummaryStep']> {
    return this.virtualizationFeatures.navigateToWizardSummaryStep(...args);
  };
  proto.clickHighAvailabilitySummarySectionToggle = function (
    this: any,
    ...args: Parameters<
      OverviewVirtualizationFeaturesComponent['clickHighAvailabilitySummarySectionToggle']
    >
  ): ReturnType<
    OverviewVirtualizationFeaturesComponent['clickHighAvailabilitySummarySectionToggle']
  > {
    return this.virtualizationFeatures.clickHighAvailabilitySummarySectionToggle(...args);
  };
  proto.verifyFeatureSummaryItemsContainExpectedTexts = function (
    this: any,
    ...args: Parameters<
      OverviewVirtualizationFeaturesComponent['verifyFeatureSummaryItemsContainExpectedTexts']
    >
  ): ReturnType<
    OverviewVirtualizationFeaturesComponent['verifyFeatureSummaryItemsContainExpectedTexts']
  > {
    return this.virtualizationFeatures.verifyFeatureSummaryItemsContainExpectedTexts(...args);
  };
  proto.verifyFeatureSummaryContainsClusterObservabilityInstalled = function (
    this: any,
    ...args: Parameters<
      OverviewVirtualizationFeaturesComponent['verifyFeatureSummaryContainsClusterObservabilityInstalled']
    >
  ): ReturnType<
    OverviewVirtualizationFeaturesComponent['verifyFeatureSummaryContainsClusterObservabilityInstalled']
  > {
    return this.virtualizationFeatures.verifyFeatureSummaryContainsClusterObservabilityInstalled(
      ...args,
    );
  };
  proto.finishWizardAndVerifyClosed = function (
    this: any,
    ...args: Parameters<OverviewVirtualizationFeaturesComponent['finishWizardAndVerifyClosed']>
  ): ReturnType<OverviewVirtualizationFeaturesComponent['finishWizardAndVerifyClosed']> {
    return this.virtualizationFeatures.finishWizardAndVerifyClosed(...args);
  };
  proto.navigateWizardStepsAndVerifySummary = function (
    this: any,
    ...args: Parameters<
      OverviewVirtualizationFeaturesComponent['navigateWizardStepsAndVerifySummary']
    >
  ): ReturnType<OverviewVirtualizationFeaturesComponent['navigateWizardStepsAndVerifySummary']> {
    return this.virtualizationFeatures.navigateWizardStepsAndVerifySummary(...args);
  };
  proto.enableWizardFeatureByLabel = function (
    this: any,
    ...args: Parameters<OverviewVirtualizationFeaturesComponent['enableWizardFeatureByLabel']>
  ): ReturnType<OverviewVirtualizationFeaturesComponent['enableWizardFeatureByLabel']> {
    return this.virtualizationFeatures.enableWizardFeatureByLabel(...args);
  };
  proto.enableVirtualizationOptimizedAndCooLoggingMonitoring = function (
    this: any,
    ...args: Parameters<
      OverviewVirtualizationFeaturesComponent['enableVirtualizationOptimizedAndCooLoggingMonitoring']
    >
  ): ReturnType<
    OverviewVirtualizationFeaturesComponent['enableVirtualizationOptimizedAndCooLoggingMonitoring']
  > {
    return this.virtualizationFeatures.enableVirtualizationOptimizedAndCooLoggingMonitoring(
      ...args,
    );
  };
  proto.enableClusterObservabilityInWizard = function (
    this: any,
    ...args: Parameters<
      OverviewVirtualizationFeaturesComponent['enableClusterObservabilityInWizard']
    >
  ): ReturnType<OverviewVirtualizationFeaturesComponent['enableClusterObservabilityInWizard']> {
    return this.virtualizationFeatures.enableClusterObservabilityInWizard(...args);
  };
  proto.clickVirtualizationFeaturesWizardSubmit = function (
    this: any,
    ...args: Parameters<
      OverviewVirtualizationFeaturesComponent['clickVirtualizationFeaturesWizardSubmit']
    >
  ): ReturnType<
    OverviewVirtualizationFeaturesComponent['clickVirtualizationFeaturesWizardSubmit']
  > {
    return this.virtualizationFeatures.clickVirtualizationFeaturesWizardSubmit(...args);
  };
  proto.verifyClusterObservabilityEnabled = function (
    this: any,
    ...args: Parameters<
      OverviewVirtualizationFeaturesComponent['verifyClusterObservabilityEnabled']
    >
  ): ReturnType<OverviewVirtualizationFeaturesComponent['verifyClusterObservabilityEnabled']> {
    return this.virtualizationFeatures.verifyClusterObservabilityEnabled(...args);
  };
  proto.enableKSM = function (
    this: any,
    ...args: Parameters<OverviewVirtualizationFeaturesComponent['enableKSM']>
  ): ReturnType<OverviewVirtualizationFeaturesComponent['enableKSM']> {
    return this.virtualizationFeatures.enableKSM(...args);
  };
  proto.verifyKSMEnabled = function (
    this: any,
    ...args: Parameters<OverviewVirtualizationFeaturesComponent['verifyKSMEnabled']>
  ): ReturnType<OverviewVirtualizationFeaturesComponent['verifyKSMEnabled']> {
    return this.virtualizationFeatures.verifyKSMEnabled(...args);
  };
  proto.isKsmControlVisible = function (
    this: any,
    ...args: Parameters<OverviewVirtualizationFeaturesComponent['isKsmControlVisible']>
  ): ReturnType<OverviewVirtualizationFeaturesComponent['isKsmControlVisible']> {
    return this.virtualizationFeatures.isKsmControlVisible(...args);
  };
  proto.isAaqEnabled = function (
    this: any,
    ...args: Parameters<OverviewVirtualizationFeaturesComponent['isAaqEnabled']>
  ): ReturnType<OverviewVirtualizationFeaturesComponent['isAaqEnabled']> {
    return this.virtualizationFeatures.isAaqEnabled(...args);
  };
  proto.enableAaq = function (
    this: any,
    ...args: Parameters<OverviewVirtualizationFeaturesComponent['enableAaq']>
  ): ReturnType<OverviewVirtualizationFeaturesComponent['enableAaq']> {
    return this.virtualizationFeatures.enableAaq(...args);
  };
  proto.isAaqControlVisible = function (
    this: any,
    ...args: Parameters<OverviewVirtualizationFeaturesComponent['isAaqControlVisible']>
  ): ReturnType<OverviewVirtualizationFeaturesComponent['isAaqControlVisible']> {
    return this.virtualizationFeatures.isAaqControlVisible(...args);
  };
  proto.isManageQuotasLinkVisible = function (
    this: any,
    ...args: Parameters<OverviewVirtualizationFeaturesComponent['isManageQuotasLinkVisible']>
  ): ReturnType<OverviewVirtualizationFeaturesComponent['isManageQuotasLinkVisible']> {
    return this.virtualizationFeatures.isManageQuotasLinkVisible(...args);
  };
  proto.enablePersistentReservation = function (
    this: any,
    ...args: Parameters<OverviewVirtualizationFeaturesComponent['enablePersistentReservation']>
  ): ReturnType<OverviewVirtualizationFeaturesComponent['enablePersistentReservation']> {
    return this.virtualizationFeatures.enablePersistentReservation(...args);
  };
  proto.verifyPersistentReservationEnabled = function (
    this: any,
    ...args: Parameters<
      OverviewVirtualizationFeaturesComponent['verifyPersistentReservationEnabled']
    >
  ): ReturnType<OverviewVirtualizationFeaturesComponent['verifyPersistentReservationEnabled']> {
    return this.virtualizationFeatures.verifyPersistentReservationEnabled(...args);
  };
  proto.navigateToPermissions = function (
    this: any,
    ...args: Parameters<OverviewVirtualizationFeaturesComponent['navigateToPermissions']>
  ): ReturnType<OverviewVirtualizationFeaturesComponent['navigateToPermissions']> {
    return this.virtualizationFeatures.navigateToPermissions(...args);
  };
  proto.verifyUserPermissions = function (
    this: any,
    ...args: Parameters<OverviewVirtualizationFeaturesComponent['verifyUserPermissions']>
  ): ReturnType<OverviewVirtualizationFeaturesComponent['verifyUserPermissions']> {
    return this.virtualizationFeatures.verifyUserPermissions(...args);
  };
  proto.getClusterSettingsSectionNames = function (
    this: any,
    ...args: Parameters<OverviewVirtualizationFeaturesComponent['getClusterSettingsSectionNames']>
  ): ReturnType<OverviewVirtualizationFeaturesComponent['getClusterSettingsSectionNames']> {
    return this.virtualizationFeatures.getClusterSettingsSectionNames(...args);
  };
  proto.getVirtualizationFeatureItems = function (
    this: any,
    ...args: Parameters<OverviewVirtualizationFeaturesComponent['getVirtualizationFeatureItems']>
  ): ReturnType<OverviewVirtualizationFeaturesComponent['getVirtualizationFeatureItems']> {
    return this.virtualizationFeatures.getVirtualizationFeatureItems(...args);
  };
  proto.isConfigureFeaturesButtonVisible = function (
    this: any,
    ...args: Parameters<OverviewVirtualizationFeaturesComponent['isConfigureFeaturesButtonVisible']>
  ): ReturnType<OverviewVirtualizationFeaturesComponent['isConfigureFeaturesButtonVisible']> {
    return this.virtualizationFeatures.isConfigureFeaturesButtonVisible(...args);
  };
}
