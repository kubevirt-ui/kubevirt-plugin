import { useMemo } from 'react';

import { isEmpty } from '@kubevirt-utils/utils/utils';
import { WatchK8sResource } from '@openshift-console/dynamic-plugin-sdk';
import { useMulticlusterSearchWatch } from '@stolostron/multicluster-sdk';

import useIsACMPage from '../useIsACMPage';
import useK8sWatchData from '../useK8sWatchData';
import useKubevirtDataPod from '../useKubevirtDataPod/useKubevirtDataPod';

import { Result } from './useKubevirtWatchResource';

const useRedirectWatchHooks = <T extends K8sResourceCommon | K8sResourceCommon[]>(
  watchOptions: WatchK8sResource & { cluster?: string },
  filterOptions?: { [key: string]: string },
  shouldUseProxyPod?: boolean,
): Result<T> => {
  const isACMTreeView = useIsACMPage();

  const useMulticlusterSearch = isACMTreeView && isEmpty(watchOptions?.cluster);

  const usePod = shouldUseProxyPod && !isACMTreeView;

  const [k8sWatchData, k8sWatchLoaded, k8sWatchError] = useK8sWatchData<T>(
    usePod === false && !useMulticlusterSearch && watchOptions,
  );
  const [multiSearchData, multiSearchLoaded, multiSearchError] = useMulticlusterSearchWatch<T>(
    usePod === false && useMulticlusterSearch && watchOptions,
  );

  const [kubevirtPodData, kubevirtPodLoaded, kubevirtPodError] = useKubevirtDataPod<T>(
    usePod ? watchOptions : {},
    filterOptions,
  );

  return useMemo(() => {
    const defaultData: T = watchOptions?.isList ? ([] as T) : undefined;

    if (shouldUseProxyPod === null) return [defaultData, false, undefined] as Result<T>;

    if (usePod) return [kubevirtPodData ?? defaultData, kubevirtPodLoaded, kubevirtPodError];

    if (useMulticlusterSearch)
      return [multiSearchData ?? defaultData, multiSearchLoaded, multiSearchError] as Result<T>;

    return [k8sWatchData ?? defaultData, k8sWatchLoaded, k8sWatchError];
  }, [
    watchOptions?.isList,
    shouldUseProxyPod,
    useMulticlusterSearch,
    multiSearchData,
    multiSearchLoaded,
    multiSearchError,
    usePod,
    kubevirtPodData,
    kubevirtPodLoaded,
    kubevirtPodError,
    k8sWatchData,
    k8sWatchLoaded,
    k8sWatchError,
  ]);
};

export default useRedirectWatchHooks;
