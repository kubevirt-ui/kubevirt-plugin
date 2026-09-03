// Extracted from virtualMachinesDefinition.tsx
// Root: src/views/virtualmachines/list/virtualMachinesDefinition.tsx

import React, { type ReactNode } from 'react';
import { type TFunction } from 'i18next';

import { type V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { getCPU, getMemory } from '@kubevirt-utils/resources/vm';
import { NO_DATA_DASH } from '@kubevirt-utils/resources/vm/utils/constants';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { getDeletionProtectionPrintableStatus } from '@virtualmachines/details/tabs/configuration/details/components/DeletionProtection/utils/utils';
import { getVirtualMachineStorageClasses } from '@virtualmachines/utils/mappers';

import VMActionsCell from './cells/VMActionsCell';
import VMStorageClassCell from './cells/VMStorageClassCell';
import CPUPercentage from './components/VirtualMachineRow/components/CPUPercentage';
import MemoryPercentage from './components/VirtualMachineRow/components/MemoryPercentage';
import NetworkUsage from './components/VirtualMachineRow/components/NetworkUsage';
import { VM_COLUMN_KEYS, type VMCallbacks, type VMColumn } from './vmColumnTypes';
import {
  sortByCPUUsage,
  sortByMemoryUsage,
  sortByNetworkUsage,
  sortByStorageClass,
} from './vmSortFunctions';

export const getMemoryColumn = (t: TFunction): VMColumn => ({
  additional: true,
  key: VM_COLUMN_KEYS.memoryUsage,
  label: t('Memory'),
  renderCell: (row: V1VirtualMachine, callbacks: VMCallbacks): ReactNode => (
    <MemoryPercentage vm={row} vmiMemory={getMemory(callbacks.getVmi(row))} />
  ),
  sort: sortByMemoryUsage,
  sortable: true,
});

export const getCPUColumn = (t: TFunction): VMColumn => ({
  additional: true,
  key: VM_COLUMN_KEYS.cpuUsage,
  label: t('CPU'),
  renderCell: (row: V1VirtualMachine, callbacks: VMCallbacks): ReactNode => (
    <CPUPercentage vm={row} vmiCPU={getCPU(callbacks.getVmi(row))} />
  ),
  sort: sortByCPUUsage,
  sortable: true,
});

export const getNetworkColumn = (t: TFunction): VMColumn => ({
  additional: true,
  key: VM_COLUMN_KEYS.networkUsage,
  label: t('Network'),
  renderCell: (row: V1VirtualMachine): ReactNode => <NetworkUsage vm={row} />,
  sort: sortByNetworkUsage,
  sortable: true,
});

export const getDeletionProtectionColumn = (t: TFunction): VMColumn => ({
  additional: true,
  getValue: (row: V1VirtualMachine): string => getDeletionProtectionPrintableStatus(row),
  key: VM_COLUMN_KEYS.deletionProtection,
  label: t('Deletion protection'),
  renderCell: (row: V1VirtualMachine): ReactNode => (
    <>{getDeletionProtectionPrintableStatus(row)}</>
  ),
  sortable: true,
});

export const getStorageClassColumn = (t: TFunction): VMColumn => ({
  additional: true,
  getValue: (row: V1VirtualMachine, callbacks: VMCallbacks): string => {
    const storageClasses = callbacks?.pvcMapper
      ? getVirtualMachineStorageClasses(row, callbacks.pvcMapper)
      : [];
    return !isEmpty(storageClasses) ? storageClasses.join(', ') : NO_DATA_DASH;
  },
  key: VM_COLUMN_KEYS.storageclassname,
  label: t('Storage class'),
  renderCell: (row: V1VirtualMachine, callbacks: VMCallbacks): ReactNode => (
    <VMStorageClassCell callbacks={callbacks} row={row} />
  ),
  sort: sortByStorageClass,
  sortable: true,
});

export const getActionsColumns = (hideActions: boolean): VMColumn[] =>
  hideActions
    ? []
    : [
        {
          key: VM_COLUMN_KEYS.actions,
          label: '',
          props: { className: 'pf-v6-c-table__action' },
          renderCell: (row: V1VirtualMachine, callbacks: VMCallbacks): ReactNode => (
            <VMActionsCell callbacks={callbacks} row={row} />
          ),
        },
      ];
