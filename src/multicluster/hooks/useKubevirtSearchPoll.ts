import useIsACMPage from '@multicluster/useIsACMPage';
import { K8sResourceCommon, WatchK8sResource } from '@openshift-console/dynamic-plugin-sdk';
import {
  AdvancedSearchFilter,
  FleetWatchK8sResource,
  SearchResult,
  useFleetSearchPoll,
  useHubClusterName,
} from '@stolostron/multicluster-sdk';
import { useMemo } from 'react';

const useKubevirtSearchPoll = <T extends K8sResourceCommon | K8sResourceCommon[]>(
  watchOptions: WatchK8sResource,
  advancedSearchFilters?: AdvancedSearchFilter,
  pollInterval?: false | number,
): [SearchResult<T>, boolean, Error, () => void] => {
  const isACMPage = useIsACMPage();
  const [, hubClusterNameLoaded, hubClusterError] = useHubClusterName();
  const isHubClusterLoaded = isACMPage && (hubClusterNameLoaded || !!hubClusterError);

  const requestAllAPIVersionsWithNoLimit: FleetWatchK8sResource = useMemo(() => {
    const { group, kind } = watchOptions?.groupVersionKind ?? {};
    const groupVersionKind = { group, kind, version: '' };

    if (watchOptions && isHubClusterLoaded) {
      return { ...watchOptions, limit: undefined, groupVersionKind };
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
