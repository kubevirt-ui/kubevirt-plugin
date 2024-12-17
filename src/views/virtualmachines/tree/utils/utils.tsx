import React from 'react';

import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { ALL_NAMESPACES_SESSION_KEY, ALL_PROJECTS } from '@kubevirt-utils/hooks/constants';
import { getLabel, getName, getNamespace } from '@kubevirt-utils/resources/shared';
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

export const treeDataMap = signal<Record<string, TreeViewDataItem>>(null);

const buildProjectMap = (
  vms: V1VirtualMachine[],
  currentPageVMName: string,
  treeViewDataMap: Record<string, TreeViewDataItem>,
  foldersEnabled: boolean,
) => {
  const projectMap: Record<
    string,
    { count: number; folders: Record<string, TreeViewDataItem[]>; ungrouped: TreeViewDataItem[] }
  > = {};

  vms.forEach((vm) => {
    const vmNamespace = getNamespace(vm);
    const vmName = getName(vm);
    const folder = foldersEnabled ? getLabel(vm, VM_FOLDER_LABEL) : null;
    const vmTreeItemID = `${vmNamespace}/${vmName}`;
    const VMStatusIcon = statusIcon[vm?.status?.printableStatus];

    const vmTreeItem: TreeViewDataItem = {
      defaultExpanded: currentPageVMName && currentPageVMName === vmName,
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
  folders: Record<string, TreeViewDataItem[]>,
  project: string,
  currentPageVMName: string,
  treeViewDataMap: Record<string, TreeViewDataItem>,
): TreeViewDataItem[] =>
  Object.entries(folders).map(([folder, vmItems]) => {
    const folderTreeItemID = `${FOLDER_SELECTOR_PREFIX}/${project}/${folder}`;
    const folderExpanded =
      currentPageVMName && vmItems.some((item) => (item.name as string) === currentPageVMName);

    const folderTreeItem: TreeViewDataItem = {
      children: vmItems,
      defaultExpanded: folderExpanded,
      expandedIcon: <FolderOpenIcon />,
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
  activeNamespace: string,
  currentPageVMName: string,
  treeViewDataMap: Record<string, TreeViewDataItem>,
): TreeViewDataItem => {
  const projectFolders = createFolderTreeItems(
    projectMap[project]?.folders || {},
    project,
    currentPageVMName,
    treeViewDataMap,
  );

  const projectChildren = [...projectFolders, ...(projectMap[project]?.ungrouped || [])];

  const projectTreeItemID = `${PROJECT_SELECTOR_PREFIX}/${project}`;
  const projectTreeItem: TreeViewDataItem = {
    children: projectChildren,
    customBadgeContent: projectMap[project]?.count || 0,
    defaultExpanded: project === activeNamespace,
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
  treeViewData: TreeViewDataItem[],
  treeViewDataMap: Record<string, TreeViewDataItem>,
  projectMap: Record<string, any>,
): TreeViewDataItem => {
  const allVMsCount = Object.keys(projectMap).reduce((acc, ns) => {
    acc += projectMap[ns]?.count;
    return acc;
  }, 0);

  const allNamespacesTreeItem: TreeViewDataItem = {
    children: treeViewData,
    customBadgeContent: allVMsCount || 0,
    defaultExpanded: true,
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

export const createTreeViewData = (
  projectNames: string[],
  vms: V1VirtualMachine[],
  activeNamespace: string,
  isAdmin: boolean,
  pathname: string,
  foldersEnabled: boolean,
): [TreeViewDataItem[], TreeViewDataItem] => {
  const currentPageVMName = pathname.split('/')[5];
  const treeViewDataMap: Record<string, TreeViewDataItem> = {};
  const projectMap = buildProjectMap(vms, currentPageVMName, treeViewDataMap, foldersEnabled);

  const treeViewData = projectNames.map((project) =>
    createProjectTreeItem(project, projectMap, activeNamespace, currentPageVMName, treeViewDataMap),
  );

  const allNamespacesTreeItem = isAdmin
    ? createAllNamespacesTreeItem(treeViewData, treeViewDataMap, projectMap)
    : null;

  const getSelectedTreeItem = (): TreeViewDataItem => {
    if (activeNamespace === ALL_NAMESPACES_SESSION_KEY) return allNamespacesTreeItem;

    if (currentPageVMName) return treeViewDataMap[`${activeNamespace}/${currentPageVMName}`];

    const params = new URLSearchParams(window.location.search);

    if (!params?.has('labels'))
      return treeViewDataMap[`${PROJECT_SELECTOR_PREFIX}/${activeNamespace}`];

    const folderLabel: string = params.values().next().value;
    const folder = folderLabel.split('=')?.[1];

    return treeViewDataMap[`${FOLDER_SELECTOR_PREFIX}/${activeNamespace}/${folder}`];
  };

  treeDataMap.value = treeViewDataMap;

  return [[allNamespacesTreeItem] ?? treeViewData, getSelectedTreeItem()];
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
  const hasVMs = item.id !== ALL_NAMESPACES_SESSION_KEY && item.children.length > 0;
  const projectName = item.name as string;

  if (item.id.startsWith(PROJECT_SELECTOR_PREFIX)) {
    // if (hasVMs) return true;
    if ((showEmptyProjects && !isSystemNamespace(projectName)) || hasVMs) return true;
  }
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
