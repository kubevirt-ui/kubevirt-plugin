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
import useAllClusters from '@kubevirt-utils/hooks/useAllClusters/useAllClusters';
import { TREE_VIEW_FOLDERS } from '@kubevirt-utils/hooks/useFeatures/constants';
import { useFeatures } from '@kubevirt-utils/hooks/useFeatures/useFeatures';
import useHubCluster from '@kubevirt-utils/hooks/useHubCluster/useHubCluster';
import { useIsAdmin } from '@kubevirt-utils/hooks/useIsAdmin';
import useMemoizedParams from '@kubevirt-utils/hooks/useMemoizedParams';
import useProjects from '@kubevirt-utils/hooks/useProjects';
import { getName } from '@kubevirt-utils/resources/shared';
import { useK8sWatchResources } from '@openshift-console/dynamic-plugin-sdk';
import { TreeViewDataItem } from '@patternfly/react-core';
import { useFleetK8sWatchResource } from '@stolostron/multicluster-sdk';
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

  const params = useMemoizedParams<{ cluster: string }>();

  const [hubCluster] = useHubCluster();

  const [clusters] = useAllClusters();

  const cluster = params.cluster || getName(hubCluster);

  const { featureEnabled: treeViewFoldersEnabled } = useFeatures(TREE_VIEW_FOLDERS);
  const [projectNames, projectNamesLoaded, projectNamesError] = useProjects(cluster);

  const [allVMs, allVMsLoaded] = useFleetK8sWatchResource<V1VirtualMachine[]>({
    cluster,
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

  const [allVMIM] = useFleetK8sWatchResource<V1VirtualMachineInstanceMigration[]>({
    cluster,
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
            cluster,
            clusters,
          )
        : [],
    [
      projectNames,
      memoizedVMs,
      loaded,
      isAdmin,
      treeViewFoldersEnabled,
      location.pathname,
      clusters,
      cluster,
    ],
  );

  const hideSwitch = useMemo(() => projectNames.every(isSystemNamespace), [projectNames]);

  return {
    hideSwitch,
    loaded,
    loadError: projectNamesError,
    treeData,
  };
};
