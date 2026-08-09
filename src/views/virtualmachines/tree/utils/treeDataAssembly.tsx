import React from 'react';

import { type V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { tourGuideVM } from '@kubevirt-utils/components/GuidedTour/utils/constants';
import { t } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getNamespace } from '@kubevirt-utils/resources/shared';
import { getName } from '@kubevirt-utils/resources/shared';
import { universalComparator } from '@kubevirt-utils/utils/utils';
import { type UseMulticlusterNamespacesReturn } from '@multicluster/hooks/useMulticlusterNamespaces';
import { getACMVMListURL } from '@multicluster/urls';
import { Tooltip, type TreeViewDataItem } from '@patternfly/react-core';
import { ClusterIcon } from '@patternfly/react-icons';

import { getVMsPerCluster } from './clusterVMHelpers';
import { ALL_CLUSTERS_ID } from './constants';
import { createProjectTreeItem } from './projectTreeItems';
import {
  buildProjectMap,
  createAllNamespacesTreeItem,
  getFolderNameFromQueryParams,
} from './treeItemBuilders';
import {
  buildTreeItemQuery,
  getClusterTreeViewItemID,
  getVMInfoFromPathname,
  treeDataMap,
  type TreeViewDataItemWithHref,
} from './utils';

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
  vms: V1VirtualMachine[],
  pathname: string,
  foldersEnabled: boolean,
  projectsByClusters: UseMulticlusterNamespacesReturn['namespacesByCluster'],
  allClustersLabel: string,
  queryParams?: string,
  clusterNames?: string[],
): TreeViewDataItem[] => {
  const { currentVMTab, vmCluster, vmName, vmNamespace } = getVMInfoFromPathname(pathname);
  const currentFolderName = getFolderNameFromQueryParams(queryParams);

  const vmsPerCluster = getVMsPerCluster(vms) ?? {};

  const treeViewDataMap: Record<string, TreeViewDataItem> = {};

  const treeWithClusters = clusterNames
    ?.sort((a, b) => universalComparator(a, b))
    ?.map((clusterName) => {
      const clusterVMs = vmsPerCluster[clusterName] ?? [];

      const clusterProjects = projectsByClusters[clusterName]
        ?.map((project) => getName(project))
        ?.sort((a, b) => universalComparator(a, b));

      const projectMap = buildProjectMap(
        clusterVMs,
        vmName,
        currentVMTab,
        treeViewDataMap,
        foldersEnabled,
      );

      const clusterSelected = vmCluster === clusterName;

      const treeViewData = clusterProjects?.map((project) =>
        createProjectTreeItem(
          project,
          projectMap,
          vmName,
          vmNamespace,
          treeViewDataMap,
          queryParams,
          clusterName,
          clusterSelected,
          false,
          currentFolderName,
        ),
      );

      const clusterTreeItem: TreeViewDataItemWithHref = {
        children: treeViewData,
        defaultExpanded: clusterSelected,
        hasBadge: false,
        href: `${getACMVMListURL(clusterName)}${buildTreeItemQuery({
          cluster: clusterName,
          query: queryParams,
        })}`,
        icon: (
          <Tooltip content={t('Cluster')}>
            <ClusterIcon />
          </Tooltip>
        ),
        id: getClusterTreeViewItemID(clusterName),
        name: clusterName,
      };

      if (!treeViewDataMap[clusterTreeItem.id]) {
        treeViewDataMap[clusterTreeItem.id] = clusterTreeItem;
      }

      return clusterTreeItem;
    });

  const allClustersTreeItem: TreeViewDataItemWithHref = {
    children: treeWithClusters,
    defaultExpanded: true,
    hasBadge: false,
    href: `${getACMVMListURL()}${buildTreeItemQuery({ query: queryParams })}`,
    icon: <ClusterIcon />,
    id: ALL_CLUSTERS_ID,
    name: allClustersLabel,
  };

  treeViewDataMap[ALL_CLUSTERS_ID] = allClustersTreeItem;
  treeDataMap.value = treeViewDataMap;

  return [allClustersTreeItem];
};
