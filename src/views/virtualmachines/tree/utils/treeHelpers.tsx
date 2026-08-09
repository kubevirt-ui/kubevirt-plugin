import React from 'react';

import { ALL_NAMESPACES_SESSION_KEY } from '@kubevirt-utils/hooks/constants';
import { isSystemNamespace } from '@kubevirt-utils/resources/namespace/helper';
import { type TreeViewDataItem } from '@patternfly/react-core';

import {
  ALL_CLUSTERS_ID,
  CLUSTER_SELECTOR_PREFIX,
  FOLDER_SELECTOR_PREFIX,
  PROJECT_SELECTOR_PREFIX,
} from './constants';
import { HIDE, SHOW } from './constants';

const nameMatchesSearch = (item: TreeViewDataItem, searchText: string): boolean =>
  (item.name as string).toLowerCase().includes(searchText.toLowerCase());

const isAllNamespacesItem = (item: TreeViewDataItem): boolean =>
  item.id === ALL_NAMESPACES_SESSION_KEY;

const isClusterItem = (item: TreeViewDataItem): boolean =>
  item.id?.startsWith(CLUSTER_SELECTOR_PREFIX);

const isProjectItem = (item: TreeViewDataItem): boolean =>
  item.id?.startsWith(PROJECT_SELECTOR_PREFIX);

const isFolderItem = (item: TreeViewDataItem): boolean =>
  item.id?.startsWith(FOLDER_SELECTOR_PREFIX);

const isVMItem = (item: TreeViewDataItem): boolean => !item.children;

// searches for clusters, projects and folders
export const filterItems = (item: TreeViewDataItem, input: string): boolean => {
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
    const filteredChildren = item.children
      .map((opt) => Object.assign({}, opt))
      .filter((child) => filterItems(child, input));
    item.children = filteredChildren;
    return filteredChildren.length > 0;
  }
};

export const getEffectiveShowEmptyProjects = (
  hasVMs: boolean,
  showEmptyProjects: string,
): string => (hasVMs ? showEmptyProjects : SHOW);

export const isShowOnlyVMProjectsChecked = (hasVMs: boolean, showEmptyProjects: string): boolean =>
  getEffectiveShowEmptyProjects(hasVMs, showEmptyProjects) === HIDE;

// Show projects that have VMs all the time
// Show / hide projects that have no VMs depending on showEmptyProjects flag
// Hide system namespaces unless they contain VMs
export const filterNamespaceItems = (
  item: TreeViewDataItem,
  showEmptyProjects: boolean,
): boolean => {
  if (isProjectItem(item)) {
    const hasVMs = item.children?.length > 0;
    if (hasVMs) return true;

    const projectName = item.name as string;
    if (isSystemNamespace(projectName)) return false;

    return showEmptyProjects;
  }

  if (item.children) {
    item.children = item.children
      .map((opt) => Object.assign({}, opt))
      .filter((child) => filterNamespaceItems(child, showEmptyProjects));

    return item.children.length > 0 || isClusterItem(item) || isAllNamespacesItem(item);
  }
};

export const getAllTreeViewItems = (treeData: TreeViewDataItem[]): TreeViewDataItem[] => {
  return treeData
    ?.map((treeItem) => [treeItem, ...getAllTreeViewItems(treeItem.children ?? [])])
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

export const getAllTreeViewProjectItems = (treeData: TreeViewDataItem[]): TreeViewDataItem[] =>
  getAllTreeViewItems(treeData).filter((treeItem) => isProjectItem(treeItem));

export const getAllTreeViewClusterItems = (treeData: TreeViewDataItem[]): TreeViewDataItem[] =>
  getAllTreeViewItems(treeData).filter((treeItem) => isClusterItem(treeItem));

export const getMatchedProjectItems = (
  treeData: TreeViewDataItem[],
  searchText: string,
): TreeViewDataItem[] =>
  getAllTreeViewProjectItems(treeData).filter((item) => nameMatchesSearch(item, searchText));

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

    if ((isProjectItem(copy) || isClusterItem(copy)) && nameMatchesSearch(copy, searchText)) {
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
