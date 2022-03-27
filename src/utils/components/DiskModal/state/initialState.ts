import { diskTypes } from '@kubevirt-utils/resources/vm/utils/disk/constants';

import { interfaceTypes, sourceTypes } from '../DiskFormFields/utils/constants';

export type DiskFormState = {
  diskName: string;
  diskSource: string;
  diskSize: string;
  diskType: string;
  detachHotplug: boolean;
  diskInterface: string;
  storageClass: string;
  applyStorageProfileSettings: boolean;
  storageProfileSettingsCheckboxDisabled: boolean;
  accessMode: string;
  volumeMode: string;
  storageClassProvisioner: string;
  enablePreallocation: boolean;
};

export const initialStateDiskForm: DiskFormState = {
  diskName: null,
  diskSource: sourceTypes.BLANK,
  diskSize: '30Gi',
  diskType: diskTypes.disk,
  detachHotplug: false,
  diskInterface: interfaceTypes.VIRTIO,
  storageClass: null,
  applyStorageProfileSettings: true,
  storageProfileSettingsCheckboxDisabled: true,
  accessMode: null,
  volumeMode: null,
  storageClassProvisioner: null,
  enablePreallocation: false,
};

export type DiskSourceState = {
  urlSource: string;
  pvcSourceName: string;
  pvcCloneSourceName: string;
  pvcCloneSourceNamespace: string;
  registrySource: string;
  ephemeralSource: string;
};

export const initialStateDiskSource: DiskSourceState = {
  urlSource: null,
  pvcSourceName: null,
  pvcCloneSourceName: null,
  pvcCloneSourceNamespace: null,
  registrySource: null,
  ephemeralSource: null,
};
