import { useEffect, useMemo } from 'react';

import { ConfigMapModel } from '@kubevirt-ui-ext/kubevirt-api/console';
import {
  IoK8sApiBatchV1Job,
  IoK8sApiCoreV1ConfigMap,
} from '@kubevirt-ui-ext/kubevirt-api/kubernetes';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getName, getNamespace } from '@kubevirt-utils/resources/shared';
import { kubevirtConsole } from '@kubevirt-utils/utils/utils';
import useK8sGetData from '@multicluster/hooks/useK8sGetData';

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
  const configMapName = getName(job);

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

export const useJobResults = ({
  cluster,
  job,
  namespace,
}: UseJobResultsProps): UseJobResultsResult => {
  const { t } = useKubevirtTranslation();

  const jobSucceeded = job?.status?.succeeded === 1;

  // Resolve the ConfigMap name outside the render path to avoid throwing during render
  let configMapName: null | string = null;
  let nameResolutionError: null | string = null;

  if (jobSucceeded && job) {
    try {
      configMapName = determineResultsConfigMapName(job);
    } catch (e) {
      nameResolutionError =
        e instanceof Error ? e.message : t('Could not determine ConfigMap name');
    }
  }

  const [configMap, configMapLoaded, configMapError] = useK8sGetData<IoK8sApiCoreV1ConfigMap>(
    configMapName && namespace && cluster
      ? { cluster, model: ConfigMapModel, name: configMapName, ns: namespace }
      : null,
  );

  // Parse results and track parse failure in a single memo to avoid chained dependency
  const { parseError, results } = useMemo<{
    parseError: boolean;
    results: JobResults | null;
  }>(() => {
    if (!configMapLoaded || configMapError || !configMap)
      return { parseError: false, results: null };

    if (getName(configMap) !== configMapName || getNamespace(configMap) !== namespace) {
      return { parseError: false, results: null };
    }

    const parsedResults = parseResults(configMap);

    if (!parsedResults) return { parseError: true, results: null };

    return {
      parseError: false,
      results: {
        tests: parsedResults,
        timestamps: {
          completionTimestamp: configMap.data?.['status.completionTimestamp'],
          startTimestamp: configMap.data?.['status.startTimestamp'],
        },
      },
    };
  }, [configMap, configMapLoaded, configMapError, configMapName, namespace]);

  // Log errors as side effects, not inside useMemo
  useEffect(() => {
    if (configMapError) {
      kubevirtConsole.warn('Could not read ConfigMap:', configMapError);
    }
  }, [configMapError]);

  useEffect(() => {
    if (parseError) {
      kubevirtConsole.error('Error reading job results:', t('No valid results found in ConfigMap'));
    }
  }, [parseError, t]);

  const error = useMemo<null | string>(() => {
    if (nameResolutionError) return nameResolutionError;
    if (jobSucceeded && (!namespace || !cluster))
      return t('Missing namespace or cluster configuration');
    if (configMapError) {
      const reason =
        configMapError instanceof Error ? configMapError.message : t('Unknown error occurred');
      return `Failed to read results from ConfigMap ${configMapName}: ${reason}`;
    }
    if (parseError) return t('No valid results found in ConfigMap');
    return null;
  }, [
    nameResolutionError,
    jobSucceeded,
    namespace,
    cluster,
    configMapName,
    configMapError,
    parseError,
    t,
  ]);

  const configMapIsStale =
    !!configMap && (getName(configMap) !== configMapName || getNamespace(configMap) !== namespace);

  const isLoading =
    !nameResolutionError &&
    !!namespace &&
    !!cluster &&
    jobSucceeded &&
    !!configMapName &&
    (!configMapLoaded || configMapIsStale || (!configMap && !configMapError));

  return { error, isLoading, results };
};

export default useJobResults;
