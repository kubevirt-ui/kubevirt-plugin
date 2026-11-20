import { type TFunction } from 'i18next';

import { type TreeViewDataItem } from '@patternfly/react-core';
import { createClusterTreeItem } from '@virtualmachines/tree/cluster/utils/clusterTreeItems';
import {
  buildClusterSetTreeSingleNode,
  getClusterNamesToDisplayInTree,
} from '@virtualmachines/tree/cluster-set/utils/clusterSetTreeItems';
import { isClusterSetSelectedInQuery } from '@virtualmachines/tree/cluster-set/utils/clusterSetTreeSelection';

import { DEFAULT_CLUSTER_SET_KEY, GLOBAL_CLUSTER_SET_KEY } from '../consts/constants';
import { type BuildMultiClusterTreeChildrenArgs } from '../types/types';

const buildClusterSetTreeNodes = (
  clusterSetNamesToDisplayInTree: string[],
  groupedClusterNamesByClusterSet: Record<string, string[]>,
  args: BuildMultiClusterTreeChildrenArgs,
  t: TFunction,
): TreeViewDataItem[] => {
  return clusterSetNamesToDisplayInTree.map((clusterSetName) => {
    const clustersInClusterSet = groupedClusterNamesByClusterSet[clusterSetName] ?? [];
    const clusterChildren = clustersInClusterSet.map((clusterName) =>
      createClusterTreeItem(clusterName, args, t),
    );

    return buildClusterSetTreeSingleNode({
      children: clusterChildren,
      clusterNamesInSet: clustersInClusterSet,
      clusterSetName,
      defaultExpanded:
        isClusterSetSelectedInQuery(clustersInClusterSet, args.queryParams) ||
        clustersInClusterSet.includes(args.vmCluster),
      queryParams: args.queryParams,
      t,
      treeViewDataMap: args.treeViewDataMap,
    });
  });
};

export const buildMultiClusterTreeChildren = (
  args: BuildMultiClusterTreeChildrenArgs,
  t: TFunction,
): TreeViewDataItem[] => {
  const { clusterSetNamesToDisplayInTree, groupedClusterNamesByClusterSet, ungroupedClusterNames } =
    getClusterNamesToDisplayInTree(args);

  const clusterSetNodes = buildClusterSetTreeNodes(
    clusterSetNamesToDisplayInTree,
    groupedClusterNamesByClusterSet,
    args,
    t,
  );

  const ungroupedClusterNodes = ungroupedClusterNames.map((clusterName) =>
    createClusterTreeItem(clusterName, args, t),
  );

  return [...clusterSetNodes, ...ungroupedClusterNodes];
};

export const isNativeClusterSet = (clusterSetName: string): boolean =>
  clusterSetName === GLOBAL_CLUSTER_SET_KEY || clusterSetName === DEFAULT_CLUSTER_SET_KEY;
