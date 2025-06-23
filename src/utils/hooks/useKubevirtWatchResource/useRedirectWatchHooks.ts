import { useMemo } from 'react';

import { isEmpty } from '@kubevirt-utils/utils/utils';
import { WatchK8sResource } from '@openshift-console/dynamic-plugin-sdk';
import { useFleetK8sWatchResource, useMulticlusterSearchWatch } from '@stolostron/multicluster-sdk';

import useIsACMPage from '../useIsACMPage';
import useKubevirtDataPod from '../useKubevirtDataPod/useKubevirtDataPod';

import { Result } from './useKubevirtWatchResource';

const useRedirectWatchHooks = <T extends K8sResourceCommon>(
  watchOptions: WatchK8sResource & { cluster?: string },
  filterOptions?: { [key: string]: string },
  shouldUseProxyPod?: boolean,
): Result<T> => {
  const isACMTreeView = useIsACMPage();

  const useMulticlusterSearch = isACMTreeView && isEmpty(watchOptions.cluster);

  const usePod = shouldUseProxyPod && !isACMTreeView;

  const k8sWatchResult = useFleetK8sWatchResource<T>(
    usePod === false && !useMulticlusterSearch && watchOptions,
  );
  const [multiSearchData, multiSearchLoaded, multiSearchError] = useMulticlusterSearchWatch<T>(
    usePod === false && useMulticlusterSearch && watchOptions,
  );

  const kubevirtPodResult = useKubevirtDataPod<T>(usePod ? watchOptions : {}, filterOptions);

  return useMemo(() => {
    const defaultData = watchOptions.isList ? ([] as K8sResourceCommon) : undefined;
    const loaded = multiSearchLoaded || kubevirtPodResult?.[1] || k8sWatchResult[1];

    if (shouldUseProxyPod === null || !loaded) return [defaultData, false, undefined] as Result<T>;

    if (useMulticlusterSearch)
      return [multiSearchData || defaultData, multiSearchLoaded, multiSearchError] as Result<T>;

    if (usePod) return kubevirtPodResult;

    return k8sWatchResult;
  }, [
    watchOptions.isList,
    shouldUseProxyPod,
    useMulticlusterSearch,
    multiSearchData,
    multiSearchLoaded,
    multiSearchError,
    usePod,
    kubevirtPodResult,
    k8sWatchResult,
  ]);
};

export default useRedirectWatchHooks;
