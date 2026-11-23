import { type TFunction } from 'i18next';

import { type TreeViewDataItem } from '@patternfly/react-core';
import { type BuildMultiClusterTreeChildrenArgs } from '@virtualmachines/tree/multi-cluster/types/types';
import { type BuildParentTreeNodeArgs } from '@virtualmachines/tree/types/types';

export type ClusterSetTreeGroupingArgs = Pick<
  BuildMultiClusterTreeChildrenArgs,
  'clusterNames' | 'clusterSetData' | 'clusterSetNames'
>;

export type MapFleetClustersByClusterSet = {
  clusterSetNamesToDisplayInTree: string[];
  groupedClusterNamesByClusterSet: Record<string, string[]>;
};

export type MapFleetClustersByClusterSetResult = MapFleetClustersByClusterSet & {
  ungroupedClusterNames: string[];
};

export type BuildClusterSetTreeNodeArgs = BuildParentTreeNodeArgs & {
  children: TreeViewDataItem[];
  clusterNamesInSet: string[];
  clusterSetName: string;
  t: TFunction;
  treeViewDataMap: Record<string, TreeViewDataItem>;
};
