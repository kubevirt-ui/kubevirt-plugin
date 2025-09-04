import { useMemo } from 'react';

import { K8sResourceCommon, WatchK8sResource } from '@openshift-console/dynamic-plugin-sdk';
import { AdvancedSearchFilter } from '@stolostron/multicluster-sdk';

import { KUBEVIRT_APISERVER_PROXY } from '../useFeatures/constants';
import { useFeatures } from '../useFeatures/useFeatures';
import useKubevirtDataPodHealth from '../useKubevirtDataPod/hooks/useKubevirtDataPodHealth';
import useQuery from '../useQuery';

import useRedirectWatchHooks from './useRedirectWatchHooks';

export type Result<R extends K8sResourceCommon | K8sResourceCommon[]> = [
  resource: R,
  resourceLoaded: boolean,
  resourceLoadError: Error,
];

const useKubevirtWatchResource = <T extends K8sResourceCommon | K8sResourceCommon[]>(
  watchOptions: WatchK8sResource & { cluster?: string },
  filterOptions?: { [key: string]: string },
  searchQueries?: AdvancedSearchFilter,
): Result<T> => {
  const isProxyPodAlive = useKubevirtDataPodHealth();
  const { featureEnabled, loading } = useFeatures(KUBEVIRT_APISERVER_PROXY);
  const query = useQuery();

  const shouldUseProxyPod = useMemo(() => {
    if (watchOptions?.cluster) return false;
    if (!filterOptions || query.size === 0) return false;
    if (!featureEnabled && !loading) return false;
    if (featureEnabled && !loading && isProxyPodAlive !== null) return isProxyPodAlive;
    return null;
  }, [featureEnabled, loading, isProxyPodAlive, watchOptions?.cluster, query.size, filterOptions]);

  return useRedirectWatchHooks<T>(watchOptions, filterOptions, searchQueries, shouldUseProxyPod);
};

export default useKubevirtWatchResource;
