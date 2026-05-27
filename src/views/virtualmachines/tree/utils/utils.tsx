import React from 'react';
import { isEmpty } from 'lodash';

import { V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { tourGuideVM } from '@kubevirt-utils/components/GuidedTour/utils/constants';
import { ALL_NAMESPACES_SESSION_KEY, LOCAL_CLUSTER } from '@kubevirt-utils/hooks/constants';
import { t } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { SINGLE_CLUSTER_KEY } from '@kubevirt-utils/resources/constants';
import { isSystemNamespace } from '@kubevirt-utils/resources/namespace/helper';
import { getLabel, getName, getNamespace } from '@kubevirt-utils/resources/shared';
import { ROW_FILTERS_PREFIX } from '@kubevirt-utils/utils/constants';
import { universalComparator } from '@kubevirt-utils/utils/utils';
import { getCluster } from '@multicluster/helpers/selectors';
import { UseMulticlusterNamespacesReturn } from '@multicluster/hooks/useMulticlusterNamespaces';
import {
  getACMVMListURL,
  getVMListNamespacesURL,
  getVMListURL,
  getVMURL,
  isACMPath,
} from '@multicluster/urls';
import { Tooltip, TreeViewDataItem } from '@patternfly/react-core';
import {
  ClusterIcon,
  FolderIcon,
  FolderOpenIcon,
  ProjectDiagramIcon,
} from '@patternfly/react-icons';
import { signal } from '@preact/signals-react';
import { skipRowFilterPrefix } from '@search/utils/constants';
import { VirtualMachineRowFilterType } from '@virtualmachines/utils';

import { statusIcon } from '../icons/utils';

import {
  ALL_CLUSTERS_ID,
  CLUSTER_SELECTOR_PREFIX,
  FOLDER_SELECTOR_PREFIX,
  NAMESPACE_SELECTOR_PREFIX,
  VM_FOLDER_LABEL,
} from './constants';

export const treeDataMap = signal<Record<string, TreeViewDataItemWithHref>>(null);
export interface TreeViewDataItemWithHref extends TreeViewDataItem {
  href?: string;
}

export const getVMTreeViewItemID = (vmName: string, vmNamespace: string, vmCluster: string) =>
  `${vmCluster || SINGLE_CLUSTER_KEY}/${vmNamespace}/${vmName}`;

export const getNamespaceTreeViewItemID = (cluster: string | undefined, namespace: string) =>
  `${NAMESPACE_SELECTOR_PREFIX}/${cluster ?? SINGLE_CLUSTER_KEY}/${namespace}`;

export const getFolderTreeViewItemID = (
  cluster: string | undefined,
  namespace: string,
  folder: string,
) => `${FOLDER_SELECTOR_PREFIX}/${cluster ?? SINGLE_CLUSTER_KEY}/${namespace}/${folder}`;

export const getClusterTreeViewItemID = (clusterName: string) =>
  `${CLUSTER_SELECTOR_PREFIX}/${clusterName}`;

const buildNamespaceMap = (
  vms: V1VirtualMachine[],
  currentPageVMName: string,
  currentVMTab: string,
  treeViewDataMap: Record<string, TreeViewDataItemWithHref>,
  foldersEnabled: boolean,
  isTourRunning = false,
) => {
  if (isEmpty(vms)) return {};

  const namespaceMap: Record<
    string,
    {
      count: number;
      folders: Record<string, TreeViewDataItemWithHref[]>;
      ungrouped: TreeViewDataItemWithHref[];
    }
  > = {};

  vms?.forEach((vm) => {
    const vmNamespace = getNamespace(vm);
    const vmName = getName(vm);
    const vmCluster = getCluster(vm);
    const folder = foldersEnabled ? getLabel(vm, VM_FOLDER_LABEL) : null;
    const vmTreeItemID = getVMTreeViewItemID(vmName, vmNamespace, vmCluster);
    const VMStatusIcon = statusIcon[vm?.status?.printableStatus];

    const vmTreeItem: TreeViewDataItemWithHref = {
      defaultExpanded: currentPageVMName && currentPageVMName === vmName,
      href: isTourRunning
        ? undefined
        : `${getVMURL(vmCluster, vmNamespace, vmName)}/${currentVMTab}`,
      icon: <VMStatusIcon />,
      id: vmTreeItemID,
      name: vmName,
    };

    if (!treeViewDataMap[vmTreeItemID]) {
      treeViewDataMap[vmTreeItemID] = vmTreeItem;
    }

    if (!namespaceMap[vmNamespace]) {
      namespaceMap[vmNamespace] = { count: 0, folders: {}, ungrouped: [] };
    }

    namespaceMap[vmNamespace].count++;
    if (folder) {
      if (!namespaceMap[vmNamespace].folders[folder]) {
        namespaceMap[vmNamespace].folders[folder] = [];
      }
      return namespaceMap[vmNamespace].folders[folder].push(vmTreeItem);
    }

    namespaceMap[vmNamespace].ungrouped.push(vmTreeItem);
  });

  return namespaceMap;
};

const createFolderTreeItems = (
  folders: Record<string, TreeViewDataItemWithHref[]>,
  namespace: string,
  currentPageVMName: string,
  treeViewDataMap: Record<string, TreeViewDataItemWithHref>,
  queryParams?: string,
  cluster?: string,
): TreeViewDataItemWithHref[] =>
  Object.entries(folders).map(([folder, vmItems]) => {
    const folderTreeItemID = getFolderTreeViewItemID(cluster, namespace, folder);
    const folderExpanded =
      currentPageVMName && vmItems.some((item) => (item.name as string) === currentPageVMName);

    const folderTreeItem: TreeViewDataItemWithHref = {
      children: vmItems,
      defaultExpanded: folderExpanded,
      expandedIcon: <FolderOpenIcon />,
      href: `${getVMListNamespacesURL(cluster, namespace)}${queryParams || ''}`,
      icon: <FolderIcon />,
      id: folderTreeItemID,
      name: folder,
    };

    if (!treeViewDataMap[folderTreeItemID]) {
      treeViewDataMap[folderTreeItemID] = folderTreeItem;
    }

    return folderTreeItem;
  });

const createNamespaceTreeItem = (
  namespace: string,
  namespaceMap: Record<string, any>,
  currentPageVMName: string,
  currentPageNamespace: string,
  treeViewDataMap: Record<string, TreeViewDataItemWithHref>,
  queryParams?: string,
  cluster?: string,
  clusterSelected = true,
  isTourRunning = false,
): TreeViewDataItemWithHref => {
  const namespaceFolders = createFolderTreeItems(
    namespaceMap[namespace]?.folders || {},
    namespace,
    currentPageVMName,
    treeViewDataMap,
    queryParams,
    cluster,
  );

  const sortNamespaceFolders = namespaceFolders.sort((folderA, folderB) =>
    folderA.id.localeCompare(folderB.id),
  );

  const namespaceChildren = [...sortNamespaceFolders, ...(namespaceMap[namespace]?.ungrouped || [])];

  const namespaceTreeItemID = getNamespaceTreeViewItemID(cluster, namespace);
  const namespaceTreeItem: TreeViewDataItemWithHref = {
    children: namespaceChildren,
    customBadgeContent: namespaceMap[namespace]?.count || '0',
    defaultExpanded: (currentPageNamespace === namespace && clusterSelected) || isTourRunning,
    href: `${getVMListNamespacesURL(cluster, namespace)}${
      removeFilterQueryParams(queryParams) || ''
    }`,
    icon: (
      <Tooltip content={t('Namespace')}>
        <ProjectDiagramIcon />
      </Tooltip>
    ),
    id: namespaceTreeItemID,
    name: namespace,
  };

  if (!treeViewDataMap[namespaceTreeItemID]) {
    treeViewDataMap[namespaceTreeItemID] = namespaceTreeItem;
  }

  return namespaceTreeItem;
};

const createAllNamespacesTreeItem = (
  treeViewData: TreeViewDataItemWithHref[],
  treeViewDataMap: Record<string, TreeViewDataItemWithHref>,
  queryParams?: string,
): TreeViewDataItemWithHref => {
  const allNamespacesTreeItem: TreeViewDataItemWithHref = {
    children: treeViewData,
    defaultExpanded: true,
    hasBadge: false,
    href: `${getVMListURL()}${removeFilterQueryParams(queryParams) || ''}`,
    icon: <ClusterIcon />,
    id: ALL_NAMESPACES_SESSION_KEY,
    name: t(LOCAL_CLUSTER),
  };
  if (!treeViewDataMap[ALL_NAMESPACES_SESSION_KEY]) {
    treeViewDataMap[ALL_NAMESPACES_SESSION_KEY] = allNamespacesTreeItem;
  }
  treeDataMap.value = treeViewDataMap;
  return allNamespacesTreeItem;
};

export const getVMInfoFromPathname = (pathname: string) => {
  const splitPathname = pathname.split('/');
  const isACMTreeView = isACMPath(pathname);

  if (isACMTreeView) {
    const currentVMTab = splitPathname?.[8] || '';
    const vmName = splitPathname?.[7];
    const vmNamespace = splitPathname?.[6];
    const vmCluster = splitPathname?.[4];

    return { currentVMTab, vmCluster, vmName, vmNamespace };
  }

  const currentVMTab = splitPathname?.[6] || '';
  const vmName = splitPathname?.[5];
  const vmNamespace = splitPathname?.[3];

  return { currentVMTab, vmCluster: null, vmName, vmNamespace };
};

export const createSingleClusterTreeViewData = (
  namespaceNames: string[],
  vms: V1VirtualMachine[],
  pathname: string,
  foldersEnabled: boolean,
  queryParams: string,
  isTourRunning = false,
): TreeViewDataItem[] => {
  const { currentVMTab, vmName, vmNamespace } = getVMInfoFromPathname(pathname);

  const namespacesToShow = isTourRunning ? [getNamespace(tourGuideVM)] : namespaceNames;
  const vmsToShow = isTourRunning ? [tourGuideVM] : vms;

  const treeViewDataMap: Record<string, TreeViewDataItem> = {};
  const namespaceMap = buildNamespaceMap(
    vmsToShow,
    vmName,
    currentVMTab,
    treeViewDataMap,
    foldersEnabled,
    isTourRunning,
  );

  const treeViewData = namespacesToShow.map((namespace) =>
    createNamespaceTreeItem(
      namespace,
      namespaceMap,
      vmName,
      vmNamespace,
      treeViewDataMap,
      queryParams,
      undefined,
      true,
      isTourRunning,
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

const getVMsPerCluster = (vms: V1VirtualMachine[]): Record<string, V1VirtualMachine[]> => {
  return vms?.reduce((acc, vm) => {
    const cluster = getCluster(vm);

    if (!acc[cluster]) {
      acc[cluster] = [];
    }
    acc[cluster].push(vm);
    return acc;
  }, {});
};

export const createMultiClusterTreeViewData = (
  vms: V1VirtualMachine[],
  pathname: string,
  foldersEnabled: boolean,
  namespacesByClusters: UseMulticlusterNamespacesReturn['namespacesByCluster'],
  allClustersLabel: string,
  queryParams?: string,
  clusterNames?: string[],
): TreeViewDataItem[] => {
  const { currentVMTab, vmCluster, vmName, vmNamespace } = getVMInfoFromPathname(pathname);

  const vmsPerCluster = getVMsPerCluster(vms) ?? {};

  const treeViewDataMap: Record<string, TreeViewDataItem> = {};

  const treeWithClusters = clusterNames
    ?.sort((a, b) => universalComparator(a, b))
    ?.map((clusterName) => {
      const clusterVMs = vmsPerCluster[clusterName] ?? [];

      const clusterNamespaces = namespacesByClusters[clusterName]
        ?.map((namespace) => getName(namespace))
        ?.sort((a, b) => universalComparator(a, b));

      const namespaceMap = buildNamespaceMap(
        clusterVMs,
        vmName,
        currentVMTab,
        treeViewDataMap,
        foldersEnabled,
      );

      const clusterSelected = vmCluster === clusterName;

      const treeViewData = clusterNamespaces?.map((namespace) =>
        createNamespaceTreeItem(
          namespace,
          namespaceMap,
          vmName,
          vmNamespace,
          treeViewDataMap,
          queryParams,
          clusterName,
          clusterSelected,
        ),
      );

      const clusterTreeItem: TreeViewDataItemWithHref = {
        children: treeViewData,
        defaultExpanded: clusterSelected,
        hasBadge: false,
        href: `${getACMVMListURL(clusterName)}${removeFilterQueryParams(queryParams) || ''}`,
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
    href: `${getACMVMListURL()}${removeFilterQueryParams(queryParams) || ''}`,
    icon: <ClusterIcon />,
    id: ALL_CLUSTERS_ID,
    name: allClustersLabel,
  };

  treeViewDataMap[ALL_CLUSTERS_ID] = allClustersTreeItem;
  treeDataMap.value = treeViewDataMap;

  return [allClustersTreeItem];
};

const nameMatchesSearch = (item: TreeViewDataItem, searchText: string): boolean =>
  (item.name as string).toLowerCase().includes(searchText.toLowerCase());

const isAllNamespacesItem = (item: TreeViewDataItem): boolean =>
  item.id === ALL_NAMESPACES_SESSION_KEY;

const isClusterItem = (item: TreeViewDataItem): boolean =>
  item.id?.startsWith(CLUSTER_SELECTOR_PREFIX);

const isNamespaceItem = (item: TreeViewDataItem): boolean =>
  item.id?.startsWith(NAMESPACE_SELECTOR_PREFIX);

const isFolderItem = (item: TreeViewDataItem): boolean =>
  item.id?.startsWith(FOLDER_SELECTOR_PREFIX);

const isVMItem = (item: TreeViewDataItem): boolean => !item.children;

// searches for clusters, namespaces and folders
export const filterItems = (item: TreeViewDataItem, input: string) => {
  if (isVMItem(item)) {
    return false;
  }

  if (
    nameMatchesSearch(item, input) &&
    item.id !== ALL_NAMESPACES_SESSION_KEY &&
    item.id !== ALL_CLUSTERS_ID
  ) {
    return true;
  }

  if (item.children) {
    return (
      (item.children = item.children
        .map((opt) => Object.assign({}, opt))
        .filter((child) => filterItems(child, input))).length > 0
    );
  }
};

// Show namespaces that have VMs all the time
// Show / hide namespaces that have no VMs depending on showEmptyNamespaces flag
// Hide system namespaces unless they contain VMs
export const filterNamespaceItems = (item: TreeViewDataItem, showEmptyNamespaces: boolean) => {
  if (isNamespaceItem(item)) {
    const hasVMs = item.children?.length > 0;
    if (hasVMs) return true;

    const namespaceName = item.name as string;
    if (isSystemNamespace(namespaceName)) return false;

    return showEmptyNamespaces;
  }

  if (item.children) {
    item.children = item.children
      .map((opt) => Object.assign({}, opt))
      .filter((child) => filterNamespaceItems(child, showEmptyNamespaces));

    return item.children.length > 0 || isClusterItem(item) || isAllNamespacesItem(item);
  }
};

export const getAllTreeViewItems = (treeData: TreeViewDataItem[]): TreeViewDataItem[] => {
  return treeData
    ?.map((treeItem) => [treeItem, ...getAllTreeViewItems(treeItem.children || [])])
    ?.flat();
};

export const getAllTreeViewVMItems = (treeData: TreeViewDataItem[]): TreeViewDataItem[] =>
  getAllTreeViewItems(treeData).filter(isVMItem);

export const getAllRightClickableTreeViewItems = (
  treeData: TreeViewDataItem[],
): TreeViewDataItem[] =>
  getAllTreeViewItems(treeData).filter((treeItem) => !treeItem.id.startsWith(ALL_CLUSTERS_ID));

export const getAllTreeViewFolderItems = (treeData: TreeViewDataItem[]): TreeViewDataItem[] =>
  getAllTreeViewItems(treeData)?.filter((treeItem) => isFolderItem(treeItem)) || [];

export const getAllTreeViewNamespaceItems = (treeData: TreeViewDataItem[]): TreeViewDataItem[] =>
  getAllTreeViewItems(treeData).filter((treeItem) => isNamespaceItem(treeItem));

export const getAllTreeViewClusterItems = (treeData: TreeViewDataItem[]): TreeViewDataItem[] =>
  getAllTreeViewItems(treeData).filter((treeItem) => isClusterItem(treeItem));

export const getMatchedNamespaceItems = (
  treeData: TreeViewDataItem[],
  searchText: string,
): TreeViewDataItem[] =>
  getAllTreeViewNamespaceItems(treeData).filter((item) => nameMatchesSearch(item, searchText));

export const getMatchedClusterItems = (
  treeData: TreeViewDataItem[],
  searchText: string,
): TreeViewDataItem[] =>
  getAllTreeViewClusterItems(treeData).filter((item) => nameMatchesSearch(item, searchText));

export const highlightMatchedTreeItems = (
  treeData: TreeViewDataItem[],
  searchText: string,
): TreeViewDataItem[] => {
  if (!searchText) return treeData;

  return treeData.map((item) => {
    const copy = { ...item };

    if ((isNamespaceItem(copy) || isClusterItem(copy)) && nameMatchesSearch(copy, searchText)) {
      copy.name = <b className="pf-v6-u-font-weight-bold">{copy.name}</b>;
    }

    if (copy.children) {
      copy.children = highlightMatchedTreeItems(copy.children, searchText);
    }

    return copy;
  });
};

export const getClusterElement = (treeData: TreeViewDataItem[]): HTMLElement => {
  const root = treeData?.[0];
  const targetId = root?.id === ALL_CLUSTERS_ID ? root?.children?.[0]?.id : root?.id;
  return document.getElementById(targetId)?.querySelector('.pf-v6-c-tree-view__node-text');
};

const removeFilterQueryParams = (query?: string): string => {
  const params = new URLSearchParams(query ?? '');

  [...params.keys()].forEach((key) => {
    if (
      key.startsWith(ROW_FILTERS_PREFIX) ||
      skipRowFilterPrefix.has(key as VirtualMachineRowFilterType)
    ) {
      params.delete(key);
    }
  });

  return params.size > 0 ? `?${params.toString()}` : '';
};
