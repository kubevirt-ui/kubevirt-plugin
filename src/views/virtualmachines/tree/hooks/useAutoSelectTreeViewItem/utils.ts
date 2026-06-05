import { isSystemNamespace } from '@kubevirt-utils/resources/namespace/helper';
import { isEmpty } from '@kubevirt-utils/utils/utils';

import { ALL_CLUSTERS_ID, SHOW } from '../../utils/constants';
import {
  getClusterTreeViewItemID,
  getProjectTreeViewItemID,
  TreeViewDataItemWithHref,
} from '../../utils/utils';

export type UseAutoSelectTreeViewItemProps = {
  dataMap: Record<string, TreeViewDataItemWithHref>;
  loaded: boolean;
};

/**
 * Returns true when the project node will be rendered in the tree (i.e. not hidden
 * by the "show empty projects" filter). Mirrors the logic in `filterNamespaceItems`:
 *  - namespaces with VMs are always visible
 *  - empty system namespaces are always hidden
 *  - empty non-system namespaces are shown only when showEmptyProjects === SHOW
 */
export const isProjectVisibleInTree = (
  projectTreeItem: TreeViewDataItemWithHref,
  showEmptyProjects: string,
): boolean => {
  const hasVMs = !isEmpty(projectTreeItem.children);
  if (hasVMs) return true;

  if (isSystemNamespace(projectTreeItem.name as string)) return false;

  return showEmptyProjects === SHOW;
};

export const getClusterTreeItem = (
  dataMap: Record<string, TreeViewDataItemWithHref>,
  cluster: string | undefined,
): TreeViewDataItemWithHref | undefined =>
  dataMap?.[cluster ? getClusterTreeViewItemID(cluster) : ALL_CLUSTERS_ID];

export const getProjectTreeItem = (
  dataMap: Record<string, TreeViewDataItemWithHref>,
  clusterKey: string,
  namespace: string,
): TreeViewDataItemWithHref | undefined =>
  dataMap?.[getProjectTreeViewItemID(clusterKey, namespace)];
