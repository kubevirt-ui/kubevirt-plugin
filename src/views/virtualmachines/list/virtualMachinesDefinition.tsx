import React from 'react';
import { TFunction } from 'react-i18next';

import {
  V1VirtualMachine,
  V1VirtualMachineInstance,
  V1VirtualMachineInstanceMigration,
} from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { getK8sRowId } from '@kubevirt-utils/components/KubevirtTable/utils';
import Timestamp from '@kubevirt-utils/components/Timestamp/Timestamp';
import { ColumnConfig } from '@kubevirt-utils/hooks/useDataViewTableSort/types';
import { ACTIONS } from '@kubevirt-utils/hooks/useKubevirtUserSettings/utils/const';
import { getName, getNamespace } from '@kubevirt-utils/resources/shared';
import { getCPU, getMemory } from '@kubevirt-utils/resources/vm';
import { getCluster } from '@multicluster/helpers/selectors';
import { getDeletionProtectionPrintableStatus } from '@virtualmachines/details/tabs/configuration/details/components/DeletionProtection/utils/utils';
import { PVCMapper, VMIMapper, VMIMMapper } from '@virtualmachines/utils/mappers';

import VMActionsCell from './cells/VMActionsCell';
import VMClusterCell from './cells/VMClusterCell';
import VMIPCell from './cells/VMIPCell';
import VMNameCell from './cells/VMNameCell';
import VMNamespaceCell from './cells/VMNamespaceCell';
import VMNodeCell from './cells/VMNodeCell';
import VMSelectionCell from './cells/VMSelectionCell';
import VMStatusCell from './cells/VMStatusCell';
import VMStorageClassCell from './cells/VMStorageClassCell';
import CPUPercentage from './components/VirtualMachineRow/components/CPUPercentage';
import MemoryPercentage from './components/VirtualMachineRow/components/MemoryPercentage';
import NetworkUsage from './components/VirtualMachineRow/components/NetworkUsage';
import { filterConditions } from './components/VirtualMachineRow/utils/utils';
import { VMStatusConditionLabelList } from './components/VMStatusConditionLabel';
import {
  sortByCPUUsage,
  sortByMemoryUsage,
  sortByNetworkUsage,
  sortByNode,
  sortByStorageClass,
} from './vmSortFunctions';

export const VM_COLUMN_KEYS = {
  actions: ACTIONS,
  cluster: 'cluster',
  conditions: 'conditions',
  cpuUsage: 'cpu-usage',
  created: 'created',
  deletionProtection: 'deletion-protection',
  ipAddress: 'ip-address',
  memoryUsage: 'memory-usage',
  name: 'name',
  namespace: 'namespace',
  networkUsage: 'network-usage',
  node: 'node',
  selection: 'selection',
  status: 'status',
  storageclassname: 'storageclassname',
} as const;

export type VMCallbacks = {
  getVmi: (vm: V1VirtualMachine) => undefined | V1VirtualMachineInstance;
  getVmim: (vm: V1VirtualMachine) => undefined | V1VirtualMachineInstanceMigration;
  pvcMapper: PVCMapper;
  vmiMapper: VMIMapper;
  vmimMapper: VMIMMapper;
};

