import { useMemo } from 'react';

import { JobModel, modelToGroupVersionKind } from '@kubevirt-ui/kubevirt-api/console';
import { IoK8sApiBatchV1Job } from '@kubevirt-ui/kubevirt-api/kubernetes';
import useK8sWatchData from '@multicluster/hooks/useK8sWatchData';

import { getOverallProgress } from '../utils/progressTracker';
import type { OverallProgress } from '../utils/types';

type UseProgressTrackingProps = {
  enabled: boolean;
  job: IoK8sApiBatchV1Job;
  namespace: string;
};

type UseProgressTrackingResult = {
  error: null | string;
  loading: boolean;
  progress: null | OverallProgress;
};

/**
 * Hook to track real-time progress of test suites using watch instead of polling
 */
export const useProgressTracking = ({
  enabled,
  job,
  namespace,
}: UseProgressTrackingProps): UseProgressTrackingResult => {
  // Watch the Job resource for updates

  const jobName = job?.metadata?.name;
  const jobWatchResource = useMemo(
    () =>
      enabled && jobName
        ? {
            groupVersionKind: modelToGroupVersionKind(JobModel),
            isList: false,
            name: jobName,
            namespace,
          }
        : null,
    [enabled, jobName, namespace],
  );

  // Only watch when resource is valid - useK8sWatchData handles null by returning [undefined, true, undefined]
  const [watchedJob, jobLoaded, jobError] = useK8sWatchData<IoK8sApiBatchV1Job>(jobWatchResource);

  // Calculate progress whenever job updates
  const progress = useMemo(() => {
    if (!enabled || !jobLoaded) {
      return null;
    }

    if (jobError) {
      return null;
    }

    return getOverallProgress(watchedJob || job);
  }, [enabled, jobLoaded, jobError, watchedJob, job]);

  return {
    error: jobError ? 'Failed to watch job resource' : null,
    loading: !jobLoaded,
    progress,
  };
};

export default useProgressTracking;
