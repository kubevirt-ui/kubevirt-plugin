import { useEffect, useMemo, useState } from 'react';

import { useK8sWatchResources } from '@openshift-console/dynamic-plugin-sdk';

import { K8sResourceKind } from '../../../../../clusteroverview/utils/types';
import { JobKind } from '../../../../utils/hooks/useBuildsConfigWatcher/utils/types';
import { getJobsForCronJob } from '../../../../utils/hooks/useBuildsConfigWatcher/utils/utils';

const useJobsForCronJobWatcher = (
  cronJob: K8sResourceKind,
): { loaded: boolean; loadError: string; jobs: JobKind[] } => {
  const { namespace, uid } = cronJob.metadata;
  const [loaded, setLoaded] = useState<boolean>(false);
  const [loadError, setLoadError] = useState<string>('');
  const [jobs, setJobs] = useState<JobKind[]>([]);
  const watchedResources = useMemo(
    () => ({
      jobs: {
        isList: true,
        kind: 'Job',
        namespace,
      },
    }),
    [namespace],
  );
  const resources = useK8sWatchResources(watchedResources);

  useEffect(() => {
    const errorKey = Object.keys(resources).find((key) => resources[key].loadError);
    if (errorKey) {
      setLoadError(resources[errorKey].loadError);
      return;
    }
    setLoadError('');
    if (
      Object.keys(resources).length > 0 &&
      Object.keys(resources).every((key) => resources[key].loaded)
    ) {
      const resourceJobs = getJobsForCronJob(uid, resources);
      setJobs(resourceJobs);
      setLoaded(true);
    }
  }, [uid, resources]);

  return { loaded, loadError, jobs };
};

export default useJobsForCronJobWatcher;
