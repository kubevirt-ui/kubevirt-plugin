import { useMemo } from 'react';
import { useLocation } from 'react-router';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { type TreeViewDataItem } from '@patternfly/react-core';
import { type ClusterSetData } from '@stolostron/multicluster-sdk';
import { getNavigatorTabSearch } from '@virtualmachines/navigator/tabStorage';

import { createMultiClusterTreeViewData, createSingleClusterTreeViewData } from '../utils/utils';
import { useTreeViewDataResources } from './useTreeViewDataResources';

export type UseTreeViewData = {
  clusterSetData: ClusterSetData;
  clusterSetNames: string[];
  loaded: boolean;
  loadError: unknown;
  treeData: TreeViewDataItem[];
};

export const useTreeViewData = (): UseTreeViewData => {
  const location = useLocation();
  const {
    clusterNames,
    clusterSetData,
    clusterSetNames,
    isACMTreeView,
    isTourRunning,
    loaded,
    loadError,
    namespacesByCluster,
    projectNames,
    treeViewFoldersEnabled,
    vms,
  } = useTreeViewDataResources();

  const { t } = useKubevirtTranslation();

  const navigatorTabSearch = getNavigatorTabSearch(location.search);

  const treeData = useMemo((): TreeViewDataItem[] => {
    if (!loaded) {
      return [];
    }

    if (isACMTreeView) {
      return createMultiClusterTreeViewData(
        {
          clusterNames,
          clusterSetData,
          clusterSetNames,
          foldersEnabled: treeViewFoldersEnabled,
          pathname: location.pathname,
          projectsByClusters: namespacesByCluster,
          queryParams: navigatorTabSearch,
          vms,
        },
        t,
      );
    }

    return createSingleClusterTreeViewData(
      projectNames,
      vms,
      location.pathname,
      treeViewFoldersEnabled,
      navigatorTabSearch,
      isTourRunning,
    );
  }, [
    loaded,
    isACMTreeView,
    projectNames,
    vms,
    location.pathname,
    treeViewFoldersEnabled,
    navigatorTabSearch,
    isTourRunning,
    clusterNames,
    clusterSetData,
    clusterSetNames,
    namespacesByCluster,
    t,
  ]);

  return useMemo(
    (): UseTreeViewData => ({
      clusterSetData,
      clusterSetNames,
      loaded,
      loadError,
      treeData,
    }),
    [clusterSetData, clusterSetNames, loaded, loadError, treeData],
  );
};
