import produce from 'immer';

import { V1DiskFormState } from './types';

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
