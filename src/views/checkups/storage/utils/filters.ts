import { TFunction } from 'i18next';

import {
  IoK8sApiBatchV1Job,
  IoK8sApiCoreV1ConfigMap,
} from '@kubevirt-ui-ext/kubevirt-api/kubernetes';
import { KubevirtFilter } from '@kubevirt-utils/hooks/useKubevirtDataViewFilters/types';

import { getName } from '@kubevirt-utils/resources/shared';
import { CheckupsStatus, getConfigMapStatus, getJobByName, getJobStatus } from '../../utils/utils';

const STORAGE_STATUS_FILTER_ID = 'status';

const STORAGE_STATUS = {
  running: 'running',
  failed: 'failed',
  succeeded: 'succeeded',
} as const;

const checkupsStatusToFilterValue: Record<CheckupsStatus, string> = {
  [CheckupsStatus.Deleting]: STORAGE_STATUS.running,
  [CheckupsStatus.Done]: STORAGE_STATUS.succeeded,
  [CheckupsStatus.Failed]: STORAGE_STATUS.failed,
  [CheckupsStatus.Pending]: STORAGE_STATUS.running,
  [CheckupsStatus.Running]: STORAGE_STATUS.running,
};

const getFilterStatusValue = (obj: IoK8sApiCoreV1ConfigMap, jobs: IoK8sApiBatchV1Job[]): string => {
  const matchedJobs = getJobByName(jobs, getName(obj) ?? '');
  const job = matchedJobs?.[0];
  const jobStatus = getJobStatus(job);
  const configMapStatus = getConfigMapStatus(obj, jobStatus);

  return checkupsStatusToFilterValue[configMapStatus];
};

export const getFilters = (
  t: TFunction,
  jobs: IoK8sApiBatchV1Job[],
): KubevirtFilter<IoK8sApiCoreV1ConfigMap>[] => [
  {
    categoryLabel: t('Status'),
    id: STORAGE_STATUS_FILTER_ID,
    match: (obj, selected) => selected.includes(getFilterStatusValue(obj, jobs)),
    options: [
      { label: t('Succeeded'), value: STORAGE_STATUS.succeeded },
      { label: t('Failed'), value: STORAGE_STATUS.failed },
      { label: t('Running'), value: STORAGE_STATUS.running },
    ],
  },
];
