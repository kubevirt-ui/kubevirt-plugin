import { useMemo } from 'react';
import { useLocation } from 'react-router';

import { ALL_CLUSTERS } from '@kubevirt-utils/hooks/constants';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { type TreeViewDataItem } from '@patternfly/react-core';

import { createMultiClusterTreeViewData, createSingleClusterTreeViewData } from '../utils/utils';
import { useTreeViewDataResources } from './useTreeViewDataResources';

export type UseTreeViewData = {
  loaded: boolean;
  loadError: unknown;
  treeData: TreeViewDataItem[];
};

export const useTreeViewData = (): UseTreeViewData => {
  const { t } = useKubevirtTranslation();
  const location = useLocation();
  const {
    clusterNames,
    isACMTreeView,
    isTourRunning,
    loaded,
    loadError,
    namespacesByCluster,
    projectNames,
    treeViewFoldersEnabled,
    vms,
  } = useTreeViewDataResources();

  const treeData = useMemo((): TreeViewDataItem[] => {
    if (!loaded) {
      return [];
    }

    if (isACMTreeView) {
      return createMultiClusterTreeViewData(
        vms,
        location.pathname,
        treeViewFoldersEnabled,
        namespacesByCluster,
        t(ALL_CLUSTERS),
        location.search,
        clusterNames,
      );
    }

    return createSingleClusterTreeViewData(
      projectNames,
      vms,
      location.pathname,
      treeViewFoldersEnabled,
      location.search,
      isTourRunning,
    );
  }, [
    loaded,
    isACMTreeView,
    isTourRunning,
    projectNames,
    vms,
    location.pathname,
    treeViewFoldersEnabled,
    clusterNames,
    namespacesByCluster,
    location.search,
    t,
  ]);

  return useMemo(
    (): UseTreeViewData => ({
      loaded,
      loadError,
      treeData,
    }),
    [loaded, loadError, treeData],
  );
};
