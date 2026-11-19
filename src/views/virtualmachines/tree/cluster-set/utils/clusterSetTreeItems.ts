import { createElement } from 'react';

import { isEmpty, universalComparator } from '@kubevirt-utils/utils/utils';
import { getACMVMListURL } from '@multicluster/urls';
import { type ClusterSetData } from '@stolostron/multicluster-sdk';
import { isNativeClusterSet } from '@virtualmachines/tree/multi-cluster/utils/multiClusterTreeChildren';
import { buildTreeItemQuery } from '@virtualmachines/tree/utils/query-params/treeItemQuery';
import {
  getClusterSetTreeViewItemID,
  type TreeViewDataItemWithHref,
} from '@virtualmachines/tree/utils/utils';

import ClusterSetTreeIcon from '../ClusterSetTreeIcon';

import {
  type BuildClusterSetTreeNodeArgs,
  type ClusterSetTreeGroupingArgs,
  type MapFleetClustersByClusterSet,
  type MapFleetClustersByClusterSetResult,
} from '../types/types';

export const getTreeClusterSetNames = (clusterSetNames: string[] | undefined): string[] =>
  (clusterSetNames ?? [])
    .filter((clusterSetName) => !isNativeClusterSet(clusterSetName))
    .sort((a, b) => universalComparator(a, b));

export const listFleetClustersInClusterSet = (
  clusterSetName: string,
  clusterSetData: ClusterSetData | undefined,
  clusterNames: string[] | undefined,
): string[] => {
  const fleetClusterNames = new Set(clusterNames ?? []);
  return [...(clusterSetData?.[clusterSetName] ?? [])]
    .filter((cluster) => fleetClusterNames.has(cluster))
    .sort((a, b) => universalComparator(a, b));
};

const groupClustersUnderClusterSet = (
  treeClusterSetNames: string[],
  clusterSetData: ClusterSetData | undefined,
  clusterNames: string[] | undefined,
): MapFleetClustersByClusterSet => {
  return treeClusterSetNames.reduce<MapFleetClustersByClusterSet>(
    (acc, clusterSetName) => {
      const clusters = listFleetClustersInClusterSet(clusterSetName, clusterSetData, clusterNames);
      if (isEmpty(clusters)) {
        return acc;
      }

      acc.groupedClusterNamesByClusterSet[clusterSetName] = clusters;
      acc.clusterSetNamesToDisplayInTree.push(clusterSetName);

      return acc;
    },
    { clusterSetNamesToDisplayInTree: [], groupedClusterNamesByClusterSet: {} },
  );
};

const getUngroupedClusterNames = (
  clusterNames: string[] | undefined,
  groupedClustersByClusterSet: Record<string, string[]>,
): string[] => {
  const assignedClusters = new Set(Object.values(groupedClustersByClusterSet).flat());
  return [...(clusterNames ?? [])]
    .filter((cluster) => !assignedClusters.has(cluster))
    .sort((a, b) => universalComparator(a, b));
};

export const getClusterNamesToDisplayInTree = ({
  clusterNames,
  clusterSetData,
  clusterSetNames,
}: ClusterSetTreeGroupingArgs): MapFleetClustersByClusterSetResult => {
  const treeClusterSetNames = getTreeClusterSetNames(clusterSetNames);

  const {
    clusterSetNamesToDisplayInTree,
    groupedClusterNamesByClusterSet: groupedClustersByClusterSet,
  } = groupClustersUnderClusterSet(treeClusterSetNames, clusterSetData, clusterNames);

  const ungroupedClusterNames = getUngroupedClusterNames(clusterNames, groupedClustersByClusterSet);

  return {
    clusterSetNamesToDisplayInTree,
    groupedClusterNamesByClusterSet: groupedClustersByClusterSet,
    ungroupedClusterNames,
  };
};

export const buildClusterSetTreeSingleNode = ({
  children,
  clusterNamesInSet,
  clusterSetName,
  defaultExpanded,
  queryParams,
  t,
  treeViewDataMap,
}: BuildClusterSetTreeNodeArgs): TreeViewDataItemWithHref => {
  const clusterSetTreeItem: TreeViewDataItemWithHref = {
    children,
    defaultExpanded,
    hasBadge: false,
    href: `${getACMVMListURL()}${buildTreeItemQuery({
      clusters: clusterNamesInSet,
      query: queryParams,
    })}`,
    icon: createElement(ClusterSetTreeIcon, { t }),
    id: getClusterSetTreeViewItemID(clusterSetName),
    name: clusterSetName,
  };

  if (clusterSetTreeItem.id) {
    treeViewDataMap[clusterSetTreeItem.id] ??= clusterSetTreeItem;
  }

  return clusterSetTreeItem;
};
