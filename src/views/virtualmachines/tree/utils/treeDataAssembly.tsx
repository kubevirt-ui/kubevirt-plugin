import { type TFunction } from 'i18next';

import { type V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { tourGuideVM } from '@kubevirt-utils/components/GuidedTour/utils/constants';
import { getNamespace } from '@kubevirt-utils/resources/shared';
import { type TreeViewDataItem } from '@patternfly/react-core';

import { createAllClustersTreeItem } from '../cluster/utils/clusterTreeItems';
import { type CreateMultiClusterTreeViewDataArgs } from '../multi-cluster/types/types';
import { buildMultiClusterTreeChildren } from '../multi-cluster/utils/multiClusterTreeChildren';
import { getVMsPerCluster } from './clusterVMHelpers';
import { ALL_CLUSTERS_ID } from './constants';
import { createProjectTreeItem } from './projectTreeItems';
import {
  buildProjectMap,
  createAllNamespacesTreeItem,
  getFolderNameFromQueryParams,
} from './treeItemBuilders';
import { getVMInfoFromPathname, treeDataMap } from './utils';

export const createSingleClusterTreeViewData = (
  projectNames: string[],
  vms: V1VirtualMachine[],
  pathname: string,
  foldersEnabled: boolean,
  queryParams: string,
  isTourRunning = false,
): TreeViewDataItem[] => {
  const { currentVMTab, vmName, vmNamespace } = getVMInfoFromPathname(pathname);
  const currentFolderName = getFolderNameFromQueryParams(queryParams);

  const projectsToShow = isTourRunning ? [getNamespace(tourGuideVM)] : projectNames;
  const vmsToShow = isTourRunning ? [tourGuideVM] : vms;

  const treeViewDataMap: Record<string, TreeViewDataItem> = {};
  const projectMap = buildProjectMap(
    vmsToShow,
    vmName,
    currentVMTab,
    treeViewDataMap,
    foldersEnabled,
    isTourRunning,
  );

  const treeViewData = projectsToShow.map((project) =>
    createProjectTreeItem(
      project,
      projectMap,
      vmName,
      vmNamespace,
      treeViewDataMap,
      queryParams,
      undefined,
      true,
      isTourRunning,
      currentFolderName,
    ),
  );

  const allNamespacesTreeItem = createAllNamespacesTreeItem(
    treeViewData,
    treeViewDataMap,
    queryParams,
  );

  treeDataMap.value = treeViewDataMap;

  const tree = allNamespacesTreeItem ? [allNamespacesTreeItem] : treeViewData;

  return tree;
};

export const createMultiClusterTreeViewData = (
  {
    clusterNames,
    clusterSetData,
    clusterSetNames,
    foldersEnabled,
    pathname,
    projectsByClusters,
    queryParams,
    vms,
  }: CreateMultiClusterTreeViewDataArgs,
  t: TFunction,
): TreeViewDataItem[] => {
  const { currentVMTab, vmCluster, vmName, vmNamespace } = getVMInfoFromPathname(pathname);
  const currentFolderName = getFolderNameFromQueryParams(queryParams);

  const vmsPerCluster = getVMsPerCluster(vms) ?? {};

  const treeViewDataMap: Record<string, TreeViewDataItem> = {};

  const treeChildren = buildMultiClusterTreeChildren(
    {
      clusterNames,
      clusterSetData,
      clusterSetNames,
      currentFolderName,
      currentVMTab,
      foldersEnabled,
      projectsByClusters,
      queryParams,
      treeViewDataMap,
      vmCluster,
      vmName,
      vmNamespace,
      vmsPerCluster,
    },
    t,
  );

  const allClustersTreeItem = createAllClustersTreeItem(treeChildren, queryParams, t);

  treeViewDataMap[ALL_CLUSTERS_ID] = allClustersTreeItem;
  treeDataMap.value = treeViewDataMap;

  return [allClustersTreeItem];
};
