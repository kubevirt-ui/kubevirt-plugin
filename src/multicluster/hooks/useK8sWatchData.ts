import { useMemo } from 'react';

import { ALL_CLUSTERS_KEY } from '@kubevirt-utils/hooks/constants';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import useKubevirtSearchPoll from '@multicluster/hooks/useKubevirtSearchPoll';
import useIsACMPage from '@multicluster/useIsACMPage';
import { useK8sWatchResource, WatchK8sResult } from '@openshift-console/dynamic-plugin-sdk';
import {
  AdvancedSearchFilter,
  FleetWatchK8sResource,
  useFleetK8sWatchResource,
  useHubClusterName,
} from '@stolostron/multicluster-sdk';

type UseK8sWatchDataOptions = {
  selectedClusters?: string[];
};

const useK8sWatchData = <T>(
  resource: FleetWatchK8sResource | null,
  options?: UseK8sWatchDataOptions,
): WatchK8sResult<T> => {
  const [hubClusterName] = useHubClusterName();
  const isACMPage = useIsACMPage();
  const { selectedClusters } = options || {};

  // multicluster sdk doesn't support limit as console sdk does
  const requestWithNoLimit = resource ? { ...resource, limit: undefined } : null;

  const isAllClusters = resource?.cluster === ALL_CLUSTERS_KEY;
  const normalizedCluster = isAllClusters ? undefined : resource?.cluster;
  const normalizedResource = requestWithNoLimit
    ? { ...requestWithNoLimit, cluster: normalizedCluster }
    : null;

  const useFleet = normalizedCluster && normalizedCluster !== hubClusterName;

  // Empty array means "query no clusters", undefined means "query all clusters"
  const searchFilters: AdvancedSearchFilter | undefined = useMemo(() => {
    if (isAllClusters && selectedClusters) {
      if (selectedClusters.length > 0) {
        return [{ property: 'cluster', values: selectedClusters }];
      }

      return [{ property: 'cluster', values: [] }];
    }
    return undefined;
  }, [isAllClusters, selectedClusters]);

  const shouldUseSearch = isAllClusters && isACMPage && normalizedResource;
  const hasNoClustersSelected = selectedClusters && selectedClusters.length === 0;
  const searchResource = shouldUseSearch && !hasNoClustersSelected ? normalizedResource : null;

  const [searchData, searchLoaded, searchError] = useKubevirtSearchPoll<T>(
    searchResource,
    searchFilters,
  );

  const [fleetData, fleetLoaded, fleetError] = useFleetK8sWatchResource<T>(
    useFleet ? normalizedResource : null,
  );

  const [k8sWatchData, k8sWatchLoaded, k8sWatchError] = useK8sWatchResource<T>(
    useFleet || isAllClusters ? null : normalizedResource,
  );

  const defaultData: T = useMemo(
    () => (resource?.isList ? ([] as T) : undefined),
    [resource?.isList],
  );

  if (!resource || isEmpty(resource) || isEmpty(resource?.groupVersionKind))
    return [undefined, true, undefined];

  // For ALL_CLUSTERS_KEY, return search results
  // SearchResult<T> is Fleet<T>[] for arrays or Fleet<T> for single items
  // Fleet<T> is T & { cluster?: string }, so it's compatible with T
  if (isAllClusters && isACMPage) {
    // If selectedClusters is explicitly empty, return empty results immediately
    if (selectedClusters && selectedClusters.length === 0) {
      return [defaultData, true, undefined] as WatchK8sResult<T>;
    }
    return [
      isEmpty(searchData) ? defaultData : (searchData as T),
      searchLoaded,
      searchError,
    ] as WatchK8sResult<T>;
  }

  return useFleet
    ? [isEmpty(fleetData) ? defaultData : fleetData, fleetLoaded, fleetError]
    : [isEmpty(k8sWatchData) ? defaultData : k8sWatchData, k8sWatchLoaded, k8sWatchError];
};

export default useK8sWatchData;
