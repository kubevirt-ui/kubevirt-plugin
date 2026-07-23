import { useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router';

import { OnSetFilters } from '@kubevirt-utils/hooks/useKubevirtDataViewFilters/types';
import useNamespaceParam from '@kubevirt-utils/hooks/useNamespaceParam';
import {
  CLUSTER_LIST_FILTER_TYPE,
  PROJECT_LIST_FILTER_TYPE,
} from '@kubevirt-utils/utils/constants';
import useClusterParam from '@multicluster/hooks/useClusterParam';
import { getACMVMListURL, getVMListURL } from '@multicluster/urls';
import useIsACMPage from '@multicluster/useIsACMPage';
import { hasMismatch } from './utils';

/**
 * Unified hook that handles bidirectional sync between the URL path
 * (namespace/cluster) and the toolbar's project/cluster filter state.
 *
 * Two directions:
 *  1. Tree view click changes the path → sync toolbar filter state to match.
 *  2. Toolbar filter change creates a mismatch → broaden the URL path (e.g. query params have multiple projects, but the URL path is /ns/project1 → broaden the URL path to /all-namespaces).
 *
 * A `pathChangedAutomaticallyRef` ref prevents the broadening navigation
 * from triggering an unwanted filter-state reset on the next render.
 */
const useFilterSync = (onSetFilters: OnSetFilters): void => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const namespace = useNamespaceParam();
  const cluster = useClusterParam();
  const isACMPage = useIsACMPage();

  const prevRef = useRef({ cluster, namespace });
  const pathChangedAutomaticallyRef = useRef(false);

  useEffect(() => {
    const prev = prevRef.current;
    prevRef.current = { cluster, namespace };

    const pathChanged = prev.namespace !== namespace || prev.cluster !== cluster;

    if (pathChanged && pathChangedAutomaticallyRef.current) {
      pathChangedAutomaticallyRef.current = false;
      return;
    }

    if (pathChanged) {
      onSetFilters({
        [PROJECT_LIST_FILTER_TYPE]: namespace ? [namespace] : [],
        [CLUSTER_LIST_FILTER_TYPE]: cluster ? [cluster] : [],
      });
      return;
    }

    const projectFilterValues = searchParams.getAll(PROJECT_LIST_FILTER_TYPE);
    const clusterFilterValues = searchParams.getAll(CLUSTER_LIST_FILTER_TYPE);

    let targetCluster: string | undefined | null = cluster;
    let targetNamespace: string | undefined = namespace;
    let needsNavigation = false;

    if (hasMismatch(targetCluster, clusterFilterValues)) {
      targetCluster = undefined;
      targetNamespace = undefined;
      needsNavigation = true;
    }

    if (hasMismatch(targetNamespace, projectFilterValues)) {
      targetNamespace = undefined;
      needsNavigation = true;
    }

    if (needsNavigation) {
      // tracks that the cluster or namespace was changed automatically by the filter sync and not by the user interacting with the tree view
      pathChangedAutomaticallyRef.current = true;

      const pathname = isACMPage
        ? getACMVMListURL(targetCluster, targetNamespace)
        : getVMListURL(undefined, targetNamespace);

      navigate({ pathname, search: searchParams.toString() }, { replace: true });
    }
  }, [searchParams, namespace, cluster, isACMPage, navigate, onSetFilters]);
};

export default useFilterSync;
