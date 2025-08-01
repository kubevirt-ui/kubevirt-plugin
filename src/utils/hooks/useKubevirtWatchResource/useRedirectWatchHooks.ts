import { useMemo } from 'react';

import { isEmpty } from '@kubevirt-utils/utils/utils';
import useK8sWatchData from '@multicluster/hooks/useK8sWatchData';
import useIsACMPage from '@multicluster/useIsACMPage';
import { WatchK8sResource } from '@openshift-console/dynamic-plugin-sdk';
import { AdvancedSearchFilter, useFleetSearchPoll } from '@stolostron/multicluster-sdk';

import useKubevirtDataPod from '../useKubevirtDataPod/useKubevirtDataPod';

import { Result } from './useKubevirtWatchResource';

const useRedirectWatchHooks = <T extends K8sResourceCommon | K8sResourceCommon[]>(
  watchOptions: WatchK8sResource & { cluster?: string },
  filterOptions?: { [key: string]: string },
  searchQueries?: AdvancedSearchFilter,
  shouldUseProxyPod?: boolean,
): Result<T> => {
  const isACMTreeView = useIsACMPage();

  const useMulticlusterSearch = isACMTreeView && isEmpty(watchOptions?.cluster);

  const usePod = shouldUseProxyPod && !isACMTreeView;

  const k8sWatch = useK8sWatchData<T>(!usePod && !useMulticlusterSearch ? watchOptions : null);
  const [multiSearchData, multiSearchLoading, multiSearchError] = useFleetSearchPoll<T>(
    !usePod && useMulticlusterSearch && watchOptions,
    searchQueries,
  );

  const kubevirtPodWatch = useKubevirtDataPod<T>(usePod ? watchOptions : {}, filterOptions);

  return useMemo(() => {
    const defaultData: T = watchOptions?.isList ? ([] as T) : undefined;

    if (shouldUseProxyPod === null) return [defaultData, false, undefined] as Result<T>;

    if (usePod) return kubevirtPodWatch;

    if (useMulticlusterSearch)
      return [multiSearchData, multiSearchLoading, multiSearchError] as Result<T>;

    return k8sWatch;
  }, [
    watchOptions?.isList,
    shouldUseProxyPod,
    useMulticlusterSearch,
    multiSearchData,
    multiSearchLoading,
    multiSearchError,
    usePod,
    kubevirtPodWatch,
    k8sWatch,
  ]);
};

export default useRedirectWatchHooks;
