import type { TFunction } from 'i18next';

import type { V1beta1DataVolume } from '@kubevirt-ui-ext/kubevirt-api/containerized-data-importer';
import type { KubevirtFilter } from '@kubevirt-utils/hooks/useKubevirtDataViewFilters/types';

import { getDataVolumePhase } from '../utils';

const STATUS_FILTER_ID = 'datavolume-status';

const STATUS_OPTIONS = [
  'Succeeded',
  'Failed',
  'ImportInProgress',
  'CloneInProgress',
  'PVCBound',
  'Pending',
  'WaitForFirstConsumer',
  'PendingPopulation',
  'UploadReady',
] as const;

export const getDataVolumeStatusFilter = (t: TFunction): KubevirtFilter<V1beta1DataVolume>[] => [
  {
    categoryLabel: t('Status'),
    id: STATUS_FILTER_ID,
    match: (obj, selected) => {
      const phase = getDataVolumePhase(obj);
      return Boolean(phase && selected.includes(phase));
    },
    options: STATUS_OPTIONS.map((value) => ({ label: value, value })),
  },
];
