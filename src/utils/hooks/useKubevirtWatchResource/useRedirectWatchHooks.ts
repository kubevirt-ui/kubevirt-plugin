import { useMemo } from 'react';

import useK8sWatchData from '@multicluster/hooks/useK8sWatchData';
import useKubevirtSearchPoll from '@multicluster/hooks/useKubevirtSearchPoll';
import useIsACMPage from '@multicluster/useIsACMPage';
import { K8sResourceCommon, WatchK8sResource } from '@openshift-console/dynamic-plugin-sdk';
import { AdvancedSearchFilter } from '@stolostron/multicluster-sdk';

import useKubevirtDataPod from '../useKubevirtDataPod/useKubevirtDataPod';
import { KubevirtDataPodFilters } from '../useKubevirtDataPod/useKubevirtDataPodFilters';

import { Result } from './useKubevirtWatchResource';

const useRedirectWatchHooks = <T extends K8sResourceCommon | K8sResourceCommon[]>(
  watchOptions: WatchK8sResource & { cluster?: string },
  filterOptions?: KubevirtDataPodFilters,
  searchQueries?: AdvancedSearchFilter,
  shouldUseProxyPod?: boolean,
): Result<T> => {
  const isACMTreeView = useIsACMPage();

  const useMulticlusterSearch = useMemo(() => {
    if (!isACMTreeView || !watchOptions) return false;
    const cluster = watchOptions.cluster;
    return cluster === undefined || cluster === '';
  }, [isACMTreeView, watchOptions]);

  const usePod = shouldUseProxyPod && !isACMTreeView;

  const multiSearchWatchOptions = useMemo(
    () => (!usePod && useMulticlusterSearch ? watchOptions : null),
    [usePod, useMulticlusterSearch, watchOptions],
  );

  const k8sWatch = useK8sWatchData<T>(!usePod && !useMulticlusterSearch ? watchOptions : null);

  const [multiSearchData, multiSearchLoaded, multiSearchError] = useKubevirtSearchPoll<T>(
    multiSearchWatchOptions,
    searchQueries,
  );

  const kubevirtPodWatch = useKubevirtDataPod<T>(usePod ? watchOptions : {}, filterOptions);

  return useMemo(() => {
    const defaultData: T = watchOptions?.isList ? ([] as T) : undefined;

    if (shouldUseProxyPod === null) return [defaultData, false, undefined] as Result<T>;

    if (usePod) return kubevirtPodWatch;

    if (useMulticlusterSearch)
      return [multiSearchData, multiSearchLoaded, multiSearchError] as Result<T>;

    return k8sWatch;
  }, [
    watchOptions?.isList,
    shouldUseProxyPod,
    useMulticlusterSearch,
    multiSearchData,
    multiSearchLoaded,
    multiSearchError,
    usePod,
    kubevirtPodWatch,
    k8sWatch,
  ]);
};

export default useRedirectWatchHooks;
