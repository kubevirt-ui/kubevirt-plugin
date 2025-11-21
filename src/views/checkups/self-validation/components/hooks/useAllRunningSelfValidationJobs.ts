import { useMemo } from 'react';

import { JobModel, modelToGroupVersionKind } from '@kubevirt-ui/kubevirt-api/console';
import { IoK8sApiBatchV1Job } from '@kubevirt-ui/kubevirt-api/kubernetes';
import { Operator, useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';

import { KUBEVIRT_VM_LATENCY_LABEL } from '../../../utils/utils';
import {
  SELF_VALIDATION_LABEL_VALUE,
  SELF_VALIDATION_RESULTS_ONLY_LABEL,
} from '../../utils/constants';
import { isJobRunning } from '../../utils/selfValidationJob';

/**
 * Hook that watches all running self-validation jobs across the cluster
 * @returns [jobs, loaded, error] - Array of running job objects, loading state, and error state
 */
export const useAllRunningSelfValidationJobs = (): [
  jobs: IoK8sApiBatchV1Job[],
  loaded: boolean,
  error: Error,
] => {
  const jobWatchConfig = useMemo(
    () => ({
      groupVersionKind: modelToGroupVersionKind(JobModel),
      isList: true,
      selector: {
        matchExpressions: [
          {
            key: SELF_VALIDATION_RESULTS_ONLY_LABEL,
            operator: Operator.DoesNotExist,
          },
        ],
        matchLabels: {
          [KUBEVIRT_VM_LATENCY_LABEL]: SELF_VALIDATION_LABEL_VALUE,
        },
      },
    }),
    [],
  );

  const [jobs, loaded, error] = useK8sWatchResource<IoK8sApiBatchV1Job[]>(jobWatchConfig);

  const runningJobs = useMemo(() => {
    if (!jobs || !Array.isArray(jobs)) {
      return [];
    }
    return jobs.filter(isJobRunning);
  }, [jobs]);

  return [runningJobs, loaded, error];
};
