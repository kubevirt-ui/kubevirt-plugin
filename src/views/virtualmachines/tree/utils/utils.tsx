import React from 'react';
import { VirtualMachineModel } from 'src/views/dashboard-extensions/utils';

import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import {
  runningTourSignal,
  tourGuideVM,
} from '@kubevirt-utils/components/GuidedTour/utils/constants';
import { ALL_NAMESPACES_SESSION_KEY, ALL_PROJECTS } from '@kubevirt-utils/hooks/constants';
import { getLabel, getName, getNamespace, getResourceUrl } from '@kubevirt-utils/resources/shared';
import {
  getACMVMListNamespacesUrl,
  getACMVMListUrl,
  getACMVMUrl,
} from '@kubevirt-utils/resources/vm';
import { TreeViewDataItem } from '@patternfly/react-core';
import { FolderIcon, FolderOpenIcon, ProjectDiagramIcon } from '@patternfly/react-icons';
import { signal } from '@preact/signals-react';

import { statusIcon } from '../icons/utils';

import {
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
  isACMTreeView = false,
) => {
  const projectMap: Record<
    string,
    {
      count: number;
      folders: Record<string, TreeViewDataItemWithHref[]>;
      ungrouped: TreeViewDataItemWithHref[];
    }
  > = {};

  vms.forEach((vm) => {
    const vmNamespace = getNamespace(vm);
    const vmName = getName(vm);
    const folder = foldersEnabled ? getLabel(vm, VM_FOLDER_LABEL) : null;
    const vmTreeItemID = `${vmNamespace}/${vmName}`;
    const VMStatusIcon = statusIcon[vm?.status?.printableStatus];

    const vmTreeItem: TreeViewDataItemWithHref = {
      defaultExpanded: currentPageVMName && currentPageVMName === vmName,
      href: isACMTreeView
        ? getACMVMUrl(vm.cluster, vmNamespace, vmName)
        : `${getResourceUrl({
            activeNamespace: vmNamespace,
            model: VirtualMachineModel,
            resource: { metadata: { name: vmName, namespace: vmNamespace } },
          })}/${currentVMTab}`,
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
  cluster?: string,
): TreeViewDataItemWithHref[] =>
  Object.entries(folders).map(([folder, vmItems]) => {
    const folderTreeItemID = `${FOLDER_SELECTOR_PREFIX}/${project}/${folder}`;
    const folderExpanded =
      currentPageVMName && vmItems.some((item) => (item.name as string) === currentPageVMName);

    const folderTreeItem: TreeViewDataItemWithHref = {
      children: vmItems,
      defaultExpanded: folderExpanded,
      expandedIcon: <FolderOpenIcon />,
      href: cluster
        ? getACMVMListNamespacesUrl(cluster, project)
        : getResourceUrl({
            activeNamespace: project,
            model: VirtualMachineModel,
          }),
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
  cluster?: string,
): TreeViewDataItemWithHref => {
  const projectFolders = createFolderTreeItems(
    projectMap[project]?.folders || {},
    project,
    currentPageVMName,
    treeViewDataMap,
    cluster,
  );

  const sortProjectFolders = projectFolders.sort((folderA, folderB) =>
    folderA.id.localeCompare(folderB.id),
  );

  const projectChildren = [...sortProjectFolders, ...(projectMap[project]?.ungrouped || [])];

  const projectTreeItemID = `${PROJECT_SELECTOR_PREFIX}/${project}`;
  const projectTreeItem: TreeViewDataItemWithHref = {
    children: projectChildren,
    customBadgeContent: projectMap[project]?.count || 0,
    defaultExpanded: currentPageNamespace === project,
    href: cluster
      ? getACMVMListNamespacesUrl(cluster, project)
      : getResourceUrl({
          activeNamespace: project,
          model: VirtualMachineModel,
        }),
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
    href: cluster
      ? getACMVMListUrl(cluster)
      : getResourceUrl({
          model: VirtualMachineModel,
        }),
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

const getVMInfoFromPathname = (pathname: string) => {
  const splitPathname = pathname.split('/');
  const currentVMTab = splitPathname?.[6] || '';
  const vmName = splitPathname?.[5];
  const vmNamespace = splitPathname?.[3];

  return { currentVMTab, vmName, vmNamespace };
};

export const createTreeViewData = (
  projectNames: string[],
  vms: V1VirtualMachine[],
  isAdmin: boolean,
  pathname: string,
  foldersEnabled: boolean,
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
    createProjectTreeItem(project, projectMap, vmName, vmNamespace, treeViewDataMap),
  );

  const allNamespacesTreeItem = isAdmin
    ? createAllNamespacesTreeItem(treeViewData, treeViewDataMap, projectMap)
    : null;

  treeDataMap.value = treeViewDataMap;

  const tree = allNamespacesTreeItem ? [allNamespacesTreeItem] : treeViewData;

  return tree;
};

export const createMultiClusterTreeViewData = (
  vms: V1VirtualMachine[],
  pathname: string,
  foldersEnabled: boolean,
  clusters?: K8sResourceCommon[],
): TreeViewDataItem[] => {
  const { currentVMTab, vmName, vmNamespace } = getVMInfoFromPathname(pathname);

  const treeViewDataMap: Record<string, TreeViewDataItem> = {};

  const treeWithClusters = clusters?.map((cluster) => {
    const clusterName = getName(cluster);

    const vmsInCluster = vms?.filter((vm) => vm.cluster === clusterName);

    const projectsInCluster = vmsInCluster.reduce((namespaces, vm) => {
      const namespace = getNamespace(vm);
      if (!namespaces.includes(namespace)) namespaces.push(namespace);

      return namespaces;
    }, []);

    const projectMap = buildProjectMap(
      vmsInCluster,
      vmName,
      currentVMTab,
      treeViewDataMap,
      foldersEnabled,
      true,
    );

    const treeViewData = projectsInCluster.map((project) =>
      createProjectTreeItem(project, projectMap, vmName, vmNamespace, treeViewDataMap, clusterName),
    );

    const clusterTreeItem: TreeViewDataItemWithHref = {
      children: treeViewData,
      hasBadge: false,
      href: `/multicloud/infrastructure/virtualmachines/${clusterName}`,
      icon: <ProjectDiagramIcon />,
      id: `cluster/${clusterName}`,
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
      hasBadge: false,
      href: `/multicloud/infrastructure/virtualmachines`,
      icon: <ProjectDiagramIcon />,
      id: 'ALL_CLUSTERS',
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
// hide system namespaces unless they contain VMs
export const filterNamespaceItems = (item: TreeViewDataItem, showEmptyProjects: boolean) => {
  const hasVMs =
    item.id !== ALL_NAMESPACES_SESSION_KEY &&
    !item.id.startsWith('cluster') &&
    item.children?.length > 0;
  const projectName = item.name as string;

  if (item.id.startsWith(PROJECT_SELECTOR_PREFIX)) {
    // if (hasVMs) return true;
    if ((showEmptyProjects && !isSystemNamespace(projectName)) || hasVMs) return true;
  }

  if (item.id.startsWith('cluster')) return true;

  if (item.children) {
    return (
      (item.children = item.children
        .map((opt) => Object.assign({}, opt))
        .filter((child) => filterNamespaceItems(child, showEmptyProjects))).length > 0
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

export const getAllTreeViewFolderItems = (treeData: TreeViewDataItem[]): TreeViewDataItem[] =>
  getAllTreeViewItems(treeData).filter((treeItem) =>
    treeItem.id.startsWith(FOLDER_SELECTOR_PREFIX),
  );

export const getAllTreeViewProjectItems = (treeData: TreeViewDataItem[]): TreeViewDataItem[] =>
  getAllTreeViewItems(treeData).filter((treeItem) =>
    treeItem.id.startsWith(PROJECT_SELECTOR_PREFIX),
  );
