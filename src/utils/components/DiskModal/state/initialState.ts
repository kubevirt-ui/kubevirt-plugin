import { diskTypes } from '@kubevirt-utils/resources/vm/utils/disk/constants';

import { interfaceTypes, sourceTypes } from '../DiskFormFields/utils/constants';

export const DEFAULT_DISK_SIZE = '30Gi';

export type DiskFormState = {
  diskName: string;
  diskSource: string;
  diskSize: string;
  diskType: string;
  diskInterface: string;
  storageClass: string;
  applyStorageProfileSettings: boolean;
  storageProfileSettingsCheckboxDisabled: boolean;
  accessMode: string;
  volumeMode: string;
  storageClassProvisioner: string;
  enablePreallocation: boolean;
  asBootSource: boolean;
};

export const initialStateDiskForm: DiskFormState = {
  diskName: null,
  diskSource: sourceTypes.BLANK,
  diskSize: DEFAULT_DISK_SIZE,
  diskType: diskTypes.disk,
  diskInterface: interfaceTypes.VIRTIO,
  storageClass: null,
  applyStorageProfileSettings: true,
  storageProfileSettingsCheckboxDisabled: true,
  accessMode: null,
  volumeMode: null,
  storageClassProvisioner: null,
  enablePreallocation: false,
  asBootSource: false,
};

export type DiskSourceState = {
  urlSource: string;
  pvcSourceName: string;
  pvcCloneSourceName: string;
  pvcCloneSourceNamespace: string;
  uploadFile: File | string;
  uploadFilename: string;
  registrySource: string;
  ephemeralSource: string;
  dataSourceName: string;
  dataSourceNamespace: string;
};

export const initialStateDiskSource: DiskSourceState = {
  urlSource: null,
  pvcSourceName: null,
  pvcCloneSourceName: null,
  pvcCloneSourceNamespace: null,
  uploadFile: null,
  uploadFilename: null,
  registrySource: null,
  ephemeralSource: null,
  dataSourceName: null,
  dataSourceNamespace: null,
};
