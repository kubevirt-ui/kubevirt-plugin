import { useEffect, useMemo, useState } from 'react';

import { K8sResourceCommon, WatchK8sResource } from '@openshift-console/dynamic-plugin-sdk';
import { useFleetK8sWatchResource } from '@stolostron/multicluster-sdk';

import { KUBEVIRT_APISERVER_PROXY } from './useFeatures/constants';
import { useFeatures } from './useFeatures/useFeatures';
import useKubevirtDataPodHealth from './useKubevirtDataPod/hooks/useKubevirtDataPodHealth';
import useKubevirtDataPod from './useKubevirtDataPod/useKubevirtDataPod';
type Result<R extends K8sResourceCommon | K8sResourceCommon[]> = [R, boolean, Error];

type UseKubevirtWatchResource = <T extends K8sResourceCommon | K8sResourceCommon[]>(
  watchOptions: WatchK8sResource & { cluster?: string },
  filterOptions?: { [key: string]: string },
) => Result<T>;
const useKubevirtWatchResource: UseKubevirtWatchResource = <T>(watchOptions, filterOptions) => {
  const [data, setData] = useState<T>((<unknown>[]) as T);
  const [loadedData, setLoadedData] = useState<boolean>(false);
  const [loadErrorData, setLoadErrorData] = useState<Error>();
  const isProxyPodAlive = useKubevirtDataPodHealth();
  const { featureEnabled, loading } = useFeatures(KUBEVIRT_APISERVER_PROXY);
  const shouldUseProxyPod = useMemo(() => {
    if (watchOptions?.cluster) return false;
    if (!featureEnabled && !loading) return false;
    if (featureEnabled && !loading && isProxyPodAlive !== null) return isProxyPodAlive;
    return null;
  }, [featureEnabled, loading, isProxyPodAlive, watchOptions?.cluster]);
  const [resourceK8sWatch, loadedK8sWatch, loadErrorK8sWatch] = useFleetK8sWatchResource<T>(
    shouldUseProxyPod === false && watchOptions,
  );
  const [resourceKubevirtDataPod, loadedKubevirtDataPod, loadErrorKubevirtDataPod] =
    useKubevirtDataPod<T>(shouldUseProxyPod ? watchOptions : {}, filterOptions);

  useEffect(() => {
    if (shouldUseProxyPod !== null) {
      const [resource, loaded, loadError] = shouldUseProxyPod
        ? [resourceKubevirtDataPod, loadedKubevirtDataPod, loadErrorKubevirtDataPod]
        : [resourceK8sWatch, loadedK8sWatch, loadErrorK8sWatch];
      setLoadedData(loaded);

      if (loadError) {
        setLoadErrorData(loadError);
        setLoadedData(true);
      }
      if (resource && loaded) {
        const isList = typeof resource?.[0] === 'string';
        setData((isList && resource?.[1]) || (<T & { items?: T[] }>resource)?.items || resource);
        setLoadedData(loaded);
        setLoadErrorData(null);
      }
    }
  }, [
    resourceKubevirtDataPod,
    loadedKubevirtDataPod,
    loadErrorKubevirtDataPod,
    resourceK8sWatch,
    loadedK8sWatch,
    loadErrorK8sWatch,
    isProxyPodAlive,
    shouldUseProxyPod,
  ]);
  return [data, loadedData, loadErrorData];
};

export default useKubevirtWatchResource;
