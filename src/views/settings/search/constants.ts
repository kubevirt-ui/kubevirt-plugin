export const CLUSTER_TAB_IDS = {
  advancedCDROMFeatures: 'advanced-cdrom-features',
  automaticImagesDownload: 'automatic-images-download',
  automaticSubscriptionRhel: 'automatic-subscription-rhel',
  bootableVolumesProject: 'bootable-volumes-project',
  generalSettings: 'general-settings',
  guestManagement: 'guest-management',
  hideYamlTab: 'hide-yaml-tab',
  liveMigration: 'live-migration',
  loadBalance: 'load-balance',
  memoryDensity: 'memory-density',
  persistentReservation: 'persistent-reservation',
  resourceManagement: 'resource-management',
  sshConfiguration: 'ssh-configuration',
  templatesManagement: 'templates-management',
  templatesProject: 'templates-project',
  virtualizationFeatures: 'virtualization-features',
  vmActionsConfirmation: 'vm-actions-confirmation',
};

export const USER_TAB_IDS = {
  autoHideNav: 'auto-hide-nav',
  general: 'general',
  gettingStarted: 'getting-started',
  guidedTour: 'guided-tour',
  permissions: 'permissions',
  sshKeys: 'ssh-keys',
  welcomeInformation: 'welcome-information',
};

export const RECOMMENDED_TAB_IDS = {
  recommendedCapabilities: 'recommended-capabilities',
};

export const PREVIEW_FEATURES_TAB_IDS = {
  passtUDNNetwork: 'passt-udn-network',
  previewFeatures: 'preview-features',
  treeViewFolders: 'tree-view-folders',
  vmTemplates: 'vm-templates',
  vsockEnabled: 'vsock-enabled',
};

export const SEARCH_ITEM_CHILDREN_TREE = {
  [CLUSTER_TAB_IDS.generalSettings]: [
    CLUSTER_TAB_IDS.liveMigration,
    CLUSTER_TAB_IDS.memoryDensity,
    CLUSTER_TAB_IDS.sshConfiguration,
    CLUSTER_TAB_IDS.templatesManagement,
    CLUSTER_TAB_IDS.vmActionsConfirmation,
    CLUSTER_TAB_IDS.hideYamlTab,
    CLUSTER_TAB_IDS.advancedCDROMFeatures,
  ],
  [CLUSTER_TAB_IDS.guestManagement]: [CLUSTER_TAB_IDS.automaticSubscriptionRhel],
  [CLUSTER_TAB_IDS.templatesManagement]: [
    CLUSTER_TAB_IDS.automaticImagesDownload,
    CLUSTER_TAB_IDS.bootableVolumesProject,
    CLUSTER_TAB_IDS.templatesProject,
  ],
  [CLUSTER_TAB_IDS.virtualizationFeatures]: [CLUSTER_TAB_IDS.loadBalance],
  [PREVIEW_FEATURES_TAB_IDS.previewFeatures]: [
    PREVIEW_FEATURES_TAB_IDS.treeViewFolders,
    PREVIEW_FEATURES_TAB_IDS.passtUDNNetwork,
    PREVIEW_FEATURES_TAB_IDS.vmTemplates,
    PREVIEW_FEATURES_TAB_IDS.vsockEnabled,
  ],
  [USER_TAB_IDS.general]: [USER_TAB_IDS.autoHideNav],
  [USER_TAB_IDS.gettingStarted]: [USER_TAB_IDS.welcomeInformation, USER_TAB_IDS.guidedTour],
};
