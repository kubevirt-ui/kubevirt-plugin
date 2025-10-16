import React from 'react';
import { isEmpty } from 'lodash';

import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import {
  runningTourSignal,
  tourGuideVM,
} from '@kubevirt-utils/components/GuidedTour/utils/constants';
import { ALL_NAMESPACES_SESSION_KEY, ALL_PROJECTS } from '@kubevirt-utils/hooks/constants';
import { SINGLE_CLUSTER_KEY } from '@kubevirt-utils/resources/constants';
import { getLabel, getName, getNamespace } from '@kubevirt-utils/resources/shared';
import { getCluster } from '@multicluster/helpers/selectors';
import { UseMulticlusterNamespacesReturnType } from '@multicluster/hooks/useMulticlusterProjects';
import {
  getACMVMListURL,
  getVMListNamespacesURL,
  getVMListURL,
  getVMURL,
  isACMPath,
} from '@multicluster/urls';
import { TreeViewDataItem } from '@patternfly/react-core';
import {
  ClusterIcon,
  FolderIcon,
  FolderOpenIcon,
  ProjectDiagramIcon,
} from '@patternfly/react-icons';
import { signal } from '@preact/signals-react';

import { statusIcon } from '../icons/utils';

import {
  ALL_CLUSTERS_ID,
  CLUSTER_SELECTOR_PREFIX,
  FOLDER_SELECTOR_PREFIX,
  PROJECT_SELECTOR_PREFIX,
  SYSTEM_NAMESPACES,
  SYSTEM_NAMESPACES_PREFIX,
  VM_FOLDER_LABEL,
} from './constants';

export const treeDataMap = signal<Record<string, TreeViewDataItemWithHref>>(null);
export interface TreeViewDataItemWithHref extends TreeViewDataItem {
  href?: string;
}

const buildProjectMap = (
  vms: V1VirtualMachine[],
  currentPageVMName: string,
  currentVMTab: string,
  treeViewDataMap: Record<string, TreeViewDataItemWithHref>,
  foldersEnabled: boolean,
) => {
  if (isEmpty(vms)) return {};

  const projectMap: Record<
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
    const vmTreeItemID = `${vmCluster || SINGLE_CLUSTER_KEY}/${vmNamespace}/${vmName}`;
    const VMStatusIcon = statusIcon[vm?.status?.printableStatus];

    const vmTreeItem: TreeViewDataItemWithHref = {
      defaultExpanded: currentPageVMName && currentPageVMName === vmName,
      href: `${getVMURL(vmCluster, vmNamespace, vmName)}/${currentVMTab}`,
      icon: <VMStatusIcon />,
      id: vmTreeItemID,
      name: vmName,
    };

    if (!treeViewDataMap[vmTreeItemID]) {
      treeViewDataMap[vmTreeItemID] = vmTreeItem;
    }

    if (!projectMap[vmNamespace]) {
      projectMap[vmNamespace] = { count: 0, folders: {}, ungrouped: [] };
    }

    projectMap[vmNamespace].count++;
    if (folder) {
      if (!projectMap[vmNamespace].folders[folder]) {
        projectMap[vmNamespace].folders[folder] = [];
      }
      return projectMap[vmNamespace].folders[folder].push(vmTreeItem);
    }

    projectMap[vmNamespace].ungrouped.push(vmTreeItem);
  });

  return projectMap;
};

const createFolderTreeItems = (
  folders: Record<string, TreeViewDataItemWithHref[]>,
  project: string,
  currentPageVMName: string,
  treeViewDataMap: Record<string, TreeViewDataItemWithHref>,
  queryParams?: string,
  cluster?: string,
): TreeViewDataItemWithHref[] =>
  Object.entries(folders).map(([folder, vmItems]) => {
    const folderTreeItemID = `${FOLDER_SELECTOR_PREFIX}/${
      cluster || SINGLE_CLUSTER_KEY
    }/${project}/${folder}`;
    const folderExpanded =
      currentPageVMName && vmItems.some((item) => (item.name as string) === currentPageVMName);

    const folderTreeItem: TreeViewDataItemWithHref = {
      children: vmItems,
      defaultExpanded: folderExpanded,
      expandedIcon: <FolderOpenIcon />,
      href: `${getVMListNamespacesURL(cluster, project)}${queryParams || ''}`,
      icon: <FolderIcon />,
      id: folderTreeItemID,
      name: folder,
    };

    if (!treeViewDataMap[folderTreeItemID]) {
      treeViewDataMap[folderTreeItemID] = folderTreeItem;
    }

    return folderTreeItem;
  });

