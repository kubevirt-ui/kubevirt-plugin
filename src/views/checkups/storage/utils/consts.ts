export const STORAGE_CHECKUP_SA = 'storage-checkup-sa';
export const STORAGE_CHECKUP_ROLE = 'storage-checkup-role';
export const KUBEVIRT_STORAGE_LABEL_VALUE = 'kubevirt-vm-storage';
export const STORAGE_CLUSTER_ROLE_BINDING = 'kubevirt-storage-checkup-clustereader';
export const STORAGE_CHECKUP_TIMEOUT = 'spec.timeout';
export const STORAGE_CHECKUP_DEFAULT_STORAGE_CLASS = 'status.result.defaultStorageClass';
export const STORAGE_CHECKUP_LIVE_MIGRATION = 'status.result.vmLiveMigration';
export const STORAGE_CHECKUPS_GOLDEN_IMAGE_NOT_UP_TO_DATE = 'status.result.goldenImagesNotUpToDate';
export const STORAGE_CHECKUPS_GOLDEN_IMAGE_NO_DATA_SOURCE =
  'status.result.goldenImagesNoDataSource';
export const STORAGE_CHECKUPS_WITH_SMART_CLONE = 'status.result.storageProfilesWithSmartClone';
export const STORAGE_CHECKUPS_PVC_BOUND = 'status.result.pvcBound';
export const STORAGE_CHECKUPS_MISSING_VOLUME_SNAP_SHOT =
  'status.result.storageProfileMissingVolumeSnapshotClass';
export const STORAGE_CHECKUPS_WITH_CLAIM_PROPERTY_SETS =
  'status.result.storageProfilesWithSpecClaimPropertySets';
export const STORAGE_CHECKUPS_WITH_EMPTY_CLAIM_PROPERTY_SETS =
  'status.result.storageProfilesWithEmptyClaimPropertySets';
export const STORAGE_CHECKUPS_STORAGE_WITH_RWX = 'status.result.storageProfilesWithRWX';
export const STORAGE_CHECKUPS_BOOT_GOLDEN_IMAGE = 'status.result.vmBootFromGoldenImage';
export const STORAGE_CHECKUPS_VM_HOT_PLUG_VOLUME = 'status.result.vmHotplugVolume';
export const STORAGE_CHECKUPS_VM_VOLUME_CLONE = 'status.result.vmVolumeClone';
export const STORAGE_CHECKUPS_WITH_NON_RBD_STORAGE_CLASS =
  'status.result.vmsWithNonVirtRbdStorageClass';
export const STORAGE_CHECKUPS_UNSET_EFS_STORAGE_CLASS = 'status.result.vmsWithUnsetEfsStorageClass';

export const STORAGE_CHECKUP_PARAM_STORAGE_CLASS = 'spec.param.storageClass';
export const STORAGE_CHECKUP_PARAM_VMI_TIMEOUT = 'spec.param.vmiTimeout';
export const STORAGE_CHECKUP_PARAM_NUM_OF_VMS = 'spec.param.numOfVMs';
export const STORAGE_CHECKUP_PARAM_SKIP_TEARDOWN = 'spec.param.skipTeardown';
