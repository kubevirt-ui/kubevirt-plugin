import produce from 'immer';

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
import { getName, getNamespace } from '@kubevirt-utils/resources/shared';
import { getDataVolumeName } from '@kubevirt-utils/resources/vm/utils/disk/selectors';
import { generateUploadDiskName } from '@kubevirt-utils/utils/utils';

/**
 * Aligns mount upload volume with Add CD-ROM upload so Storage tab watches resolve the source.
 * Running hot-pluggable VMs use a dataVolume ref; stopped VMs use a PVC claim on the upload DV name.
 */
export const produceMountUploadVolumeState = (
  diskState: V1DiskFormState,
  cdromName: string,
  isHotPluggable: boolean,
  isVMRunning: boolean,
): V1DiskFormState =>
  produce(diskState, (draft) => {
    const dvName = getName(draft.dataVolumeTemplate) ?? getDataVolumeName(draft.volume);

    if (!dvName) {
      return;
    }

    if (isVMRunning && isHotPluggable) {
      draft.volume = {
        dataVolume: {
          hotpluggable: true,
          name: dvName,
        },
        name: cdromName,
      };
      delete draft.dataVolumeTemplate;
      return;
    }

    draft.volume = {
      name: cdromName,
      persistentVolumeClaim: {
        claimName: dvName,
        ...(isHotPluggable && { hotpluggable: true }),
      },
    };
    delete draft.dataVolumeTemplate;
  });

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
