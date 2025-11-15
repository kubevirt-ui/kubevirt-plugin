import { useCallback, useEffect, useState } from 'react';

import { PodModel } from '@kubevirt-ui/kubevirt-api/console';
import { IoK8sApiBatchV1Job, IoK8sApiCoreV1Pod } from '@kubevirt-ui/kubevirt-api/kubernetes';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { kubevirtConsole } from '@kubevirt-utils/utils/utils';
import { k8sGet } from '@openshift-console/dynamic-plugin-sdk';

import { getOverallProgress, OverallProgress } from '../utils/progressTracker';

const PROGRESS_POLLING_INTERVAL_MS = 30000; // 30 seconds

interface UseProgressTrackingProps {
  enabled: boolean;
  job: IoK8sApiBatchV1Job;
  namespace: string;
}

interface UseProgressTrackingResult {
  error: null | string;
  loading: boolean;
  progress: null | OverallProgress;
  refreshProgress: () => Promise<void>;
}

/**
 * Hook to track real-time progress of test suites
 */
export const useProgressTracking = ({
  enabled,
  job,
  namespace,
}: UseProgressTrackingProps): UseProgressTrackingResult => {
  const { t } = useKubevirtTranslation();
  const [progress, setProgress] = useState<null | OverallProgress>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<null | string>(null);
  const [pod, setPod] = useState<IoK8sApiCoreV1Pod | null>(null);

  // Get the pod for this job
  useEffect(() => {
    if (!job?.metadata?.name || !enabled) return;

    const getPod = async () => {
      try {
        // List all pods in the namespace and find the one belonging to this job
        const podList = (await k8sGet({
          model: PodModel,
          ns: namespace,
        })) as { items: IoK8sApiCoreV1Pod[] };

        // Find the pod that belongs to this job
        const jobPod = podList.items.find(
          (p) =>
            p.metadata?.labels?.['job-name'] === job.metadata.name ||
            p.metadata?.name?.startsWith(job.metadata.name),
        );

        if (jobPod) {
          setPod(jobPod);
        } else {
          setError(t('Could not find pod for job'));
        }
      } catch (err) {
        kubevirtConsole.error('Error getting pod:', err);
        setError(t('Could not find pod for job'));
      }
    };

    getPod();
  }, [job?.metadata?.name, namespace, enabled, t]);

  // Refresh progress data
  const refreshProgress = useCallback(async () => {
    if (!pod || !enabled) return;

    setLoading(true);
    setError(null);

    try {
      const progressData = await getOverallProgress(pod, namespace, job?.metadata?.name);
      setProgress(progressData);
    } catch (err) {
      kubevirtConsole.error('Error getting progress data:', err);
      setError(t('Failed to get progress data'));
    } finally {
      setLoading(false);
    }
  }, [pod, enabled, namespace, job?.metadata?.name, t]);

  // Set up polling for progress updates
  useEffect(() => {
    if (!pod || !enabled) return;

    refreshProgress();

    const interval = setInterval(refreshProgress, PROGRESS_POLLING_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [pod, enabled, refreshProgress]);

  return {
    error,
    loading,
    progress,
    refreshProgress,
  };
};

export default useProgressTracking;
