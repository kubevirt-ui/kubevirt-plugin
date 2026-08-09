import React from 'react';

import { t } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getVMListNamespacesURL } from '@multicluster/urls';
import { Tooltip } from '@patternfly/react-core';
import { FolderIcon, FolderOpenIcon, ProjectDiagramIcon } from '@patternfly/react-icons';

import { type ProjectMapEntry } from './treeItemBuilders';
import {
  buildTreeItemQuery,
  getFolderTreeViewItemID,
  getProjectTreeViewItemID,
  type TreeViewDataItemWithHref,
} from './utils';

const isFolderExpanded = (
  folder: string,
  project: string,
  vmItems: TreeViewDataItemWithHref[],
  currentPageVMName: string | undefined,
  currentPageNamespace: string,
  currentFolderName: string | undefined,
  clusterSelected = true,
): boolean =>
  !!(currentPageVMName && vmItems.some((item) => (item.name as string) === currentPageVMName)) ||
  (clusterSelected && currentFolderName === folder && currentPageNamespace === project);

const createFolderTreeItems = (
  folders: Record<string, TreeViewDataItemWithHref[]>,
  project: string,
  currentPageVMName: string,
  currentPageNamespace: string,
  currentFolderName: string | undefined,
  treeViewDataMap: Record<string, TreeViewDataItemWithHref>,
  queryParams?: string,
  cluster?: string,
  clusterSelected = true,
): TreeViewDataItemWithHref[] =>
  Object.entries(folders).map(([folder, vmItems]) => {
    const folderTreeItemID = getFolderTreeViewItemID(cluster, project, folder);
    const folderExpanded = isFolderExpanded(
      folder,
      project,
      vmItems,
      currentPageVMName,
      currentPageNamespace,
      currentFolderName,
      clusterSelected,
    );

    const folderTreeItem: TreeViewDataItemWithHref = {
      children: vmItems,
      defaultExpanded: folderExpanded,
      expandedIcon: <FolderOpenIcon />,
      href: `${getVMListNamespacesURL(cluster, project)}${buildTreeItemQuery({
        cluster,
        folderName: folder,
        project,
        query: queryParams,
      })}`,
      icon: <FolderIcon />,
      id: folderTreeItemID,
      name: folder,
    };

    treeViewDataMap[folderTreeItemID] ??= folderTreeItem;

    return folderTreeItem;
  });

export const createProjectTreeItem = (
  project: string,
  projectMap: Record<string, ProjectMapEntry>,
  currentPageVMName: string,
  currentPageNamespace: string,
  treeViewDataMap: Record<string, TreeViewDataItemWithHref>,
  queryParams?: string,
  cluster?: string,
  clusterSelected = true,
  isTourRunning = false,
  currentFolderName?: string,
): TreeViewDataItemWithHref => {
  const projectFolders = createFolderTreeItems(
    projectMap[project]?.folders ?? {},
    project,
    currentPageVMName,
    currentPageNamespace,
    currentFolderName,
    treeViewDataMap,
    queryParams,
    cluster,
    clusterSelected,
  );

  const sortedProjectFolders = [...projectFolders].sort((folderA, folderB) =>
    (folderA.id ?? '').localeCompare(folderB.id ?? ''),
  );

  const projectChildren = [...sortedProjectFolders, ...(projectMap[project]?.ungrouped ?? [])];

  const projectTreeItemID = getProjectTreeViewItemID(cluster, project);
  const projectTreeItem: TreeViewDataItemWithHref = {
    children: projectChildren,
    customBadgeContent: projectMap[project]?.count ?? '0',
    defaultExpanded: (currentPageNamespace === project && clusterSelected) || isTourRunning,
    href: `${getVMListNamespacesURL(cluster, project)}${buildTreeItemQuery({
      cluster,
      project,
      query: queryParams,
    })}`,
    icon: (
      <Tooltip content={t('Project')}>
        <ProjectDiagramIcon />
      </Tooltip>
    ),
    id: projectTreeItemID,
    name: project,
  };

  treeViewDataMap[projectTreeItemID] ??= projectTreeItem;

  return projectTreeItem;
};
