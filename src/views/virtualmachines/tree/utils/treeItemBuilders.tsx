import React from 'react';
import isEmpty from 'lodash/isEmpty';

import { type V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { ALL_NAMESPACES_SESSION_KEY, LOCAL_CLUSTER } from '@kubevirt-utils/hooks/constants';
import { t } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getLabel, getName, getNamespace } from '@kubevirt-utils/resources/shared';
import { getCluster } from '@multicluster/helpers/selectors';
import { getVMListURL, getVMURL } from '@multicluster/urls';
import { ClusterIcon } from '@patternfly/react-icons';
import { VirtualMachineRowFilterType } from '@virtualmachines/utils';

import { statusIcon } from '../icons/utils';
import { VM_FOLDER_LABEL } from './constants';
import {
  buildTreeItemQuery,
  getVMTreeViewItemID,
  treeDataMap,
  type TreeViewDataItemWithHref,
} from './utils';

export type ProjectMapEntry = {
  count: number;
  folders: Record<string, TreeViewDataItemWithHref[]>;
  ungrouped: TreeViewDataItemWithHref[];
};

const createVMTreeItem = (
  vm: V1VirtualMachine,
  currentPageVMName: string,
  currentVMTab: string,
  isTourRunning: boolean,
): TreeViewDataItemWithHref => {
  const vmNamespace = getNamespace(vm);
  const vmName = getName(vm);
  const vmCluster = getCluster(vm);
  const VMStatusIcon = statusIcon[vm?.status?.printableStatus ?? ''];

  return {
    defaultExpanded: currentPageVMName && currentPageVMName === vmName,
    href: isTourRunning ? undefined : `${getVMURL(vmCluster, vmNamespace, vmName)}/${currentVMTab}`,
    icon: <VMStatusIcon />,
    id: getVMTreeViewItemID(vmName, vmNamespace, vmCluster),
    name: vmName,
  };
};

export const buildProjectMap = (
  vms: V1VirtualMachine[],
  currentPageVMName: string,
  currentVMTab: string,
  treeViewDataMap: Record<string, TreeViewDataItemWithHref>,
  foldersEnabled: boolean,
  isTourRunning = false,
): Record<string, ProjectMapEntry> => {
  if (isEmpty(vms)) return {};

  const projectMap: Record<string, ProjectMapEntry> = {};

  for (const vm of vms) {
    const vmNamespace = getNamespace(vm);
    const folder = foldersEnabled ? getLabel(vm, VM_FOLDER_LABEL) : null;
    const vmTreeItem = createVMTreeItem(vm, currentPageVMName, currentVMTab, isTourRunning);

    treeViewDataMap[vmTreeItem.id] ??= vmTreeItem;

    projectMap[vmNamespace] ??= { count: 0, folders: {}, ungrouped: [] };
    projectMap[vmNamespace].count++;

    if (folder) {
      projectMap[vmNamespace].folders[folder] ??= [];
      projectMap[vmNamespace].folders[folder].push(vmTreeItem);
      continue;
    }

    projectMap[vmNamespace].ungrouped.push(vmTreeItem);
  }

  return projectMap;
};

export const getFolderNameFromQueryParams = (queryParams?: string): string | undefined => {
  const params = new URLSearchParams(queryParams?.replace(/^\?/, '') ?? '');
  return params.get(VirtualMachineRowFilterType.Group) ?? undefined;
};

export const createAllNamespacesTreeItem = (
  treeViewData: TreeViewDataItemWithHref[],
  treeViewDataMap: Record<string, TreeViewDataItemWithHref>,
  queryParams?: string,
): TreeViewDataItemWithHref => {
  const allNamespacesTreeItem: TreeViewDataItemWithHref = {
    children: treeViewData,
    defaultExpanded: true,
    hasBadge: false,
    href: `${getVMListURL()}${buildTreeItemQuery({ query: queryParams })}`,
    icon: <ClusterIcon />,
    id: ALL_NAMESPACES_SESSION_KEY,
    name: t(LOCAL_CLUSTER),
  };
  treeViewDataMap[ALL_NAMESPACES_SESSION_KEY] ??= allNamespacesTreeItem;
  treeDataMap.value = treeViewDataMap;
  return allNamespacesTreeItem;
};
