import produce from 'immer';

import { getName } from '@kubevirt-utils/resources/shared';
import { getDataVolumeName } from '@kubevirt-utils/resources/vm/utils/disk/selectors';

import type { V1DiskFormState } from './types';

export const produceExistingISOData = (
  data: V1DiskFormState,
  selectedISO: string,
  isHotPluggable: boolean,
): V1DiskFormState =>
  produce(data, (draft) => {
    draft.volume.persistentVolumeClaim = {
      claimName: selectedISO,
      ...(isHotPluggable && { hotpluggable: true }),
    };
    delete draft.volume.dataVolume;
    delete draft.dataVolumeTemplate;
  });

export const produceEmptyDriveData = (data: V1DiskFormState): V1DiskFormState =>
  produce(data, (draft) => {
    delete draft.dataVolumeTemplate;
    delete draft.volume;
  });

/**
 * Point the CD-ROM at the upload DataVolume before the file finishes uploading.
 * Running hot-pluggable VMs use a dataVolume ref; other VMs use a PVC claim on the upload DV name.
 */
export const produceCdromUploadVolumeState = (
  diskState: V1DiskFormState,
  diskName: string,
  isHotPluggable: boolean,
  isVMRunning: boolean,
  dataVolumeName?: string,
): V1DiskFormState =>
  produce(diskState, (draft) => {
    const dvName =
      dataVolumeName ?? getName(draft.dataVolumeTemplate) ?? getDataVolumeName(draft.volume);

    if (!dvName) {
      return;
    }

    if (isVMRunning && isHotPluggable) {
      draft.volume = {
        dataVolume: {
          hotpluggable: true,
          name: dvName,
        },
        name: diskName,
      };
      delete draft.dataVolumeTemplate;
      return;
    }

    draft.volume = {
      name: diskName,
      persistentVolumeClaim: {
        claimName: dvName,
        ...(isHotPluggable && { hotpluggable: true }),
      },
    };
    delete draft.dataVolumeTemplate;
  });
