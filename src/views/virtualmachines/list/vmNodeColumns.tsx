// Extracted from virtualMachinesDefinition.tsx
// Root: src/views/virtualmachines/list/virtualMachinesDefinition.tsx

import { type ReactNode } from 'react';
import { type TFunction } from 'i18next';

import { type V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import Timestamp from '@kubevirt-utils/components/Timestamp/Timestamp';
import { NO_DATA_DASH } from '@kubevirt-utils/resources/vm/utils/constants';
import { getIPAddressesDisplayValue, getVMINodeName } from '@kubevirt-utils/resources/vmi';

import VMIPCell from './cells/VMIPCell';
import VMNodeCell from './cells/VMNodeCell';
import VMStatusCell from './cells/VMStatusCell';
import { filterConditions } from './components/VirtualMachineRow/utils/utils';
import { VMStatusConditionLabelList } from './components/VMStatusConditionLabel';
import { getConditionsDisplayValue } from './components/VMStatusConditionLabel/utils';
import { VM_COLUMN_KEYS, type VMCallbacks, type VMColumn } from './vmColumnTypes';
import { sortByNode } from './vmSortFunctions';

export const getStatusColumn = (t: TFunction): VMColumn => ({
  getValue: (row: V1VirtualMachine): string => row?.status?.printableStatus ?? '',
  key: VM_COLUMN_KEYS.status,
  label: t('Status'),
  renderCell: (row: V1VirtualMachine, callbacks: VMCallbacks): ReactNode => (
    <VMStatusCell callbacks={callbacks} row={row} />
  ),
  sortable: true,
});

export const getConditionsColumn = (t: TFunction): VMColumn => ({
  getValue: (row: V1VirtualMachine): string => getConditionsDisplayValue(filterConditions(row)),
  key: VM_COLUMN_KEYS.conditions,
  label: t('Conditions'),
  renderCell: (row: V1VirtualMachine): ReactNode => (
    <VMStatusConditionLabelList conditions={filterConditions(row)} />
  ),
});

export const getNodeColumns = (t: TFunction, canGetNode: boolean): VMColumn[] =>
  canGetNode
    ? [
        {
          getValue: (row: V1VirtualMachine, callbacks: VMCallbacks): string =>
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
    : [];

export const getCreatedColumn = (t: TFunction): VMColumn => ({
  additional: true,
  getValue: (row: V1VirtualMachine): string => row?.metadata?.creationTimestamp ?? '',
  key: VM_COLUMN_KEYS.created,
  label: t('Created'),
  renderCell: (row: V1VirtualMachine): ReactNode => (
    <Timestamp timestamp={row?.metadata?.creationTimestamp} />
  ),
  sortable: true,
});

export const getIPAddressColumn = (t: TFunction): VMColumn => ({
  getValue: (row: V1VirtualMachine, callbacks: VMCallbacks): string =>
    getIPAddressesDisplayValue(callbacks?.getVmi(row)),
  key: VM_COLUMN_KEYS.ipAddress,
  label: t('IP address'),
  renderCell: (row: V1VirtualMachine, callbacks: VMCallbacks): ReactNode => (
    <VMIPCell callbacks={callbacks} row={row} />
  ),
});
