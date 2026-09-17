import type { V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import {
  DEFAULT_CDROM_DISK_SIZE,
  UPLOAD_MODE_SELECT,
  UPLOAD_MODE_UPLOAD,
  UPLOAD_SUFFIX,
} from '@kubevirt-utils/components/DiskModal/utils/constants';
import {
  InterfaceTypes,
  type V1DiskFormState,
} from '@kubevirt-utils/components/DiskModal/utils/types';
import { getNamespace } from '@kubevirt-utils/resources/shared';
import { generateUploadDiskName } from '@kubevirt-utils/utils/utils';

export const buildDiskState = (
  uploadMode: string,
  selectedISO: string,
  uploadFile: File | null,
  vm: V1VirtualMachine,
  cdromName: string,
  uploadFilename: string,
): null | V1DiskFormState => {
  if (uploadMode === UPLOAD_MODE_UPLOAD && uploadFile) {
    return buildUploadDiskState(vm, cdromName, uploadFile, uploadFilename);
  }

  if (uploadMode === UPLOAD_MODE_SELECT && selectedISO) {
    return buildSelectDiskState(cdromName, selectedISO);
  }

  return null;
};

const buildUploadDiskState = (
  vm: V1VirtualMachine,
  cdromName: string,
  uploadFile: File,
  uploadFilename: string,
): V1DiskFormState => {
  const vmNamespace = getNamespace(vm);
  const uploadDataVolumeName = generateUploadDiskName(cdromName, UPLOAD_SUFFIX);

  return {
    dataVolumeTemplate: {
      metadata: {
        name: uploadDataVolumeName,
        namespace: vmNamespace,
      },
      spec: {
        source: {
          upload: {},
        },
        storage: {
          resources: {
            requests: {
              storage: DEFAULT_CDROM_DISK_SIZE,
            },
          },
        },
      },
    },
    disk: {
      cdrom: { bus: InterfaceTypes.SATA },
      name: cdromName,
    },
    isBootSource: false,
    uploadFile: {
      file: uploadFile,
      filename: uploadFilename,
    },
    volume: {
      dataVolume: {
        name: uploadDataVolumeName,
      },
      name: cdromName,
    },
  };
};

const buildSelectDiskState = (cdromName: string, selectedISO: string): V1DiskFormState => {
  return {
    disk: {
      cdrom: { bus: InterfaceTypes.SATA },
      name: cdromName,
    },
    isBootSource: false,
    volume: {
      name: cdromName,
      persistentVolumeClaim: {
        claimName: selectedISO,
      },
    },
  };
};
