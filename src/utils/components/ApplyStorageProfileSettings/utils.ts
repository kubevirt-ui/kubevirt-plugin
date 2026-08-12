import uniq from 'lodash/uniq';

import {
  V1beta1StorageSpecAccessModesEnum,
  V1beta1StorageSpecVolumeModeEnum,
} from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { t } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { type ClaimPropertySets } from '@kubevirt-utils/types/storage';

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
): V1beta1StorageSpecAccessModesEnum[] =>
  (uniq as <T>(arr: T[]) => T[])(
    claimPropertySets
      .filter((item) => item.volumeMode === volumeMode)
      .flatMap((item) => item.accessModes)
      .filter(Boolean)
      .map((mode) => V1beta1StorageSpecAccessModesEnum[mode])
      .filter((mode): mode is V1beta1StorageSpecAccessModesEnum => Boolean(mode)),
  );
