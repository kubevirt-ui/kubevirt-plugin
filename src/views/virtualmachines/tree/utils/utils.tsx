import { SINGLE_CLUSTER_KEY } from '@kubevirt-utils/resources/constants';
import {
  CLUSTER_LIST_FILTER_TYPE,
  PROJECT_LIST_FILTER_TYPE,
} from '@kubevirt-utils/utils/constants';
import { isACMPath } from '@multicluster/urls';
import { type TreeViewDataItem } from '@patternfly/react-core';
import { signal } from '@preact/signals-react';
import { VirtualMachineRowFilterType } from '@virtualmachines/utils';

import {
  CLUSTER_SELECTOR_PREFIX,
  FOLDER_SELECTOR_PREFIX,
  PROJECT_SELECTOR_PREFIX,
} from './constants';

export * from './clusterVMHelpers';
export * from './projectTreeItems';
export * from './treeDataAssembly';
export * from './treeHelpers';
export * from './treeItemBuilders';

export const treeDataMap = signal<Record<string, TreeViewDataItemWithHref>>(null);

export type TreeViewDataItemWithHref = {
  href?: string;
} & TreeViewDataItem;

export const getVMTreeViewItemID = (
  vmName: string,
  vmNamespace: string,
  vmCluster: string,
): string => `${vmCluster || SINGLE_CLUSTER_KEY}/${vmNamespace}/${vmName}`;

export const getProjectTreeViewItemID = (cluster: string | undefined, project: string): string =>
  `${PROJECT_SELECTOR_PREFIX}/${cluster ?? SINGLE_CLUSTER_KEY}/${project}`;

export const getFolderTreeViewItemID = (
  cluster: string | undefined,
  project: string,
  folder: string,
): string => `${FOLDER_SELECTOR_PREFIX}/${cluster ?? SINGLE_CLUSTER_KEY}/${project}/${folder}`;

export const getClusterTreeViewItemID = (clusterName: string): string =>
  `${CLUSTER_SELECTOR_PREFIX}/${clusterName}`;

export const getVMInfoFromPathname = (
  pathname: string,
): { currentVMTab: string; vmCluster: string; vmName: string; vmNamespace: string } => {
  const splitPathname = pathname.split('/');

  if (isACMPath(pathname)) {
    const currentVMTab = splitPathname?.[8] ?? '';
    const vmName = splitPathname?.[7];
    const vmNamespace = splitPathname?.[6];
    const vmCluster = splitPathname?.[4];

    return { currentVMTab, vmCluster, vmName, vmNamespace };
  }

  const currentVMTab = splitPathname?.[6] ?? '';
  const vmName = splitPathname?.[5];
  const vmNamespace = splitPathname?.[3];

  return { currentVMTab, vmCluster: null, vmName, vmNamespace };
};

type BuildTreeItemQueryOptions = {
  cluster?: string;
  folderName?: string;
  project?: string;
  query?: string;
};

export const buildTreeItemQuery = ({
  cluster,
  folderName,
  project,
  query,
}: BuildTreeItemQueryOptions): string => {
  const params = new URLSearchParams(query ?? '');

  params.delete(CLUSTER_LIST_FILTER_TYPE);
  params.delete(PROJECT_LIST_FILTER_TYPE);
  params.delete(VirtualMachineRowFilterType.Group);

  if (cluster) {
    params.set(CLUSTER_LIST_FILTER_TYPE, cluster);
  }
  if (project) {
    params.set(PROJECT_LIST_FILTER_TYPE, project);
  }
  if (folderName) {
    params.set(VirtualMachineRowFilterType.Group, folderName);
  }

  return params.size > 0 ? `?${params.toString()}` : '';
};
