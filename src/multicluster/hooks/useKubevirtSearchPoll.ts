import { useMemo } from 'react';

import useIsACMPage from '@multicluster/useIsACMPage';
import {
  type K8sResourceCommon,
  type WatchK8sResource,
} from '@openshift-console/dynamic-plugin-sdk';
import {
  type AdvancedSearchFilter,
  type FleetWatchK8sResource,
  type SearchResult,
  useFleetSearchPoll,
  useHubClusterName,
} from '@stolostron/multicluster-sdk';

const useKubevirtSearchPoll = <T extends K8sResourceCommon | K8sResourceCommon[]>(
  watchOptions: WatchK8sResource,
  advancedSearchFilters?: AdvancedSearchFilter,
  pollInterval?: false | number,
): [SearchResult<T>, boolean, Error, () => void] => {
  const isACMPage = useIsACMPage();
  const hubClusterResult = useHubClusterName();
  const hubClusterNameLoaded = hubClusterResult[1];
  const hubClusterError: unknown = hubClusterResult[2];
  const isHubClusterLoaded = isACMPage && (hubClusterNameLoaded || !!hubClusterError);

  const requestAllAPIVersionsWithNoLimit: FleetWatchK8sResource = useMemo(() => {
    const { group, kind } = watchOptions?.groupVersionKind ?? {};
    const groupVersionKind = { group, kind, version: '' };

    if (watchOptions && isHubClusterLoaded) {
      return { ...watchOptions, groupVersionKind, limit: undefined };
    }

    return { groupVersionKind, isList: watchOptions?.isList };
  }, [watchOptions, isHubClusterLoaded]);

  return useFleetSearchPoll<T>(
    requestAllAPIVersionsWithNoLimit,
    advancedSearchFilters,
    pollInterval,
  );
};

export default useKubevirtSearchPoll;
