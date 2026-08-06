import { TFunction } from 'i18next';

import { V1beta1VirtualMachineSnapshot } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { KubevirtFilter } from '@kubevirt-utils/hooks/useKubevirtDataViewFilters/types';

import { getStatusPhase } from '@kubevirt-utils/resources/shared';
import { snapshotStatuses } from './consts';

const STATUS_PHASE_FILTER_ID = 'status-phase';

export const getSnapshotFilters = (
  t: TFunction,
): KubevirtFilter<V1beta1VirtualMachineSnapshot>[] => [
  {
    categoryLabel: t('Status'),
    id: STATUS_PHASE_FILTER_ID,
    match: (obj, selected) => selected.includes(getStatusPhase(obj)),
    options: [
      { label: t('Failed'), value: snapshotStatuses.Failed },
      { label: t('InProgress'), value: snapshotStatuses.InProgress },
      { label: t('Succeeded'), value: snapshotStatuses.Succeeded },
    ],
  },
];