const createProjectTreeItem = (
  project: string,
  projectMap: Record<string, any>,
  currentPageVMName: string,
  currentPageNamespace: string,
  treeViewDataMap: Record<string, TreeViewDataItemWithHref>,
  queryParams?: string,
  cluster?: string,
  clusterSelected = true,
): TreeViewDataItemWithHref => {
  const projectFolders = createFolderTreeItems(
    projectMap[project]?.folders || {},
    project,
    currentPageVMName,
    treeViewDataMap,
    queryParams,
    cluster,
  );

  const sortProjectFolders = projectFolders.sort((folderA, folderB) =>
    folderA.id.localeCompare(folderB.id),
  );

  const projectChildren = [...sortProjectFolders, ...(projectMap[project]?.ungrouped || [])];

  const projectTreeItemID = `${PROJECT_SELECTOR_PREFIX}/${
    cluster ?? SINGLE_CLUSTER_KEY
  }/${project}`;
  const projectTreeItem: TreeViewDataItemWithHref = {
    children: projectChildren,
    customBadgeContent: projectMap[project]?.count || '0',
    defaultExpanded: currentPageNamespace === project && clusterSelected,
    href: `${getVMListNamespacesURL(cluster, project)}${queryParams || ''}`,
    icon: <ProjectDiagramIcon />,
    id: projectTreeItemID,
    name: project,
  };

  if (!treeViewDataMap[projectTreeItemID]) {
    treeViewDataMap[projectTreeItemID] = projectTreeItem;
  }

  return projectTreeItem;
};

const createAllNamespacesTreeItem = (
  treeViewData: TreeViewDataItemWithHref[],
  treeViewDataMap: Record<string, TreeViewDataItemWithHref>,
  projectMap: Record<string, any>,
  queryParams?: string,
  cluster?: string,
): TreeViewDataItemWithHref => {
  const allVMsCount = Object.keys(projectMap).reduce((acc, ns) => {
    acc += projectMap[ns]?.count;
    return acc;
  }, 0);

  const allNamespacesTreeItem: TreeViewDataItemWithHref = {
    children: treeViewData,
    customBadgeContent: allVMsCount || '0',
    defaultExpanded: true,
    href: `${getVMListURL(cluster)}${queryParams || ''}`,
    icon: <ProjectDiagramIcon />,
    id: ALL_NAMESPACES_SESSION_KEY,
    name: ALL_PROJECTS,
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
    const vmNamespace = splitPathname?.[5];
    const vmCluster = splitPathname?.[3];

    return { currentVMTab, vmCluster, vmName, vmNamespace };
  }

  const currentVMTab = splitPathname?.[6] || '';
  const vmName = splitPathname?.[5];
  const vmNamespace = splitPathname?.[3];

  return { currentVMTab, vmCluster: null, vmName, vmNamespace };
};

export const createSingleClusterTreeViewData = (
  projectNames: string[],
  vms: V1VirtualMachine[],
  isAdmin: boolean,
  pathname: string,
  foldersEnabled: boolean,
  queryParams: string,
): TreeViewDataItem[] => {
  const { currentVMTab, vmName, vmNamespace } = getVMInfoFromPathname(pathname);

  const projectsToShow = runningTourSignal.value ? [getNamespace(tourGuideVM)] : projectNames;
  const vmsToShow = runningTourSignal.value ? [tourGuideVM] : vms;

  const treeViewDataMap: Record<string, TreeViewDataItem> = {};
  const projectMap = buildProjectMap(
    vmsToShow,
    vmName,
    currentVMTab,
    treeViewDataMap,
    foldersEnabled,
  );

  const treeViewData = projectsToShow.map((project) =>
    createProjectTreeItem(project, projectMap, vmName, vmNamespace, treeViewDataMap, queryParams),
  );

  const allNamespacesTreeItem = isAdmin
    ? createAllNamespacesTreeItem(treeViewData, treeViewDataMap, projectMap, queryParams)
    : null;

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
  projectsByClusters: UseMulticlusterNamespacesReturnType[0],
  queryParams?: string,
  clusterNames?: string[],
): TreeViewDataItem[] => {
  const { currentVMTab, vmCluster, vmName, vmNamespace } = getVMInfoFromPathname(pathname);

  const vmsPerCluster = getVMsPerCluster(vms) ?? {};

  const treeViewDataMap: Record<string, TreeViewDataItem> = {};

  const treeWithClusters = clusterNames
    ?.sort((a, b) => a.localeCompare(b))
    ?.map((clusterName) => {
      const clusterVMs = vmsPerCluster[clusterName] ?? [];

      const clusterProjects = projectsByClusters[clusterName]
        ?.map((project) => getName(project))
        ?.sort((a, b) => a.localeCompare(b));

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
        ),
      );

      const clusterTreeItem: TreeViewDataItemWithHref = {
        children: treeViewData,
        defaultExpanded: clusterSelected,
        hasBadge: false,
        href: getACMVMListURL(clusterName),
        icon: <ClusterIcon />,
        id: `${CLUSTER_SELECTOR_PREFIX}/${clusterName}`,
        name: clusterName,
      };

      if (!treeViewDataMap[clusterTreeItem.id]) {
        treeViewDataMap[clusterTreeItem.id] = clusterTreeItem;
      }

      return clusterTreeItem;
    });

  treeDataMap.value = treeViewDataMap;

  const clusterTreeItem: TreeViewDataItemWithHref[] = [
    {
      children: treeWithClusters,
      defaultExpanded: true,
      hasBadge: false,
      href: getACMVMListURL(),
      icon: <ClusterIcon />,
      id: ALL_CLUSTERS_ID,
      name: 'All clusters',
    },
  ];

  return clusterTreeItem;
};

