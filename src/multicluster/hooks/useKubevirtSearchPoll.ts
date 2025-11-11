import { WatchK8sResource } from '@openshift-console/dynamic-plugin-sdk';
import {
  AdvancedSearchFilter,
  SearchResult,
  useFleetSearchPoll,
} from '@stolostron/multicluster-sdk';

const useKubevirtSearchPoll = <T extends K8sResourceCommon | K8sResourceCommon[]>(
  watchOptions: WatchK8sResource,
  advancedSearchFilters?: AdvancedSearchFilter,
  pollInterval?: false | number,
): [SearchResult<T>, boolean, Error, () => void] => {
  const requestWithNoLimit = watchOptions ? { ...watchOptions, limit: undefined } : {};

  return useFleetSearchPoll<T>(requestWithNoLimit, advancedSearchFilters, pollInterval);
};

export default useKubevirtSearchPoll;
