import { type TFunction } from 'i18next';

import { type V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { getK8sRowId } from '@kubevirt-utils/components/KubevirtTable/utils';

import {
  getClusterColumns,
  getNameColumn,
  getNamespaceColumns,
  getSelectionColumns,
} from './vmClusterColumns';
import { type VMColumn } from './vmColumnTypes';
import {
  getConditionsColumn,
  getCreatedColumn,
  getIPAddressColumn,
  getNodeColumns,
  getStatusColumn,
} from './vmNodeColumns';
import {
  getActionsColumns,
  getCPUColumn,
  getDeletionProtectionColumn,
  getMemoryColumn,
  getNetworkColumn,
  getStorageClassColumn,
} from './vmResourceColumns';

export {
  getClusterColumns,
  getNameColumn,
  getNamespaceColumns,
  getSelectionColumns,
} from './vmClusterColumns';
export { VM_COLUMN_KEYS, type VMCallbacks } from './vmColumnTypes';
export {
  getConditionsColumn,
  getCreatedColumn,
  getIPAddressColumn,
  getNodeColumns,
  getStatusColumn,
} from './vmNodeColumns';
export {
  getActionsColumns,
  getCPUColumn,
  getDeletionProtectionColumn,
  getMemoryColumn,
  getNetworkColumn,
  getStorageClassColumn,
} from './vmResourceColumns';

export const getVMColumns = (
  t: TFunction,
  namespace: string,
  isAllClustersPage: boolean,
  canGetNode: boolean,
  hideActions = false,
): VMColumn[] => [
  ...getSelectionColumns(hideActions),
  getNameColumn(t),
  ...getClusterColumns(t, isAllClustersPage),
  ...getNamespaceColumns(t, namespace),
  getStatusColumn(t),
  getConditionsColumn(t),
  ...getNodeColumns(t, canGetNode),
  getCreatedColumn(t),
  getIPAddressColumn(t),
  getMemoryColumn(t),
  getCPUColumn(t),
  getNetworkColumn(t),
  getDeletionProtectionColumn(t),
  getStorageClassColumn(t),
  ...getActionsColumns(hideActions),
];

export const getVMRowId = (vm: V1VirtualMachine, index: number): string =>
  getK8sRowId(vm, index, 'vm');
