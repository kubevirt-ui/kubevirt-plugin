import { type TFunction } from 'i18next';

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
  getCPUUsageColumn,
  getDeletionProtectionColumn,
  getMemoryColumn,
  getMemoryUsageColumn,
  getNetworkUsageColumn,
  getStorageClassColumn,
  getVCPUColumn,
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
  getCPUUsageColumn,
  getDeletionProtectionColumn,
  getMemoryColumn,
  getMemoryUsageColumn,
  getNetworkUsageColumn,
  getStorageClassColumn,
  getVCPUColumn,
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
  getVCPUColumn(t),
  getMemoryColumn(t),
  getMemoryUsageColumn(t),
  getCPUUsageColumn(t),
  getNetworkUsageColumn(t),
  getDeletionProtectionColumn(t),
  getStorageClassColumn(t),
  ...getActionsColumns(hideActions),
];
