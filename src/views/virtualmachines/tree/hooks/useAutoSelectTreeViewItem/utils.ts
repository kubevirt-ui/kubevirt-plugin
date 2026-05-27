import { isSystemNamespace } from '@kubevirt-utils/resources/namespace/helper';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { OnFilterChange } from '@openshift-console/dynamic-plugin-sdk';

import { ALL_CLUSTERS_ID, SHOW } from '../../utils/constants';
import {
  getClusterTreeViewItemID,
  getNamespaceTreeViewItemID,
  TreeViewDataItemWithHref,
} from '../../utils/utils';

export type UseAutoSelectTreeViewItemProps = {
  dataMap: Record<string, TreeViewDataItemWithHref>;
  loaded: boolean;
  onFilterChange?: OnFilterChange;
};

/**
 * Returns true when the namespace node will be rendered in the tree (i.e. not hidden
 * by the "show empty namespaces" filter). Mirrors the logic in `filterNamespaceItems`:
 *  - namespaces with VMs are always visible
 *  - empty system namespaces are always hidden
 *  - empty non-system namespaces are shown only when showEmptyNamespaces === SHOW
 */
export const isNamespaceVisibleInTree = (
  namespaceTreeItem: TreeViewDataItemWithHref,
  showEmptyNamespaces: string,
): boolean => {
  const hasVMs = !isEmpty(namespaceTreeItem.children);
  if (hasVMs) return true;

  if (isSystemNamespace(namespaceTreeItem.name as string)) return false;

  return showEmptyNamespaces === SHOW;
};

export const getClusterTreeItem = (
  dataMap: Record<string, TreeViewDataItemWithHref>,
  cluster: string | undefined,
): TreeViewDataItemWithHref | undefined =>
  dataMap?.[cluster ? getClusterTreeViewItemID(cluster) : ALL_CLUSTERS_ID];

export const getNamespaceTreeItem = (
  dataMap: Record<string, TreeViewDataItemWithHref>,
  clusterKey: string,
  namespace: string,
): TreeViewDataItemWithHref | undefined =>
  dataMap?.[getNamespaceTreeViewItemID(clusterKey, namespace)];
