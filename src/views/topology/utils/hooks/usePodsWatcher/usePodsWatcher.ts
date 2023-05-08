import React from 'react';

import { useK8sWatchResources, useSafetyFirst } from '@openshift-console/dynamic-plugin-sdk';
import { useDeepCompareMemoize } from '@openshift-console/dynamic-plugin-sdk/lib/utils/k8s/hooks/useDeepCompareMemoize';

import { useDebounceCallback } from '../../../../clusteroverview/utils/hooks/useDebounceCallback';
import { K8sResourceKind } from '../../../../clusteroverview/utils/types';
import { PodRCData } from '../../types/podTypes';

import { getPodsDataForResource, getResourcesToWatchForPods } from './utils/utils';

/**
 * Watches for all Pods for a kind and namespace.
 * Kind and namespace is used from the given `resource` and can be overridden
 * with the `kind` and `namespace` parameters.
 */
const usePodsWatcher = (
  resource: K8sResourceKind,
  kind?: string,
  namespace?: string,
): { loaded: boolean; loadError: string; podData: PodRCData } => {
  const [loaded, setLoaded] = useSafetyFirst<boolean>(false);
  const [loadError, setLoadError] = useSafetyFirst<string>('');
  const [podData, setPodData] = useSafetyFirst<PodRCData>(undefined);
  const watchKind = kind || resource?.kind;
  const watchNS = namespace || resource?.metadata.namespace;
  const watchedResources = React.useMemo(
    () => (watchKind ? getResourcesToWatchForPods(watchKind, watchNS) : {}),
    [watchKind, watchNS],
  );

  const resources = useK8sWatchResources(watchedResources);

  const updateResults = React.useCallback(
    (watchedResource, updatedResources) => {
      const errorKey = Object.keys(updatedResources).find((key) => updatedResources[key].loadError);
      if (errorKey) {
        setLoadError(updatedResources[errorKey].loadError);
        return;
      }
      setLoadError('');
      if (
        Object.keys(updatedResources).length > 0 &&
        Object.keys(updatedResources).every((key) => updatedResources[key].loaded)
      ) {
        const updatedPods = getPodsDataForResource(watchedResource, watchKind, updatedResources);
        setPodData(updatedPods);
        setLoaded(true);
      }
    },
    [setLoadError, setLoaded, setPodData, watchKind],
  );

  const debouncedUpdateResources = useDebounceCallback(updateResults, 250);

  React.useEffect(() => {
    debouncedUpdateResources(resource, resources);
  }, [debouncedUpdateResources, resources, resource]);

  return useDeepCompareMemoize({ loaded, loadError, podData });
};

export default usePodsWatcher;
