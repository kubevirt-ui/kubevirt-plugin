import { TFunction } from 'i18next';
import React, { ReactNode } from 'react';

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
import { NO_DATA_DASH } from '@kubevirt-utils/resources/vm/utils/constants';
import { getVMIIPAddresses, getVMINodeName } from '@kubevirt-utils/resources/vmi';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { getCluster } from '@multicluster/helpers/selectors';
import { getDeletionProtectionPrintableStatus } from '@virtualmachines/details/tabs/configuration/details/components/DeletionProtection/utils/utils';
import {
  getVirtualMachineStorageClasses,
  PVCMapper,
  VMIMapper,
  VMIMMapper,
} from '@virtualmachines/utils/mappers';

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
  hideActions = false,
): ColumnConfig<V1VirtualMachine, VMCallbacks>[] => [
  ...(!hideActions
    ? [
        {
          getValue: () => '',
          key: VM_COLUMN_KEYS.selection,
          label: '',
          props: { className: 'pf-v6-c-table__check' },
          renderCell: (row: V1VirtualMachine) => <VMSelectionCell row={row} />,
        },
      ]
    : []),
  {
    getValue: (row) => getName(row) ?? '',
    key: VM_COLUMN_KEYS.name,
    label: t('Name'),
    props: { className: 'pf-m-width-20' },
    renderCell: (row) => <VMNameCell row={row} />,
    sortable: true,
  },
  ...(isAllClustersPage
    ? [
        {
          getValue: (row) => getCluster(row) ?? '',
          key: VM_COLUMN_KEYS.cluster,
          label: t('Cluster'),
          renderCell: (row: V1VirtualMachine) => <VMClusterCell row={row} />,
          sortable: true,
        },
      ]
    : []),
  ...(!namespace
    ? [
        {
          getValue: (row) => getNamespace(row) ?? '',
          key: VM_COLUMN_KEYS.namespace,
          label: t('Namespace'),
          renderCell: (row: V1VirtualMachine) => <VMNamespaceCell row={row} />,
          sortable: true,
        },
      ]
    : []),
  {
    getValue: (row) => row?.status?.printableStatus ?? '',
    key: VM_COLUMN_KEYS.status,
    label: t('Status'),
    renderCell: (row, callbacks) => <VMStatusCell callbacks={callbacks} row={row} />,
    sortable: true,
  },
  {
    getValue: (row: V1VirtualMachine): string => {
      const types = filterConditions(row)
        ?.map((condition) => condition?.type)
        .filter(Boolean);
      return !isEmpty(types) ? types.join(', ') : NO_DATA_DASH;
    },
    key: VM_COLUMN_KEYS.conditions,
    label: t('Conditions'),
    renderCell: (row) => <VMStatusConditionLabelList conditions={filterConditions(row)} />,
  },
  ...(canGetNode
    ? [
        {
          getValue: (row: V1VirtualMachine, callbacks: VMCallbacks) =>
            getVMINodeName(callbacks?.getVmi(row)) ?? NO_DATA_DASH,
          key: VM_COLUMN_KEYS.node,
          label: t('Node'),
          renderCell: (row: V1VirtualMachine, callbacks: VMCallbacks): ReactNode => (
            <VMNodeCell callbacks={callbacks} row={row} />
          ),
          sort: sortByNode,
          sortable: true,
        },
      ]
    : []),
  {
    additional: true,
    getValue: (row) => row?.metadata?.creationTimestamp ?? '',
    key: VM_COLUMN_KEYS.created,
    label: t('Created'),
    renderCell: (row: V1VirtualMachine) => (
      <Timestamp timestamp={row?.metadata?.creationTimestamp} />
    ),
    sortable: true,
  },
  {
    getValue: (row, callbacks): string => {
      const vmi = callbacks?.getVmi(row);
      if (!vmi) {
        return NO_DATA_DASH;
      }
      const ips = getVMIIPAddresses(vmi);
      return !isEmpty(ips) ? ips.join(', ') : NO_DATA_DASH;
    },
    key: VM_COLUMN_KEYS.ipAddress,
    label: t('IP address'),
    renderCell: (row: V1VirtualMachine, callbacks: VMCallbacks) => (
      <VMIPCell callbacks={callbacks} row={row} />
    ),
  },
  {
    additional: true,
    key: VM_COLUMN_KEYS.memoryUsage,
    label: t('Memory'),
    renderCell: (row: V1VirtualMachine, callbacks: VMCallbacks) => (
      <MemoryPercentage vm={row} vmiMemory={getMemory(callbacks.getVmi(row))} />
    ),
    sort: sortByMemoryUsage,
    sortable: true,
  },
  {
    additional: true,
    key: VM_COLUMN_KEYS.cpuUsage,
    label: t('CPU'),
    renderCell: (row: V1VirtualMachine, callbacks: VMCallbacks) => (
      <CPUPercentage vm={row} vmiCPU={getCPU(callbacks.getVmi(row))} />
    ),
    sort: sortByCPUUsage,
    sortable: true,
  },
  {
    additional: true,
    key: VM_COLUMN_KEYS.networkUsage,
    label: t('Network'),
    renderCell: (row: V1VirtualMachine) => <NetworkUsage vm={row} />,
    sort: sortByNetworkUsage,
    sortable: true,
  },
  {
    additional: true,
    getValue: (row) => getDeletionProtectionPrintableStatus(row),
    key: VM_COLUMN_KEYS.deletionProtection,
    label: t('Deletion protection'),
    renderCell: (row: V1VirtualMachine) => <>{getDeletionProtectionPrintableStatus(row)}</>,
    sortable: true,
  },
  {
    additional: true,
    getValue: (row: V1VirtualMachine, callbacks: VMCallbacks): string => {
      const storageClasses = callbacks?.pvcMapper
        ? getVirtualMachineStorageClasses(row, callbacks.pvcMapper)
        : [];
      return !isEmpty(storageClasses) ? storageClasses.join(', ') : NO_DATA_DASH;
    },
    key: VM_COLUMN_KEYS.storageclassname,
    label: t('Storage class'),
    renderCell: (row, callbacks) => <VMStorageClassCell callbacks={callbacks} row={row} />,
    sort: sortByStorageClass,
    sortable: true,
  },
  ...(!hideActions
    ? [
        {
          key: VM_COLUMN_KEYS.actions,
          label: '',
          props: { className: 'pf-v6-c-table__action' },
          renderCell: (row: V1VirtualMachine, callbacks: VMCallbacks) => (
            <VMActionsCell callbacks={callbacks} row={row} />
          ),
        },
      ]
    : []),
];

export const getVMRowId = (vm: V1VirtualMachine, index: number): string =>
  getK8sRowId(vm, index, 'vm');