export const getVMColumns = (
  t: TFunction,
  namespace: string,
  isAllClustersPage: boolean,
  canGetNode: boolean,
): ColumnConfig<V1VirtualMachine, VMCallbacks>[] => {
  const columns: ColumnConfig<V1VirtualMachine, VMCallbacks>[] = [
    {
      getValue: () => '',
      key: VM_COLUMN_KEYS.selection,
      label: '',
      props: { className: 'pf-v6-c-table__check' },
      renderCell: (row) => <VMSelectionCell row={row} />,
    },
    {
      getValue: (row) => getName(row) ?? '',
      key: VM_COLUMN_KEYS.name,
      label: t('Name'),
      props: { className: 'pf-m-width-20' },
      renderCell: (row) => <VMNameCell row={row} />,
      sortable: true,
    },
  ];

  if (isAllClustersPage) {
    columns.push({
      getValue: (row) => getCluster(row) ?? '',
      key: VM_COLUMN_KEYS.cluster,
      label: t('Cluster'),
      renderCell: (row) => <VMClusterCell row={row} />,
      sortable: true,
    });
  }

  if (!namespace) {
    columns.push({
      getValue: (row) => getNamespace(row) ?? '',
      key: VM_COLUMN_KEYS.namespace,
      label: t('Namespace'),
      renderCell: (row) => <VMNamespaceCell row={row} />,
      sortable: true,
    });
  }

  columns.push(
    {
      getValue: (row) => row?.status?.printableStatus ?? '',
      key: VM_COLUMN_KEYS.status,
      label: t('Status'),
      renderCell: (row, callbacks) => <VMStatusCell callbacks={callbacks} row={row} />,
      sortable: true,
    },
    {
      getValue: () => '',
      key: VM_COLUMN_KEYS.conditions,
      label: t('Conditions'),
      renderCell: (row) => <VMStatusConditionLabelList conditions={filterConditions(row)} />,
    },
  );

  if (canGetNode) {
    columns.push({
      key: VM_COLUMN_KEYS.node,
      label: t('Node'),
      renderCell: (row, callbacks) => <VMNodeCell callbacks={callbacks} row={row} />,
      sort: sortByNode,
      sortable: true,
    });
  }

  columns.push(
    {
      additional: true,
      getValue: (row) => row?.metadata?.creationTimestamp ?? '',
      key: VM_COLUMN_KEYS.created,
      label: t('Created'),
      renderCell: (row) => <Timestamp timestamp={row?.metadata?.creationTimestamp} />,
      sortable: true,
    },
    {
      getValue: () => '',
      key: VM_COLUMN_KEYS.ipAddress,
      label: t('IP address'),
      renderCell: (row, callbacks) => <VMIPCell callbacks={callbacks} row={row} />,
    },
    {
      additional: true,
      key: VM_COLUMN_KEYS.memoryUsage,
      label: t('Memory'),
      renderCell: (row, callbacks) => (
        <MemoryPercentage vm={row} vmiMemory={getMemory(callbacks.getVmi(row))} />
      ),
      sort: sortByMemoryUsage,
      sortable: true,
    },
    {
      additional: true,
      key: VM_COLUMN_KEYS.cpuUsage,
      label: t('CPU'),
      renderCell: (row, callbacks) => (
        <CPUPercentage vm={row} vmiCPU={getCPU(callbacks.getVmi(row))} />
      ),
      sort: sortByCPUUsage,
      sortable: true,
    },
    {
      additional: true,
      key: VM_COLUMN_KEYS.networkUsage,
      label: t('Network'),
      renderCell: (row) => <NetworkUsage vm={row} />,
      sort: sortByNetworkUsage,
      sortable: true,
    },
    {
      additional: true,
      getValue: (row) => getDeletionProtectionPrintableStatus(row),
      key: VM_COLUMN_KEYS.deletionProtection,
      label: t('Deletion protection'),
      renderCell: (row) => <>{getDeletionProtectionPrintableStatus(row)}</>,
      sortable: true,
    },
    {
      additional: true,
      key: VM_COLUMN_KEYS.storageclassname,
      label: t('Storage class'),
      renderCell: (row, callbacks) => <VMStorageClassCell callbacks={callbacks} row={row} />,
      sort: sortByStorageClass,
      sortable: true,
    },
    {
      key: VM_COLUMN_KEYS.actions,
      label: '',
      props: { className: 'pf-v6-c-table__action' },
      renderCell: (row, callbacks) => <VMActionsCell callbacks={callbacks} row={row} />,
    },
  );

  return columns;
};

export const getVMRowId = (vm: V1VirtualMachine, index: number): string =>
  getK8sRowId(vm, index, 'vm');
