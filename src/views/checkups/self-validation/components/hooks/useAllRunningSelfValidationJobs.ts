import { useMemo } from 'react';

import { IoK8sApiBatchV1Job } from '@kubevirt-ui/kubevirt-api/kubernetes';
import useKubevirtWatchResource from '@kubevirt-utils/hooks/useKubevirtWatchResource/useKubevirtWatchResource';
import useClusterParam from '@multicluster/hooks/useClusterParam';
import { Operator } from '@openshift-console/dynamic-plugin-sdk';

import { createJobWatchConfig } from '../../../utils/utils';
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
  const cluster = useClusterParam();

  const jobWatchConfig = useMemo(
    () =>
      createJobWatchConfig(SELF_VALIDATION_LABEL_VALUE, undefined, cluster, [
        {
          key: SELF_VALIDATION_RESULTS_ONLY_LABEL,
          operator: Operator.DoesNotExist,
        },
      ]),
    [cluster],
  );

  const [jobs, loaded, error] = useKubevirtWatchResource<IoK8sApiBatchV1Job[]>(jobWatchConfig);

  const runningJobs = useMemo(() => {
    if (!jobs || !Array.isArray(jobs)) {
      return [];
    }
    return jobs.filter(isJobRunning);
  }, [jobs]);

  return [runningJobs, loaded, error];
};
