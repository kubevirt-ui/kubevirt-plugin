import { useMemo } from 'react';

import useK8sWatchData from '@multicluster/hooks/useK8sWatchData';
import useKubevirtSearchPoll from '@multicluster/hooks/useKubevirtSearchPoll';
import useIsACMPage from '@multicluster/useIsACMPage';
import {
  type K8sResourceCommon,
  type WatchK8sResource,
} from '@openshift-console/dynamic-plugin-sdk';
import { type AdvancedSearchFilter } from '@stolostron/multicluster-sdk';

import { type KubevirtDataPodFilters } from '../useKubevirtDataPod/types';
import useKubevirtDataPod from '../useKubevirtDataPod/useKubevirtDataPod';
import { type Result } from './useKubevirtWatchResource';

const useRedirectWatchHooks = <T extends K8sResourceCommon | K8sResourceCommon[]>(
  watchOptions: WatchK8sResource & { cluster?: string },
  filterOptions?: KubevirtDataPodFilters,
  searchQueries?: AdvancedSearchFilter,
  shouldUseProxyPod?: boolean | null,
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

  const kubevirtPodWatch = useKubevirtDataPod<T>(usePod ? watchOptions : null, filterOptions);

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
