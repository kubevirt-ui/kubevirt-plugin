import React from 'react';

import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { ALL_NAMESPACES_SESSION_KEY, ALL_PROJECTS } from '@kubevirt-utils/hooks/constants';
import { getLabel, getName, getNamespace } from '@kubevirt-utils/resources/shared';
import { TreeViewDataItem } from '@patternfly/react-core';
import { FolderIcon, FolderOpenIcon, ProjectDiagramIcon } from '@patternfly/react-icons';
import { signal } from '@preact/signals-react';

import { statusIcon } from '../icons/utils';

import { FOLDER_SELECTOR_PREFIX, PROJECT_SELECTOR_PREFIX, VM_FOLDER_LABEL } from './constants';

export const treeViewOpen = signal<boolean>(true);
export const treeDataMap = signal<Record<string, TreeViewDataItem>>(null);
export const selectedTreeItem = signal<TreeViewDataItem[]>(null);
export const setSelectedTreeItem = (selected: TreeViewDataItem) =>
  (selectedTreeItem.value = [selected]);

const buildProjectMap = (
  vms: V1VirtualMachine[],
  currentPageVMName: string,
  treeViewDataMap: Record<string, TreeViewDataItem>,
) => {
  const projectMap: Record<
    string,
    { folders: Record<string, TreeViewDataItem[]>; ungrouped: TreeViewDataItem[] }
  > = {};

  vms.forEach((vm) => {
    const vmNamespace = getNamespace(vm);
    const vmName = getName(vm);
    const folder = getLabel(vm, VM_FOLDER_LABEL);
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
      projectMap[vmNamespace] = { folders: {}, ungrouped: [] };
    }

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
): TreeViewDataItem => {
  const allNamespacesTreeItem: TreeViewDataItem = {
    children: treeViewData,
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
): TreeViewDataItem[] => {
  const currentPageVMName = pathname.split('/')[5];
  const treeViewDataMap: Record<string, TreeViewDataItem> = {};
  const projectMap = buildProjectMap(vms, currentPageVMName, treeViewDataMap);

  const treeViewData = projectNames.map((project) =>
    createProjectTreeItem(project, projectMap, activeNamespace, currentPageVMName, treeViewDataMap),
  );

  if (isAdmin) {
    const allNamespacesTreeItem = createAllNamespacesTreeItem(treeViewData, treeViewDataMap);
    return [allNamespacesTreeItem];
  }

  treeDataMap.value = treeViewDataMap;
  return treeViewData;
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
