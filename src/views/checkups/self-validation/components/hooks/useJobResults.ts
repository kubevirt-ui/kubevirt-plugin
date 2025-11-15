import { useEffect, useState } from 'react';
import { getJobContainers } from 'src/views/checkups/utils/utils';

import { ConfigMapModel } from '@kubevirt-ui/kubevirt-api/console';
import { IoK8sApiBatchV1Job, IoK8sApiCoreV1ConfigMap } from '@kubevirt-ui/kubevirt-api/kubernetes';
import { kubevirtConsole } from '@kubevirt-utils/utils/utils';
import { k8sGet } from '@openshift-console/dynamic-plugin-sdk';

import { parseResults } from '../../utils';

interface UseJobResultsProps {
  job: IoK8sApiBatchV1Job | null;
  namespace: string;
}

interface UseJobResultsResult {
  error: null | string;
  isLoading: boolean;
  results: { [suiteName: string]: any } | null;
}

const determineResultsConfigMapName = (job: IoK8sApiBatchV1Job): string => {
  const configMapName = job.metadata?.name;

  const jobSpec = getJobContainers(job)?.[0];
  if (jobSpec?.env) {
    const configMapEnv = jobSpec.env.find((env) => env.name === 'CONFIGMAP_NAME');
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
): Promise<IoK8sApiCoreV1ConfigMap> => {
  try {
    const configMap = await k8sGet({
      model: ConfigMapModel,
      name: configMapName,
      ns: namespace,
    });

    return configMap as IoK8sApiCoreV1ConfigMap;
  } catch (error) {
    kubevirtConsole.warn('Could not read ConfigMap:', error);
    throw new Error(
      `Failed to read results from ConfigMap ${configMapName}: ${
        error instanceof Error ? error.message : 'Unknown error'
      }`,
    );
  }
};

export const useJobResults = ({ job, namespace }: UseJobResultsProps): UseJobResultsResult => {
  const [results, setResults] = useState<{ [suiteName: string]: any } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<null | string>(null);

  useEffect(() => {
    if (!job || job.status?.succeeded !== 1) {
      setResults(null);
      setError(null);
      return;
    }

    const fetchResults = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const configMapName = determineResultsConfigMapName(job);
        const resultsConfigMap = await readResultsConfigMap(configMapName, namespace);

        const parsedResults = parseResults(resultsConfigMap);

        if (parsedResults) {
          const resultsWithTimestamps = {
            tests: parsedResults,
            timestamps: {
              completionTimestamp: resultsConfigMap.data?.['status.completionTimestamp'],
              startTimestamp: resultsConfigMap.data?.['status.startTimestamp'],
            },
          };
          setResults(resultsWithTimestamps);
        } else {
          throw new Error('No valid results found in ConfigMap');
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
        kubevirtConsole.error('Error reading job results:', errorMessage);
        setError(errorMessage);
        setResults(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchResults();
  }, [job, namespace]);

  return { error, isLoading, results };
};

export default useJobResults;
