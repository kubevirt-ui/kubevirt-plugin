import { useMemo } from 'react';
import { useLocation } from 'react-router-dom-v5-compat';

import { VirtualMachineModelGroupVersionKind } from '@kubevirt-ui/kubevirt-api/console';
import VirtualMachineModel from '@kubevirt-ui/kubevirt-api/console/models/VirtualMachineModel';
import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { TREE_VIEW_FOLDERS } from '@kubevirt-utils/hooks/useFeatures/constants';
import { useFeatures } from '@kubevirt-utils/hooks/useFeatures/useFeatures';
import { useIsAdmin } from '@kubevirt-utils/hooks/useIsAdmin';
import useMultipleAccessReviews from '@kubevirt-utils/hooks/useMultipleAccessReviews';
import useProjects from '@kubevirt-utils/hooks/useProjects';
import {
  AccessReviewResourceAttributes,
  K8sVerb,
  useK8sWatchResource,
  useK8sWatchResources,
} from '@openshift-console/dynamic-plugin-sdk';
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
  const location = useLocation();

  const { featureEnabled: treeViewFoldersEnabled } = useFeatures(TREE_VIEW_FOLDERS);
  const [projectNames, projectNamesLoaded, projectNamesError] = useProjects();

  // Only admins can list VMs cluster-wide; non-admins rely on the per-namespace watches below.
  const [allVMs, allVMsLoaded] = useK8sWatchResource<V1VirtualMachine[]>(
    isAdmin && {
      groupVersionKind: VirtualMachineModelGroupVersionKind,
      isList: true,
      limit: OBJECTS_FETCHING_LIMIT,
    },
  );

  const vmAccessReviewAttributes = useMemo<AccessReviewResourceAttributes[]>(
    () =>
      !isAdmin
        ? (projectNames || []).map((namespace) => ({
            group: VirtualMachineModel.apiGroup,
            namespace,
            resource: VirtualMachineModel.plural,
            verb: 'list' as K8sVerb,
          }))
        : [],
    [isAdmin, projectNames],
  );
  const [vmAccessReviews, vmAccessReviewsLoading] =
    useMultipleAccessReviews(vmAccessReviewAttributes);

  // Drops namespaces the user can't list VMs in, even if the Project is visible.
  const allowedNamespaces = useMemo(
    () =>
      (vmAccessReviews || [])
        .filter((review) => review.allowed)
        .map((review) => review.resourceAttributes?.namespace)
        .filter(Boolean),
    [vmAccessReviews],
  );

  // user has limited access, so we can only get vms from allowed namespaces
  const allowedResources = useK8sWatchResources<{ [key: string]: V1VirtualMachine[] }>(
    Object.fromEntries(
      !isAdmin
        ? allowedNamespaces.map((namespace) => [
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
    () =>
      isAdmin
        ? allVMs
        : Object.values(allowedResources).flatMap((resource) => resource?.data ?? []),
    [allVMs, allowedResources, isAdmin],
  );

  const loaded =
    projectNamesLoaded &&
    (isAdmin
      ? allVMsLoaded
      : !vmAccessReviewsLoading &&
        (allowedNamespaces.length === 0 ||
          Object.values(allowedResources).every((resource) => resource?.loaded)));

  // Otherwise the tree would still render (and link into) namespaces the user can't list VMs in.
  const treeViewNamespaces = isAdmin ? projectNames : allowedNamespaces;

  const treeData = useMemo(
    () =>
      loaded
        ? createTreeViewData(
            treeViewNamespaces,
            memoizedVMs,
            isAdmin,
            location.pathname,
            treeViewFoldersEnabled,
          )
        : [],
    [treeViewNamespaces, memoizedVMs, loaded, isAdmin, treeViewFoldersEnabled, location.pathname],
  );

  const isSwitchDisabled = useMemo(() => projectNames.every(isSystemNamespace), [projectNames]);

  return {
    isSwitchDisabled,
    loaded,
    loadError: projectNamesError,
    treeData,
  };
};
