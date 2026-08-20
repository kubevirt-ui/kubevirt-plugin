import { useMemo } from 'react';

import {
  type K8sResourceCommon,
  type WatchK8sResource,
} from '@openshift-console/dynamic-plugin-sdk';
import { type AdvancedSearchFilter } from '@stolostron/multicluster-sdk';

import useQuery from '../useQuery';

import { KUBEVIRT_APISERVER_PROXY } from '../useFeatures/constants';
import { useFeatures } from '../useFeatures/useFeatures';
import useKubevirtDataPodHealth from '../useKubevirtDataPod/hooks/useKubevirtDataPodHealth';
import { type KubevirtDataPodFilters } from '../useKubevirtDataPod/types';
import { hasActiveProxyFilter } from '../useKubevirtDataViewFilters/utils';
import useRedirectWatchHooks from './useRedirectWatchHooks';

export type Result<R extends K8sResourceCommon | K8sResourceCommon[]> = [
  resource: R,
  resourceLoaded: boolean,
  resourceLoadError: Error,
];

const useKubevirtWatchResource = <T extends K8sResourceCommon | K8sResourceCommon[]>(
  watchOptions: WatchK8sResource & { cluster?: string },
  filterOptions?: KubevirtDataPodFilters,
  searchQueries?: AdvancedSearchFilter,
): Result<T> => {
  const isProxyPodAlive = useKubevirtDataPodHealth();
  const { featureEnabled, loading } = useFeatures(KUBEVIRT_APISERVER_PROXY);
  const query = useQuery();
  const shouldUseProxyFilter = useMemo(
    () => hasActiveProxyFilter(query, filterOptions),
    [query, filterOptions],
  );

  const shouldUseProxyPod = useMemo(() => {
    if (watchOptions?.cluster) return false;
    if (!shouldUseProxyFilter) return false;
    if (!featureEnabled && !loading) return false;
    if (featureEnabled && !loading && isProxyPodAlive !== null) return isProxyPodAlive;
    return null;
  }, [featureEnabled, loading, isProxyPodAlive, watchOptions?.cluster, shouldUseProxyFilter]);

  return useRedirectWatchHooks<T>(watchOptions, filterOptions, searchQueries, shouldUseProxyPod);
};

export default useKubevirtWatchResource;
