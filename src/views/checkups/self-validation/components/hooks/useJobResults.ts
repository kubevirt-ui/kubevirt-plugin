import { useEffect, useState } from 'react';

import { ConfigMapModel } from '@kubevirt-ui-ext/kubevirt-api/console';
import {
  IoK8sApiBatchV1Job,
  IoK8sApiCoreV1ConfigMap,
} from '@kubevirt-ui-ext/kubevirt-api/kubernetes';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { kubevirtConsole } from '@kubevirt-utils/utils/utils';
import { kubevirtK8sGet } from '@multicluster/k8sRequests';

import { CONFIGMAP_NAME, getJobContainers } from '../../../utils/utils';
import { JobResults, parseResults } from '../../utils';

type UseJobResultsProps = {
  cluster: string;
  job: IoK8sApiBatchV1Job | null;
  namespace: string;
};

type UseJobResultsResult = {
  error: null | string;
  isLoading: boolean;
  results: JobResults | null;
};

const determineResultsConfigMapName = (job: IoK8sApiBatchV1Job): string => {
  const configMapName = job.metadata?.name;

  const jobSpec = getJobContainers(job)?.[0];
  if (jobSpec?.env) {
    const configMapEnv = jobSpec.env.find((env) => env.name === CONFIGMAP_NAME);
    if (configMapEnv?.value) {
      return configMapEnv.value;
    }
  }

  if (!configMapName) {
    throw new Error('Could not determine ConfigMap name from job');
  }

  return configMapName;
};

const readResultsConfigMap = async (
  configMapName: string,
  namespace: string,
  cluster: string,
): Promise<IoK8sApiCoreV1ConfigMap> => {
  try {
    const configMap = await kubevirtK8sGet<IoK8sApiCoreV1ConfigMap>({
      cluster,
      model: ConfigMapModel,
      name: configMapName,
      ns: namespace,
    });

    return configMap;
  } catch (error) {
    kubevirtConsole.warn('Could not read ConfigMap:', error);
    throw new Error(
      `Failed to read results from ConfigMap ${configMapName}: ${
        error instanceof Error ? error.message : 'Unknown error'
      }`,
    );
  }
};

export const useJobResults = ({
  cluster,
  job,
  namespace,
}: UseJobResultsProps): UseJobResultsResult => {
  const { t } = useKubevirtTranslation();
  const [results, setResults] = useState<JobResults | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<null | string>(null);

  useEffect(() => {
    if (!job || job.status?.succeeded !== 1) {
      setResults(null);
      setError(null);
      return;
    }

    let canceled = false;

    const fetchResults = async () => {
      if (canceled) return;
      setIsLoading(true);
      setError(null);

      try {
        const configMapName = determineResultsConfigMapName(job);
        const resultsConfigMap = await readResultsConfigMap(configMapName, namespace, cluster);

        if (canceled) return;

        const parsedResults = parseResults(resultsConfigMap);

        if (parsedResults) {
          const detailedResults = {
            tests: parsedResults,
            timestamps: {
              completionTimestamp: resultsConfigMap.data?.['status.completionTimestamp'],
              startTimestamp: resultsConfigMap.data?.['status.startTimestamp'],
            },
          };
          if (!canceled) {
            setResults(detailedResults);
          }
        } else {
          if (canceled) return;
          const errorMessage = t('No valid results found in ConfigMap');
          kubevirtConsole.error('Error reading job results:', errorMessage);
          setError(errorMessage);
          setResults(null);
        }
      } catch (err) {
        if (canceled) return;
        const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
        kubevirtConsole.error('Error reading job results:', errorMessage);
        setError(errorMessage);
        setResults(null);
      } finally {
        if (!canceled) {
          setIsLoading(false);
        }
      }
    };

    fetchResults();

    return () => {
      canceled = true;
    };
  }, [job, namespace, cluster, t]);

  return { error, isLoading, results };
};

export default useJobResults;
