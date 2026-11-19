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

type GetVMColumnsProps = {
  canGetNode: boolean;
  hideActions?: boolean;
  isAllClustersPage: boolean;
  namespace?: string;
  t: TFunction;
};

export const getVMColumns = ({
  canGetNode,
  hideActions = false,
  isAllClustersPage,
  namespace,
  t,
}: GetVMColumnsProps): VMColumn[] => [
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
