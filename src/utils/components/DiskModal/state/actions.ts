export const diskReducerActions = Object.freeze({
  RESET: 'reset',
  SET_ACCESS_MODE: 'setAccessMode',
  SET_APPLY_STORAGE_PROFILE_SETTINGS: 'setApplyStorageProfileSettings',
  SET_BOOT_SOURCE: 'setBootSource',
  SET_DISK_INTERFACE: 'setDiskInterface',
  SET_DISK_NAME: 'setDiskName',
  SET_DISK_SIZE: 'setDiskSize',
  SET_DISK_SOURCE: 'setDiskSource',
  SET_DISK_TYPE: 'setDiskType',
  SET_ENABLE_PREALLOCATION: 'setEnablePreallocation',
  SET_LUN_RESERVATION: 'setLunReservation',
  SET_SHARABLE: 'setSharable',
  SET_STORAGE_CLASS: 'setStorageClass',
  SET_STORAGE_CLASS_PROVISIONER: 'setStorageClassProvisioner',
  SET_STORAGE_PROFILE_SETTINGS_CHECKBOX_DISABLED: 'setStorageProfileSettingsCheckboxDisabled',
  SET_VOLUME_MODE: 'setVolumeMode',
});

export type DiskReducerActionType = {
  payload?: any; // removing the any causes a TS error in reducers.ts;
  type: string;
};

export const diskSourceReducerActions = Object.freeze({
  RESET: 'reset',
  SET_DATA_SOURCE_NAME: 'setDataSourceName',
  SET_DATA_SOURCE_NAMESPACE: 'setDataSourceNamespace',
  SET_EPHEMERAL_SOURCE: 'setEphemeralSource',
  SET_PVC_CLONE_SOURCE_NAME: 'setPvcCloneSourceName',
  SET_PVC_CLONE_SOURCE_NAMESPACE: 'setPvcCloneSourceNamespace',
  SET_PVC_SOURCE_NAME: 'setPvcSourceName',
  SET_REGISTRY_SOURCE: 'setRegistrySource',
  SET_UPLOAD_PVC_FILE: 'setUploadPvcFile',
  SET_UPLOAD_PVC_FILENAME: 'setUploadPvcFilename',
  SET_URL_SOURCE: 'setUrlSource',
});

export type DiskSourceReducerActionType = {
  file?: File | string;
  payload?: string;
  type: string;
};
