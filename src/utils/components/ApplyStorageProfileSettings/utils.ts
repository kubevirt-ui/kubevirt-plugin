/* eslint-disable @typescript-eslint/no-shadow */
import { TFunction } from 'react-i18next';
import uniq from 'lodash/uniq';

import {
  V1beta1StorageSpecAccessModesEnum,
  V1beta1StorageSpecVolumeModeEnum,
} from '@kubevirt-ui/kubevirt-api/kubevirt';
import { t } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { ClaimPropertySets } from '@kubevirt-utils/types/storage';

export const tooltipForOtherRecommended = (priority: number, t: TFunction): string => {
  switch (priority) {
    case 1:
      return t('The 2nd most suggested option in StorageProfile.');
    case 2:
      return t('The 3rd most suggested option in StorageProfile.');
    default:
      return t('The {{priority}}th most suggested option in StorageProfile.', {
        priority: priority + 1,
      });
  }
};

export const fromPriorityToLabels = (
  priority: number,
  recommendationCount: number,
  t: TFunction,
): { className?: string; label: string; tooltip: string } => {
  if (priority === 0) {
    return {
      className: 'pf-m-green',
      label: t('Highly recommended'),
      tooltip: t('The most suggested StorageProfile option.'),
    };
  }

  if (priority > 0 && priority < recommendationCount) {
    return {
      label: t('Recommended'),
      tooltip: tooltipForOtherRecommended(priority, t),
    };
  }

  return {
    className: 'pf-m-gold',
    label: t('Not recommended'),
    tooltip: t('We suggest using another option.'),
  };
};

export const ACCESS_MODE_RADIO_OPTIONS = [
  {
    label: t('Single user (RWO)'),
    value: V1beta1StorageSpecAccessModesEnum.ReadWriteOnce,
  },
  {
    label: t('Shared access (RWX)'),
    value: V1beta1StorageSpecAccessModesEnum.ReadWriteMany,
  },
  {
    label: t('Read only (ROX)'),
    value: V1beta1StorageSpecAccessModesEnum.ReadOnlyMany,
  },
];

export const VOLUME_MODE_RADIO_OPTIONS = [
  {
    label: t('Filesystem'),
    value: V1beta1StorageSpecVolumeModeEnum.Filesystem,
  },
  {
    label: t('Block'),
    value: V1beta1StorageSpecVolumeModeEnum.Block,
  },
];

export const getAccessModesForVolume = (
  claimPropertySets: ClaimPropertySets,
  volumeMode?: string,
) =>
  uniq(
    claimPropertySets
      .filter((it) => it.volumeMode === volumeMode)
      .flatMap((it) => it.accessModes)
      .filter(Boolean)
      .map((mode) => V1beta1StorageSpecAccessModesEnum[mode])
      .filter(Boolean),
  );
