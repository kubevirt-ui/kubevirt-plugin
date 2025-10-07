import { uniq } from 'lodash';

import {
  V1beta1StorageSpecAccessModesEnum,
  V1beta1StorageSpecVolumeModeEnum,
} from '@kubevirt-ui/kubevirt-api/kubevirt';
import { t } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { ClaimPropertySets } from '@kubevirt-utils/types/storage';

export const ACCESS_MODE_RADIO_OPTIONS = [
  {
    label: t('Shared access (RWX)'),
    value: V1beta1StorageSpecAccessModesEnum.ReadWriteMany,
  },
  {
    label: t('Single user (RWO)'),
    value: V1beta1StorageSpecAccessModesEnum.ReadWriteOnce,
  },
  {
    label: t('Read only (ROX)'),
    value: V1beta1StorageSpecAccessModesEnum.ReadOnlyMany,
  },
];

export const VOLUME_MODE_RADIO_OPTIONS = [
  {
    label: t('Block'),
    value: V1beta1StorageSpecVolumeModeEnum.Block,
  },
  {
    label: t('Filesystem'),
    value: V1beta1StorageSpecVolumeModeEnum.Filesystem,
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
