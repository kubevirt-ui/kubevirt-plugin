import { useMemo } from 'react';
import { useLocation } from 'react-router';

import { runningTourSignal } from '@kubevirt-utils/components/GuidedTour/utils/guidedTourSignals';
import { ALL_CLUSTERS } from '@kubevirt-utils/hooks/constants';
import { TREE_VIEW_FOLDERS } from '@kubevirt-utils/hooks/useFeatures/constants';
import { useFeatures } from '@kubevirt-utils/hooks/useFeatures/useFeatures';
import { useIsAdmin } from '@kubevirt-utils/hooks/useIsAdmin';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import useProjects from '@kubevirt-utils/hooks/useProjects';
import useMulticlusterNamespaces from '@multicluster/hooks/useMulticlusterNamespaces';
import useIsACMPage from '@multicluster/useIsACMPage';
import { type TreeViewDataItem } from '@patternfly/react-core';
import { useFleetClusterNames } from '@stolostron/multicluster-sdk';

import { createMultiClusterTreeViewData, createSingleClusterTreeViewData } from '../utils/utils';
import { useTreeViewResources } from './useTreeViewResources';

export type UseTreeViewData = {
  loaded: boolean;
  loadError: unknown;
  treeData: TreeViewDataItem[];
};

export const useTreeViewData = (): UseTreeViewData => {
  const { t } = useKubevirtTranslation();
  const isAdmin = useIsAdmin();
  const location = useLocation();

  const [clusterNames] = useFleetClusterNames();

  const isACMTreeView = useIsACMPage();

  const isTourRunning = runningTourSignal.value;

  const { featureEnabled: treeViewFoldersEnabled } = useFeatures(TREE_VIEW_FOLDERS);
  const [projectNames, projectNamesLoaded, projectNamesError] = useProjects();
  const {
    error: multiclusterNamespacesError,
    loaded: multiclusterNamespacesLoaded,
    namespacesByCluster,
  } = useMulticlusterNamespaces() as {
    error: unknown;
    loaded: boolean;
    namespacesByCluster: Record<string, Array<{ metadata?: { name?: string } }>>;
  };

  const loadVMsPerNamespace = !isACMTreeView && projectNamesLoaded && !isAdmin;

  const { allVMsLoaded, perNamespaceLoaded, sortedMemoizedVMs } = useTreeViewResources({
    isACMTreeView,
    isAdmin,
    loadVMsPerNamespace,
    projectNames,
  });

  const projectsLoaded = isACMTreeView ? multiclusterNamespacesLoaded : projectNamesLoaded;

  const loaded = projectsLoaded && (loadVMsPerNamespace ? perNamespaceLoaded : allVMsLoaded);

  const treeData = useMemo(() => {
    if (!loaded) return [];

    if (isACMTreeView) {
      return createMultiClusterTreeViewData(
        sortedMemoizedVMs,
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
      sortedMemoizedVMs,
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
    sortedMemoizedVMs,
    location.pathname,
    treeViewFoldersEnabled,
    clusterNames,
    namespacesByCluster,
    location.search,
    t,
  ]);

  return useMemo(
    () => ({
      loaded,
      loadError: projectNamesError ?? multiclusterNamespacesError,
      treeData,
    }),
    [loaded, multiclusterNamespacesError, projectNamesError, treeData],
  );
};
