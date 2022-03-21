import { diskTypes } from '@kubevirt-utils/resources/vm/utils/disk/constants';

import { interfaceTypes, sourceTypes } from '../DiskFormFields/utils/constants';
import { generateDiskName } from '../DiskFormFields/utils/helpers';

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
  diskName: generateDiskName(),
  diskSource: sourceTypes.BLANK,
  diskSize: '30Gi',
  diskType: diskTypes.disk,
  detachHotplug: false,
  diskInterface: interfaceTypes.VIRTIO,
  storageClass: undefined as string,
  applyStorageProfileSettings: true,
  storageProfileSettingsCheckboxDisabled: true,
  accessMode: undefined as string,
  volumeMode: undefined as string,
  storageClassProvisioner: undefined as string,
  enablePreallocation: false,
};
