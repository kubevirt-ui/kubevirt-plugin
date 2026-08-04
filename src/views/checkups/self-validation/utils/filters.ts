import { TFunction } from 'i18next';

import { IoK8sApiCoreV1ConfigMap } from '@kubevirt-ui-ext/kubevirt-api/kubernetes';
import { KubevirtFilter } from '@kubevirt-utils/hooks/useKubevirtDataViewFilters/types';

import { SELF_VALIDATION_RESULTS_KEY } from './constants';

const SELF_VALIDATION_STATUS_FILTER_ID = 'self-validation-status';

const SELF_VALIDATION_STATUS = {
  completed: 'completed',
  running: 'running',
} as const;

export const getCheckupsSelfValidationListFilters = (
  t: TFunction,
): KubevirtFilter<IoK8sApiCoreV1ConfigMap>[] => [
  {
    categoryLabel: t('Status'),
    id: SELF_VALIDATION_STATUS_FILTER_ID,
    match: (obj, selected) => {
      const status = obj?.data?.[SELF_VALIDATION_RESULTS_KEY]
        ? SELF_VALIDATION_STATUS.completed
        : SELF_VALIDATION_STATUS.running;
      return selected.includes(status);
    },
    options: [
      { label: t('Completed'), value: SELF_VALIDATION_STATUS.completed },
      { label: t('Running'), value: SELF_VALIDATION_STATUS.running },
    ],
  },
];
