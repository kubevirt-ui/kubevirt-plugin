import { useEffect, useState } from 'react';

import {
  K8sResourceCommon,
  useK8sWatchResource,
  WatchK8sResource,
} from '@openshift-console/dynamic-plugin-sdk';

import useKubevirtDataPodHealth from './useKubevirtDataPod/hooks/useKubevirtDataPodHealth';
import useKubevirtDataPod from './useKubevirtDataPod/useKubevirtDataPod';
type Result<R extends K8sResourceCommon | K8sResourceCommon[]> = [R, boolean, Error];

type UseKubevirtWatchResource = <T extends K8sResourceCommon | K8sResourceCommon[]>(
  watchOptions: WatchK8sResource,
  filterOptions?: { [key: string]: string },
) => Result<T>;
const useKubevirtWatchResource: UseKubevirtWatchResource = <T>(watchOptions, filterOptions) => {
  const [data, setData] = useState<T>((<unknown>[]) as T);
  const [loadedData, setLoadedData] = useState<boolean>(false);
  const [loadErrorData, setLoadErrorData] = useState<Error>();
  const isPodDataAlive = useKubevirtDataPodHealth();
  const [resourceK8sWatch, loadedK8sWatch, loadErrorK8sWatch] = useK8sWatchResource<T>(
    isPodDataAlive === false && watchOptions,
  );
  const [resourceKubevirtDataPod, loadedKubevirtDataPod, loadErrorKubevirtDataPod] =
    useKubevirtDataPod<T>(isPodDataAlive ? watchOptions : {}, filterOptions);

  useEffect(() => {
    if (isPodDataAlive !== null) {
      const [resource, loaded, loadError] = isPodDataAlive
        ? [resourceKubevirtDataPod, loadedKubevirtDataPod, loadErrorKubevirtDataPod]
        : [resourceK8sWatch, loadedK8sWatch, loadErrorK8sWatch];
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
    isPodDataAlive,
  ]);
  return [data, loadedData, loadErrorData];
};

export default useKubevirtWatchResource;
