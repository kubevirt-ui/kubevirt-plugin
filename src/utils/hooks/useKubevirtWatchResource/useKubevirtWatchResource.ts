import { useMemo } from 'react';

import { K8sResourceCommon, WatchK8sResource } from '@openshift-console/dynamic-plugin-sdk';

import { KUBEVIRT_APISERVER_PROXY } from '../useFeatures/constants';
import { useFeatures } from '../useFeatures/useFeatures';
import useKubevirtDataPodHealth from '../useKubevirtDataPod/hooks/useKubevirtDataPodHealth';

import useRedirectWatchHooks from './useRedirectWatchHooks';

export type Result<R extends K8sResourceCommon | K8sResourceCommon[]> = [R, boolean, Error];

type UseKubevirtWatchResource = <T extends K8sResourceCommon | K8sResourceCommon[]>(
  watchOptions: WatchK8sResource & { cluster?: string },
  filterOptions?: { [key: string]: string },
  searchQueries?: { [key: string]: string },
) => Result<T>;

const useKubevirtWatchResource: UseKubevirtWatchResource = <T>(
  watchOptions,
  filterOptions,
  searchQueries,
) => {
  const isProxyPodAlive = useKubevirtDataPodHealth();
  const { featureEnabled, loading } = useFeatures(KUBEVIRT_APISERVER_PROXY);

  const shouldUseProxyPod = useMemo(() => {
    if (watchOptions?.cluster) return false;
    if (!featureEnabled && !loading) return false;
    if (featureEnabled && !loading && isProxyPodAlive !== null) return isProxyPodAlive;
    return null;
  }, [featureEnabled, loading, isProxyPodAlive, watchOptions?.cluster]);

  return useRedirectWatchHooks<T>(watchOptions, filterOptions, searchQueries, shouldUseProxyPod);
};

export default useKubevirtWatchResource;
