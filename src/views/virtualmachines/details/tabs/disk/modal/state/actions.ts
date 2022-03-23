export const diskReducerActions = Object.freeze({
  SET_DISK_NAME: 'setDiskName',
  SET_DISK_SOURCE: 'setDiskSource',
  SET_DISK_SIZE: 'setDiskSize',
  SET_DISK_TYPE: 'setDiskType',
  SET_DETACH_HOTPLUG: 'setDetachHotplug',
  SET_DISK_INTERFACE: 'setDiskInterface',
  SET_STORAGE_CLASS: 'setStorageClass',
  SET_APPLY_STORAGE_PROFILE_SETTINGS: 'setApplyStorageProfileSettings',
  SET_STORAGE_PROFILE_SETTINGS_CHECKBOX_DISABLED: 'setStorageProfileSettingsCheckboxDisabled',
  SET_ACCESS_MODE: 'setAccessMode',
  SET_VOLUME_MODE: 'setVolumeMode',
  SET_STORAGE_CLASS_PROVISIONER: 'setStorageClassProvisioner',
  SET_ENABLE_PREALLOCATION: 'setEnablePreallocation',
  RESET: 'reset',
});

export type DiskReducerActionType = {
  type: string;
  payload?: string | boolean | any; // removing the any causes a TS error in reducers.ts
};

export const diskSourceReducerActions = Object.freeze({
  SET_URL_SOURCE: 'setUrlSource',
  SET_PVC_SOURCE_NAME: 'setPvcSourceName',
  SET_PVC_CLONE_SOURCE_NAME: 'setPvcCloneSourceName',
  SET_PVC_CLONE_SOURCE_NAMESPACE: 'setPvcCloneSourceNamespace',
  SET_REGISTRY_SOURCE: 'setRegistrySource',
  SET_EPHEMERAL_SOURCE: 'setEphemeralSource',
  RESET: 'reset',
});

export type DiskSourceReducerActionType = {
  type: string;
  payload?: string;
};
