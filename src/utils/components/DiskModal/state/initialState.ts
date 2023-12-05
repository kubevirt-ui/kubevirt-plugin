import { diskTypes } from '@kubevirt-utils/resources/vm/utils/disk/constants';

import { interfaceTypes, sourceTypes } from '../DiskFormFields/utils/constants';

export const DEFAULT_DISK_SIZE = '30Gi';
export const DEFAULT_CDROM_DISK_SIZE = '10Gi';

export type DiskFormState = {
  accessMode: string;
  applyStorageProfileSettings: boolean;
  asBootSource: boolean;
  diskInterface: string;
  diskName: string;
  diskSize: string;
  diskSource: string;
  diskType: string;
  enablePreallocation: boolean;
  lunReservation?: boolean;
  sharable?: boolean;
  storageClass: string;
  storageClassProvisioner: string;
  storageProfileSettingsCheckboxDisabled: boolean;
  volumeMode: string;
};

export const initialStateDiskForm: DiskFormState = {
  accessMode: null,
  applyStorageProfileSettings: true,
  asBootSource: false,
  diskInterface: interfaceTypes.VIRTIO,
  diskName: null,
  diskSize: DEFAULT_DISK_SIZE,
  diskSource: sourceTypes.BLANK,
  diskType: diskTypes.disk,
  enablePreallocation: false,
  lunReservation: false,
  sharable: false,
  storageClass: null,
  storageClassProvisioner: null,
  storageProfileSettingsCheckboxDisabled: true,
  volumeMode: null,
};

export type DiskSourceState = {
  dataSourceName: string;
  dataSourceNamespace: string;
  ephemeralSource: string;
  pvcCloneSourceName: string;
  pvcCloneSourceNamespace: string;
  pvcSourceName: string;
  registrySource: string;
  uploadFile: File | string;
  uploadFilename: string;
  urlSource: string;
};

export const initialStateDiskSource: DiskSourceState = {
  dataSourceName: null,
  dataSourceNamespace: null,
  ephemeralSource: null,
  pvcCloneSourceName: null,
  pvcCloneSourceNamespace: null,
  pvcSourceName: null,
  registrySource: null,
  uploadFile: null,
  uploadFilename: null,
  urlSource: null,
};
