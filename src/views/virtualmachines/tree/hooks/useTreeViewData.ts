import { useMemo } from 'react';

import { VirtualMachineModelGroupVersionKind } from '@kubevirt-ui/kubevirt-api/console';
import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { TREE_VIEW_FOLDERS } from '@kubevirt-utils/hooks/useFeatures/constants';
import { useFeatures } from '@kubevirt-utils/hooks/useFeatures/useFeatures';
import { useIsAdmin } from '@kubevirt-utils/hooks/useIsAdmin';
import useProjects from '@kubevirt-utils/hooks/useProjects';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { useK8sWatchResource, useK8sWatchResources } from '@openshift-console/dynamic-plugin-sdk';
import { TreeViewDataItem } from '@patternfly/react-core';
import { OBJECTS_FETCHING_LIMIT } from '@virtualmachines/utils';

import { createTreeViewData, isSystemNamespace } from '../utils/utils';

export type UseTreeViewData = {
  isSwitchDisabled: boolean;
  loaded: boolean;
  loadError: any;
  treeData: TreeViewDataItem[];
};

export const useTreeViewData = (): UseTreeViewData => {
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

  const treeData = useMemo(
    () =>
      !isEmpty(memoizedVMs)
        ? createTreeViewData(
            projectNames,
            memoizedVMs,
            isAdmin,
            location.pathname,
            treeViewFoldersEnabled,
          )
        : [],
    [projectNames, memoizedVMs, isAdmin, treeViewFoldersEnabled],
  );

  const isSwitchDisabled = useMemo(() => projectNames.every(isSystemNamespace), [projectNames]);

  return {
    isSwitchDisabled,
    loaded:
      projectNamesLoaded &&
      (isAdmin
        ? allVMsLoaded
        : Object.values(allowedResources).some((resource) => resource.loaded)),
    loadError: projectNamesError,
    treeData,
  };
};
