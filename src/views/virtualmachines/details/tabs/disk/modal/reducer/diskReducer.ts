import { diskReducerActions } from './actions';
import { DiskFormState } from './initialState';

export const diskReducer = (state: DiskFormState, action): DiskFormState => {
  switch (action.type) {
    case diskReducerActions.SET_DISK_MAME:
      return { ...state, diskName: action.payload };
    case diskReducerActions.SET_DISK_SOURCE:
      return { ...state, diskSource: action.payload };
    case diskReducerActions.SET_DISK_SIZE:
      return { ...state, diskSize: action.payload };
    case diskReducerActions.SET_DISK_TYPE:
      return { ...state, diskType: action.payload };
    case diskReducerActions.SET_DETACH_HOTPLUG:
      return { ...state, detachHotplug: action.payload };
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
    default:
      return state;
  }
};
