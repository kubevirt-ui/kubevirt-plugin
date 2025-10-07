export const CLUSTER_TAB_IDS = {
  automaticImagesDownload: 'automatic-images-download',
  bootableVolumesProject: 'bootable-volumes-project',
  generalSettings: 'general-settings',
  guestManagement: 'guest-management',
  liveMigration: 'live-migration',
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
  gettingStarted: 'getting-started',
  permissions: 'permissions',
  sshKeys: 'ssh-keys',
};

export const PREVIEW_FEATURES_TAB_IDS = {
  previewFeatures: 'preview-features',
};

export const SEARCH_ITEM_CHILDREN_TREE = {
  [CLUSTER_TAB_IDS.generalSettings]: [
    CLUSTER_TAB_IDS.liveMigration,
    CLUSTER_TAB_IDS.memoryDensity,
    CLUSTER_TAB_IDS.sshConfiguration,
    CLUSTER_TAB_IDS.templatesManagement,
    CLUSTER_TAB_IDS.vmActionsConfirmation,
  ],
  [CLUSTER_TAB_IDS.templatesManagement]: [
    CLUSTER_TAB_IDS.automaticImagesDownload,
    CLUSTER_TAB_IDS.bootableVolumesProject,
    CLUSTER_TAB_IDS.templatesProject,
  ],
};
