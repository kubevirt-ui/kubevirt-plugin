import {
  diskReducerActions,
  DiskReducerActionType,
  diskSourceReducerActions,
  DiskSourceReducerActionType,
} from './actions';
import {
  DiskFormState,
  DiskSourceState,
  initialStateDiskForm,
  initialStateDiskSource,
} from './initialState';

export const diskReducer = (state: DiskFormState, action: DiskReducerActionType): DiskFormState => {
  switch (action.type) {
    case diskReducerActions.SET_DISK_NAME:
      return { ...state, diskName: action.payload };
    case diskReducerActions.SET_DISK_SOURCE:
      return { ...state, diskSource: action.payload };
    case diskReducerActions.SET_DISK_SIZE:
      return { ...state, diskSize: action.payload };
    case diskReducerActions.SET_DISK_TYPE:
      return { ...state, diskType: action.payload };
    case diskReducerActions.SET_DISK_INTERFACE:
      return { ...state, diskInterface: action.payload };
    case diskReducerActions.SET_STORAGE_CLASS:
      return { ...state, storageClass: action.payload };
    case diskReducerActions.SET_APPLY_STORAGE_PROFILE_SETTINGS:
      return { ...state, applyStorageProfileSettings: action.payload };
    case diskReducerActions.SET_STORAGE_PROFILE_SETTINGS_CHECKBOX_DISABLED:
      return { ...state, storageProfileSettingsCheckboxDisabled: action.payload };
    case diskReducerActions.SET_ACCESS_MODE:
      return { ...state, accessMode: action.payload };
    case diskReducerActions.SET_VOLUME_MODE:
      return { ...state, volumeMode: action.payload };
    case diskReducerActions.SET_STORAGE_CLASS_PROVISIONER:
      return { ...state, storageClassProvisioner: action.payload };
    case diskReducerActions.SET_ENABLE_PREALLOCATION:
      return { ...state, enablePreallocation: action.payload };
    case diskReducerActions.SET_BOOT_SOURCE:
      return { ...state, asBootSource: action.payload };
    case diskReducerActions.RESET:
      return initialStateDiskForm;
    default:
      return state;
  }
};

export const diskSourceReducer = (
  state: DiskSourceState,
  action: DiskSourceReducerActionType,
): DiskSourceState => {
  switch (action.type) {
    case diskSourceReducerActions.SET_URL_SOURCE:
      return { ...state, urlSource: action.payload };
    case diskSourceReducerActions.SET_PVC_SOURCE_NAME:
      return { ...state, pvcSourceName: action.payload };
    case diskSourceReducerActions.SET_PVC_CLONE_SOURCE_NAME:
      return { ...state, pvcCloneSourceName: action.payload };
    case diskSourceReducerActions.SET_PVC_CLONE_SOURCE_NAMESPACE:
      return { ...state, pvcCloneSourceNamespace: action.payload };
    case diskSourceReducerActions.SET_REGISTRY_SOURCE:
      return { ...state, registrySource: action.payload };
    case diskSourceReducerActions.SET_EPHEMERAL_SOURCE:
      return { ...state, ephemeralSource: action.payload };
    case diskSourceReducerActions.SET_DATA_SOURCE_NAME:
      return { ...state, dataSourceName: action.payload };
    case diskSourceReducerActions.SET_DATA_SOURCE_NAMESPACE:
      return { ...state, dataSourceNamespace: action.payload };
    case diskSourceReducerActions.RESET:
      return initialStateDiskSource;
    default:
      return state;
  }
};
