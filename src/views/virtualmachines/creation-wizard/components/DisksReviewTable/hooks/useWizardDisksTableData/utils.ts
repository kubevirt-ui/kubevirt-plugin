import { TFunction } from 'i18next';

import { getName } from '@kubevirt-utils/resources/shared';
import {
  getDataVolumeSourceRef,
  getDataVolumeSourceURL,
} from '@kubevirt-utils/resources/vm/utils/dataVolumeTemplate/selectors';
import {
  getCDRom,
  getContainerDisk,
  getDataVolumeName,
  getEmptyDisk,
  getPVCClaimName,
} from '@kubevirt-utils/resources/vm/utils/disk/selectors';
import { DiskDevice } from '@virtualmachines/creation-wizard/components/DisksReviewTable/hooks/useWizardDisksTableData/utils/types';

export const getSource = (device: DiskDevice, t: TFunction): string => {
  if (getDataVolumeSourceRef(device?.dataVolumeTemplate)) {
    return t('PVC (auto import)');
  }
  if (getDataVolumeSourceURL(device?.dataVolumeTemplate)) {
    return t('URL');
  }
  if (getContainerDisk(device?.volume)) {
    return t('Container (Ephemeral)');
  }
  if (getPVCClaimName(device?.volume)) {
    return getPVCClaimName(device.volume);
  }
  if (getDataVolumeName(device?.volume)) {
    return getDataVolumeName(device.volume);
  }
  if (getEmptyDisk(device?.volume) && getCDRom(device?.disk)) {
    return t('Empty');
  }

  const sourceName = getName(device?.pvc) || t('Other');
  return sourceName;
};
