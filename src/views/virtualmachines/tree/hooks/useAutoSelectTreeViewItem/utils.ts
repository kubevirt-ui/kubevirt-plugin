import { ALL_NAMESPACES, ALL_NAMESPACES_SESSION_KEY } from '@kubevirt-utils/hooks/constants';
import { SINGLE_CLUSTER_KEY } from '@kubevirt-utils/resources/constants';
import { isSystemNamespace } from '@kubevirt-utils/resources/namespace/helper';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { getVMListURL } from '@multicluster/urls';
import { VirtualMachineRowFilterType } from '@virtualmachines/utils';

import { ALL_CLUSTERS_ID, FOLDER_SELECTOR_PREFIX, SHOW } from '../../utils/constants';
import {
  getClusterTreeViewItemID,
  getProjectTreeViewItemID,
  type TreeViewDataItemWithHref,
} from '../../utils/utils';

export type UseAutoSelectTreeViewItemProps = {
  dataMap: Record<string, TreeViewDataItemWithHref>;
  loaded: boolean;
};

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

export const selectACMTreeItem = (
  dataMap: Record<string, TreeViewDataItemWithHref>,
  cluster: string | undefined,
  ns: string | undefined,
  loaded: boolean,
  selectedId: string | undefined,
  searchParams: URLSearchParams,
  effectiveShowEmptyProjects: string,
  setSelected: (item: TreeViewDataItemWithHref) => void,
  navigate: (path: string) => void,
): void => {
  if (!ns || !cluster || !loaded) {
    const clusterTreeItem = getClusterTreeItem(dataMap, cluster);
    if (clusterTreeItem && selectedId !== clusterTreeItem.id) {
      setSelected(clusterTreeItem);
    }
    return;
  }

  const folderPrefix = `${FOLDER_SELECTOR_PREFIX}/${cluster}/${ns}/`;
  const hasFolderFilter = searchParams.has(VirtualMachineRowFilterType.Group);
  if (selectedId?.startsWith(folderPrefix) && hasFolderFilter) return;

  const projectTreeItem = getProjectTreeItem(dataMap, cluster, ns);

  if (projectTreeItem && isProjectVisibleInTree(projectTreeItem, effectiveShowEmptyProjects)) {
    if (selectedId !== projectTreeItem.id) {
      setSelected(projectTreeItem);
    }
    return;
  }

  const clusterTreeItem = getClusterTreeItem(dataMap, cluster);
  if (clusterTreeItem?.href) {
    setSelected(clusterTreeItem);
    navigate(clusterTreeItem.href);
  }
};

export type NamespaceSelectionArgs = {
  dataMap: Record<string, TreeViewDataItemWithHref>;
  effectiveShowEmptyProjects: string;
  navigate: (path: string) => void;
  ns: string | undefined;
  setLastNamespace: (ns: string) => void;
  setSelected: (item: TreeViewDataItemWithHref) => void;
};

export const selectNamespaceOrFallback = ({
  dataMap,
  effectiveShowEmptyProjects,
  navigate,
  ns,
  setLastNamespace,
  setSelected,
}: NamespaceSelectionArgs): void => {
  if (ns) {
    const projectTreeItem = getProjectTreeItem(dataMap, SINGLE_CLUSTER_KEY, ns);

    if (projectTreeItem && isProjectVisibleInTree(projectTreeItem, effectiveShowEmptyProjects)) {
      setSelected(projectTreeItem);
      return;
    }

    navigate(getVMListURL());
  }

  setSelected(dataMap?.[ALL_NAMESPACES_SESSION_KEY]);
  setLastNamespace(ALL_NAMESPACES);
};
