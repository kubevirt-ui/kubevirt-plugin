import type { TFunction } from 'i18next';

import { getDiskSize } from '@kubevirt-utils/resources/bootableresources/selectors';
import { getDiskSizeForIsoSelection } from '@virtualmachines/wizard/utils/utils';

import type { BootVolumeSelection } from '../../../../form/types';

export const getIsoCdromHelperText = (t: TFunction): string =>
  t('The selected volume will be attached as a CD-ROM. A blank disk is required for installation.');

export const getSystemDiskSizeHelpText = (t: TFunction): string =>
  t('A blank disk is required for installation.');

export const getIsoCheckboxHelpBody = (
  t: TFunction,
  hasVolume: boolean,
  isIso: boolean,
): string => {
  if (!hasVolume) {
    return t('Select a volume to enable this option.');
  }

  if (isIso) {
    return getIsoCdromHelperText(t);
  }

  return t('The selected volume will be attached as a system disk.');
};

export const getBootVolumeDiskSizeForIsoState = (
  bootVolume: BootVolumeSelection,
  isIso: boolean,
): string =>
  getDiskSizeForIsoSelection(
    isIso,
    getDiskSize(
      bootVolume.dataVolumeSource,
      bootVolume.persistentVolumeClaimSource,
      bootVolume.volumeSnapshotSource,
    ),
  );
