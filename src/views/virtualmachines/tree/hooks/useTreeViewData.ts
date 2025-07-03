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
import useFeatureReadOnly from '@kubevirt-utils/hooks/useFeatures/useFeatureReadOnly';
import { useIsAdmin } from '@kubevirt-utils/hooks/useIsAdmin';
import useKubevirtWatchResource from '@kubevirt-utils/hooks/useKubevirtWatchResource';
import useProjects from '@kubevirt-utils/hooks/useProjects';
import { useK8sWatchResource, useK8sWatchResources } from '@openshift-console/dynamic-plugin-sdk';
import { TreeViewDataItem } from '@patternfly/react-core';
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

  const { featureEnabled: treeViewFoldersEnabled } = useFeatureReadOnly(TREE_VIEW_FOLDERS);
  const [projectNames, projectNamesLoaded, projectNamesError] = useProjects();

  const [allVMs, allVMsLoaded] = useK8sWatchResource<V1VirtualMachine[]>({
    groupVersionKind: VirtualMachineModelGroupVersionKind,
    isList: true,
    limit: OBJECTS_FETCHING_LIMIT,
  });

  // user has limited access, so we can only get vms from allowed namespaces
  const allowedResources = useK8sWatchResources<{ [key: string]: V1VirtualMachine[] }>(
    Object.fromEntries(
      projectNamesLoaded && !isAdmin
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
    namespaced: true,
  });

  const allowedVMIMResources = useK8sWatchResources<{
    [key: string]: V1VirtualMachineInstanceMigration[];
  }>(
    Object.fromEntries(
      projectNamesLoaded && !isAdmin
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
        isAdmin
          ? allVMIM
          : Object.values(allowedVMIMResources).flatMap((resource) => resource.data),
      ),
    [allVMIM, allowedVMIMResources, isAdmin],
  );

  vmimMapperSignal.value = memoizedVMIMs;

  const memoizedVMs = useMemo(
    () => (isAdmin ? allVMs : Object.values(allowedResources).flatMap((resource) => resource.data)),
    [allVMs, allowedResources, isAdmin],
  );

  vmsSignal.value = memoizedVMs;

  const loaded =
    projectNamesLoaded &&
    (isAdmin ? allVMsLoaded : Object.values(allowedResources).some((resource) => resource.loaded));

  const treeData = useMemo(
    () =>
      loaded
        ? createTreeViewData(
            projectNames,
            memoizedVMs,
            isAdmin,
            location.pathname,
            treeViewFoldersEnabled,
          )
        : [],
    [projectNames, memoizedVMs, loaded, isAdmin, treeViewFoldersEnabled, location.pathname],
  );

  const hideSwitch = useMemo(() => projectNames.every(isSystemNamespace), [projectNames]);

  return {
    hideSwitch,
    loaded,
    loadError: projectNamesError,
    treeData,
  };
};