export const filterItems = (item: TreeViewDataItem, input: string) => {
  if ((item.name as string).toLowerCase().includes(input.toLowerCase())) {
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

// Show projects that has VMs all the time.
// Show / hide projects that has no VMs depending on a flag
// hide system namespaces unless they contain VMs OR there are no non-system namespaces
export const filterNamespaceItems = (
  item: TreeViewDataItem,
  showEmptyProjects: boolean,
  hasNonSystemNamespaces: boolean = true,
) => {
  const hasVMs =
    item.id !== ALL_NAMESPACES_SESSION_KEY &&
    item.id !== ALL_CLUSTERS_ID &&
    !item.id.startsWith(CLUSTER_SELECTOR_PREFIX) &&
    item.children?.length > 0;
  const projectName = item.name as string;

  if (item.id.startsWith(PROJECT_SELECTOR_PREFIX)) {
    const isSystemNS = isSystemNamespace(projectName);

    if (hasVMs) return true;

    if (showEmptyProjects && !isSystemNS) return true;

    if (showEmptyProjects && isSystemNS && !hasNonSystemNamespaces) return true;
  }

  if (item.children) {
    return (
      (item.children = item.children
        .map((opt) => Object.assign({}, opt))
        .filter((child) => filterNamespaceItems(child, showEmptyProjects, hasNonSystemNamespaces)))
        .length > 0
    );
  }
};

export const isSystemNamespace = (projectName: string) => {
  const startsWithNamespace = SYSTEM_NAMESPACES_PREFIX.some((ns) => projectName.startsWith(ns));
  const isNamespace = SYSTEM_NAMESPACES.includes(projectName);

  return startsWithNamespace || isNamespace;
};

export const getAllTreeViewItems = (treeData: TreeViewDataItem[]) => {
  return treeData
    ?.map((treeItem) => [treeItem, ...getAllTreeViewItems(treeItem.children || [])])
    ?.flat();
};

export const getAllTreeViewVMItems = (treeData: TreeViewDataItem[]): TreeViewDataItem[] =>
  getAllTreeViewItems(treeData).filter((treeItem) => !treeItem.children);

export const getAllRightClickableTreeViewItems = (
  treeData: TreeViewDataItem[],
): TreeViewDataItem[] =>
  getAllTreeViewItems(treeData).filter(
    (treeItem) =>
      !treeItem.id.startsWith(CLUSTER_SELECTOR_PREFIX) &&
      !treeItem.id.startsWith(ALL_CLUSTERS_ID) &&
      treeItem.id !== ALL_NAMESPACES_SESSION_KEY,
  );

export const getAllTreeViewFolderItems = (treeData: TreeViewDataItem[]): TreeViewDataItem[] =>
  getAllTreeViewItems(treeData)?.filter((treeItem) =>
    treeItem.id.startsWith(FOLDER_SELECTOR_PREFIX),
  ) || [];

export const getAllTreeViewProjectItems = (treeData: TreeViewDataItem[]): TreeViewDataItem[] =>
  getAllTreeViewItems(treeData).filter((treeItem) =>
    treeItem.id.startsWith(PROJECT_SELECTOR_PREFIX),
  );
