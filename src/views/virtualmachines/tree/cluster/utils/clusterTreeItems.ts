import { createElement } from 'react';
import { type TFunction } from 'i18next';

import { ALL_CLUSTERS } from '@kubevirt-utils/hooks/constants';
import { isEmpty, universalComparator } from '@kubevirt-utils/utils/utils';
import { getACMVMListURL } from '@multicluster/urls';
import { type TreeViewDataItem } from '@patternfly/react-core';
import { ClusterIcon } from '@patternfly/react-icons';
import { type BuildMultiClusterTreeChildrenArgs } from '@virtualmachines/tree/multi-cluster/types/types';
import { ALL_CLUSTERS_ID } from '@virtualmachines/tree/utils/constants';
import { createProjectTreeItem } from '@virtualmachines/tree/utils/projectTreeItems';
import { buildProjectMap } from '@virtualmachines/tree/utils/treeItemBuilders';
import {
  buildTreeItemQuery,
  getClusterTreeViewItemID,
  type TreeViewDataItemWithHref,
} from '@virtualmachines/tree/utils/utils';

import ClusterTreeIcon from '../ClusterTreeIcon';

import { type BuildClusterTreeNodeArgs } from '../types/types';

const createClusterProjectChildren = (
  clusterName: string,
  clusterSelected: boolean,
  args: BuildMultiClusterTreeChildrenArgs,
): TreeViewDataItem[] | undefined => {
  const projects = args.projectsByClusters[clusterName];
  if (isEmpty(projects)) {
    return;
  }

  const clusterVMs = args.vmsPerCluster[clusterName] ?? [];
  const projectMap = buildProjectMap(
    clusterVMs,
    args.vmName,
    args.currentVMTab,
    args.treeViewDataMap,
    args.foldersEnabled,
  );

  const sortedProjects = [...projects].sort((a, b) =>
    universalComparator(a.metadata?.name, b.metadata?.name),
  );

  const children: TreeViewDataItem[] = [];
  for (const project of sortedProjects) {
    const projectName = project.metadata?.name as string;
    if (!projectName) {
      continue;
    }

    children.push(
      createProjectTreeItem(
        projectName,
        projectMap,
        args.vmName,
        args.vmNamespace,
        args.treeViewDataMap,
        args.queryParams,
        clusterName,
        clusterSelected,
        false,
        args.currentFolderName,
      ),
    );
  }

  return children.length ? children : undefined;
};

export const buildClusterTreeNode = ({
  children,
  clusterName,
  defaultExpanded,
  queryParams,
  t,
}: BuildClusterTreeNodeArgs): TreeViewDataItemWithHref => ({
  children,
  defaultExpanded,
  hasBadge: false,
  href: `${getACMVMListURL(clusterName)}${buildTreeItemQuery({
    cluster: clusterName,
    query: queryParams,
  })}`,
  icon: createElement(ClusterTreeIcon, { t }),
  id: getClusterTreeViewItemID(clusterName),
  name: clusterName,
});

export const createClusterTreeItem = (
  clusterName: string,
  args: BuildMultiClusterTreeChildrenArgs,
  t: TFunction,
): TreeViewDataItemWithHref => {
  const clusterSelected = args.vmCluster === clusterName;
  const children = createClusterProjectChildren(clusterName, clusterSelected, args);
  const clusterTreeItem = buildClusterTreeNode({
    children,
    clusterName,
    defaultExpanded: clusterSelected,
    queryParams: args.queryParams,
    t,
  });

  if (clusterTreeItem.id) {
    args.treeViewDataMap[clusterTreeItem.id] = clusterTreeItem;
  }

  return clusterTreeItem;
};

export const createAllClustersTreeItem = (
  treeChildren: TreeViewDataItem[],
  queryParams: string | undefined,
  t: TFunction,
): TreeViewDataItemWithHref => ({
  children: treeChildren,
  defaultExpanded: true,
  hasBadge: false,
  href: `${getACMVMListURL()}${buildTreeItemQuery({ query: queryParams })}`,
  icon: createElement(ClusterIcon),
  id: ALL_CLUSTERS_ID,
  name: t(ALL_CLUSTERS),
});
