import { useMemo } from 'react';
import { useLocation } from 'react-router-dom-v5-compat';

import {
  VirtualMachineInstanceMigrationModelGroupVersionKind,
  VirtualMachineModelGroupVersionKind,
} from '@kubevirt-ui/kubevirt-api/console';
import {
  V1VirtualMachine,
  V1VirtualMachineInstanceMigration,
} from '@kubevirt-ui/kubevirt-api/kubevirt';
import { TREE_VIEW_FOLDERS } from '@kubevirt-utils/hooks/useFeatures/constants';
import { useFeatures } from '@kubevirt-utils/hooks/useFeatures/useFeatures';
import { useIsAdmin } from '@kubevirt-utils/hooks/useIsAdmin';
import useKubevirtWatchResource from '@kubevirt-utils/hooks/useKubevirtWatchResource/useKubevirtWatchResource';
import useProjects from '@kubevirt-utils/hooks/useProjects';
import useIsACMPage from '@multicluster/useIsACMPage';
import { useK8sWatchResources } from '@openshift-console/dynamic-plugin-sdk';
import { TreeViewDataItem } from '@patternfly/react-core';
import { useFleetClusterNames } from '@stolostron/multicluster-sdk';
import { getLatestMigrationForEachVM, OBJECTS_FETCHING_LIMIT } from '@virtualmachines/utils';

import { vmimMapperSignal, vmsSignal } from '../utils/signals';
import { createTreeViewData, isSystemNamespace } from '../utils/utils';

export type UseTreeViewData = {
  hideSwitch: boolean;
  loaded: boolean;
  loadError: any;
  treeData: TreeViewDataItem[];
};

export const useTreeViewData = (): UseTreeViewData => {
  const isAdmin = useIsAdmin();
  const location = useLocation();

  const [clusterNames] = useFleetClusterNames();

  const isACMTreeView = useIsACMPage();

  const { featureEnabled: treeViewFoldersEnabled } = useFeatures(TREE_VIEW_FOLDERS);
  const [projectNames, projectNamesLoaded, projectNamesError] = useProjects();

  const loadVMsPerNamespace = !isACMTreeView && projectNamesLoaded && !isAdmin;

  const [allVMs, allVMsLoaded] = useKubevirtWatchResource<V1VirtualMachine[]>({
    groupVersionKind: VirtualMachineModelGroupVersionKind,
    isList: true,
    limit: OBJECTS_FETCHING_LIMIT,
  });

  // user has limited access, so we can only get vms from allowed namespaces
  const allowedResources = useK8sWatchResources<{ [key: string]: V1VirtualMachine[] }>(
    Object.fromEntries(
      loadVMsPerNamespace
        ? (projectNames || []).map((namespace) => [
            namespace,
            {
              groupVersionKind: VirtualMachineModelGroupVersionKind,
              isList: true,
              namespace,
            },
          ])
        : [],
    ),
  );

  const [allVMIM] = useKubevirtWatchResource<V1VirtualMachineInstanceMigration[]>({
    groupVersionKind: VirtualMachineInstanceMigrationModelGroupVersionKind,
    isList: true,
    limit: OBJECTS_FETCHING_LIMIT,
  });

  const allowedVMIMResources = useK8sWatchResources<{
    [key: string]: V1VirtualMachineInstanceMigration[];
  }>(
    Object.fromEntries(
      loadVMsPerNamespace
        ? (projectNames || []).map((namespace) => [
            namespace,
            {
              groupVersionKind: VirtualMachineInstanceMigrationModelGroupVersionKind,
              isList: true,
              namespace,
            },
          ])
        : [],
    ),
  );

  const memoizedVMIMs = useMemo(
    () =>
      getLatestMigrationForEachVM(
        loadVMsPerNamespace
          ? Object.values(allowedVMIMResources).flatMap((resource) => resource.data)
          : allVMIM,
      ),
    [allVMIM, allowedVMIMResources, loadVMsPerNamespace],
  );

  vmimMapperSignal.value = memoizedVMIMs;

  const memoizedVMs = useMemo(
    () =>
      loadVMsPerNamespace
        ? Object.values(allowedResources).flatMap((resource) => resource.data)
        : allVMs,
    [allVMs, allowedResources, loadVMsPerNamespace],
  );

  vmsSignal.value = memoizedVMs;

  const loaded =
    projectNamesLoaded &&
    (loadVMsPerNamespace
      ? Object.values(allowedResources).some((resource) => resource.loaded)
      : allVMsLoaded);

  const treeData = useMemo(() => {
    if (!loaded) return [];

    return createTreeViewData({
      clusterNames,
      foldersEnabled: treeViewFoldersEnabled,
      isACMTreeView,
      isAdmin,
      pathname: location.pathname,
      projectNames,
      vms: memoizedVMs,
    });
  }, [
    projectNames,
    memoizedVMs,
    loaded,
    isAdmin,
    treeViewFoldersEnabled,
    location.pathname,
    clusterNames,
    isACMTreeView,
  ]);

  const hideSwitch = useMemo(() => projectNames?.every(isSystemNamespace), [projectNames]);

  return useMemo(
    () => ({
      hideSwitch,
      loaded,
      loadError: projectNamesError,
      treeData,
    }),
    [hideSwitch, loaded, projectNamesError, treeData],
  );
};
