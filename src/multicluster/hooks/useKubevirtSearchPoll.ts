import useIsACMPage from '@multicluster/useIsACMPage';
import { WatchK8sResource } from '@openshift-console/dynamic-plugin-sdk';
import {
  AdvancedSearchFilter,
  SearchResult,
  useFleetSearchPoll,
  useHubClusterName,
} from '@stolostron/multicluster-sdk';

const useKubevirtSearchPoll = <T extends K8sResourceCommon | K8sResourceCommon[]>(
  watchOptions: WatchK8sResource,
  advancedSearchFilters?: AdvancedSearchFilter,
  pollInterval?: false | number,
): [SearchResult<T>, boolean, Error, () => void] => {
  const isACMPage = useIsACMPage();
  const [_, hubClusterNameLoaded] = useHubClusterName();
  const isHubClusterLoaded = isACMPage && hubClusterNameLoaded;

  const requestWithNoLimit =
    watchOptions && isHubClusterLoaded
      ? { ...watchOptions, limit: undefined }
      : { isList: watchOptions?.isList };

  return useFleetSearchPoll<T>(requestWithNoLimit, advancedSearchFilters, pollInterval);
};

export default useKubevirtSearchPoll;
