import { useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router';

import type { OnSetFilters } from '@kubevirt-utils/hooks/useKubevirtDataViewFilters/types';
import useNamespaceParam from '@kubevirt-utils/hooks/useNamespaceParam';
import {
  CLUSTER_LIST_FILTER_TYPE,
  PROJECT_LIST_FILTER_TYPE,
} from '@kubevirt-utils/utils/constants';
import useClusterParam from '@multicluster/hooks/useClusterParam';
import useIsACMPage from '@multicluster/useIsACMPage';

import { type FilterSyncPrevState } from './types/types';
import {
  getListClusterProjectQueryFilterValues,
  navigateToWidenedVmListPath,
  syncFleetToolbarFromQuery,
  widenUrlPathForToolbarFilters,
} from './utils';

/**
 * Unified hook that handles bidirectional sync between the URL path
 * (namespace/cluster) and the toolbar's project/cluster filter state.
 *
 * Three directions:
 *  1. Tree view click changes the path → sync toolbar filter state to match.
 *  2. Toolbar filter change creates a mismatch → broaden the URL path (e.g. query params have
 *     multiple projects, but the URL path is /ns/project1 → broaden the URL path to /all-namespaces).
 *
 * A `pathChangedAutomaticallyRef` ref prevents the broadening navigation
 * from triggering an unwanted filter-state reset on the next render.
 *
 * `lastSyncedFleetUrlFilterKeyRef` avoids calling `onSetFilters` on every effect run
 * when the fleet URL query filters did not change (direction 2).
 */
const useFilterSync = (onSetFilters: OnSetFilters): void => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const namespace = useNamespaceParam();
  const cluster = useClusterParam();
  const isACMPage = useIsACMPage();

  const prevFilterSyncRef = useRef<FilterSyncPrevState>({
    cluster,
    clusterProjectQueryKey: undefined,
    namespace,
  });
  const pathChangedAutomaticallyRef = useRef(false);
  const lastSyncedFleetUrlFilterKeyRef = useRef('');

  useEffect(() => {
    const prev = prevFilterSyncRef.current;

    const { clusterFilterValues, clusterProjectQueryKey, projectFilterValues } =
      getListClusterProjectQueryFilterValues(searchParams, namespace);

    const pathChanged = prev.namespace !== namespace || prev.cluster !== cluster;
    const clusterProjectQueryKeyChanged = prev.clusterProjectQueryKey !== clusterProjectQueryKey;

    prevFilterSyncRef.current = { cluster, clusterProjectQueryKey, namespace };

    if (pathChanged && pathChangedAutomaticallyRef.current) {
      pathChangedAutomaticallyRef.current = false;
      return;
    }

    if (pathChanged) {
      lastSyncedFleetUrlFilterKeyRef.current = '';
      onSetFilters({
        [CLUSTER_LIST_FILTER_TYPE]: cluster ? [cluster] : clusterFilterValues,
        [PROJECT_LIST_FILTER_TYPE]: namespace ? [namespace] : projectFilterValues,
      });
      return;
    }

    const { scope, shouldNavigate } = widenUrlPathForToolbarFilters(
      { cluster, namespace },
      clusterFilterValues,
      projectFilterValues,
    );

    if (shouldNavigate) {
      // tracks that the cluster or namespace was changed automatically by the filter sync and not by the user interacting with the tree view
      pathChangedAutomaticallyRef.current = true;
      navigateToWidenedVmListPath({ isACMPage, navigate, scope, searchParams });
      return;
    }

    if (!cluster && !pathChanged && clusterProjectQueryKeyChanged) {
      syncFleetToolbarFromQuery({ namespace, onSetFilters, searchParams });
    }
  }, [searchParams, namespace, cluster, isACMPage, navigate, onSetFilters]);
};

export default useFilterSync;
