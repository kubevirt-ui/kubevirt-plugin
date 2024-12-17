import { useMemo } from 'react';

import { VirtualMachineModelGroupVersionKind } from '@kubevirt-ui/kubevirt-api/console';
import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { TREE_VIEW_FOLDERS } from '@kubevirt-utils/hooks/useFeatures/constants';
import { useFeatures } from '@kubevirt-utils/hooks/useFeatures/useFeatures';
import { useIsAdmin } from '@kubevirt-utils/hooks/useIsAdmin';
import useProjects from '@kubevirt-utils/hooks/useProjects';
import { useK8sWatchResource, useK8sWatchResources } from '@openshift-console/dynamic-plugin-sdk';
import { TreeViewDataItem } from '@patternfly/react-core';
import { OBJECTS_FETCHING_LIMIT } from '@virtualmachines/utils';

import { createTreeViewData } from '../utils/utils';

type UseTreeViewData = {
  isAdmin: boolean;
  loaded: boolean;
  loadError: any;
  selectedTreeItem: TreeViewDataItem;
  treeData: TreeViewDataItem[];
  vms: V1VirtualMachine[];
};

export const useTreeViewData = (activeNamespace: string): UseTreeViewData => {
  const isAdmin = useIsAdmin();
  const { featureEnabled: treeViewFoldersEnabled } = useFeatures(TREE_VIEW_FOLDERS);
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

  const memoizedVMs = useMemo(
    () => (isAdmin ? allVMs : Object.values(allowedResources).flatMap((resource) => resource.data)),
    [allVMs, allowedResources, isAdmin],
  );

  const [treeData, selectedTreeItem] = useMemo(
    () =>
      createTreeViewData(
        projectNames,
        memoizedVMs,
        activeNamespace,
        isAdmin,
        location.pathname,
        treeViewFoldersEnabled,
      ),
    [projectNames, memoizedVMs, activeNamespace, isAdmin, treeViewFoldersEnabled],
  );

  return {
    isAdmin,
    loaded:
      projectNamesLoaded &&
      (isAdmin
        ? allVMsLoaded
        : Object.values(allowedResources).some((resource) => resource.loaded)),
    loadError: projectNamesError,
    selectedTreeItem,
    treeData,
    vms: memoizedVMs,
  };
};
