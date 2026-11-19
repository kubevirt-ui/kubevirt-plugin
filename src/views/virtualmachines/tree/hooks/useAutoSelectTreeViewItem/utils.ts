import { ALL_NAMESPACES, ALL_NAMESPACES_SESSION_KEY } from '@kubevirt-utils/hooks/constants';
import { SINGLE_CLUSTER_KEY } from '@kubevirt-utils/resources/constants';
import { isSystemNamespace } from '@kubevirt-utils/resources/namespace/helper';
import { CLUSTER_LIST_FILTER_TYPE } from '@kubevirt-utils/utils/constants';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { getVMListURL } from '@multicluster/urls';
import { VirtualMachineRowFilterType } from '@virtualmachines/utils';

import {
  ALL_CLUSTERS_ID,
  CLUSTER_SET_SELECTOR_PREFIX,
  FOLDER_SELECTOR_PREFIX,
  SHOW,
} from '../../utils/constants';
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

const selectTreeItemIfChanged = (
  treeItem: TreeViewDataItemWithHref | undefined,
  selectedId: string | undefined,
  setSelected: (item: TreeViewDataItemWithHref) => void,
): void => {
  if (treeItem && selectedId !== treeItem.id) {
    setSelected(treeItem);
  }
};

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
    const clustersInQuery = searchParams.getAll(CLUSTER_LIST_FILTER_TYPE).filter(Boolean);
    const preserveClusterSetTreeSelection =
      selectedId?.startsWith(CLUSTER_SET_SELECTOR_PREFIX) && !isEmpty(clustersInQuery);

    if (preserveClusterSetTreeSelection) {
      return;
    }

    selectTreeItemIfChanged(getClusterTreeItem(dataMap, cluster), selectedId, setSelected);
    return;
  }

  const folderPrefix = `${FOLDER_SELECTOR_PREFIX}/${cluster}/${ns}/`;
  const hasFolderFilter = searchParams.has(VirtualMachineRowFilterType.Group);
  if (selectedId?.startsWith(folderPrefix) && hasFolderFilter) return;

  const projectTreeItem = getProjectTreeItem(dataMap, cluster, ns);

  const projectVisibleInTree =
    projectTreeItem && isProjectVisibleInTree(projectTreeItem, effectiveShowEmptyProjects);

  if (projectVisibleInTree) {
    selectTreeItemIfChanged(projectTreeItem, selectedId, setSelected);
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
