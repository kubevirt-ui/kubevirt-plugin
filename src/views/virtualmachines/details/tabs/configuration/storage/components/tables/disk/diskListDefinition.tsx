import React, { ReactNode } from 'react';
import { TFunction } from 'react-i18next';

import { V1VirtualMachine, V1VirtualMachineInstance } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { ColumnConfig } from '@kubevirt-utils/hooks/useDataViewTableSort/types';
import { NameWithPercentages } from '@kubevirt-utils/resources/vm/hooks/types';
import { NO_DATA_DASH } from '@kubevirt-utils/resources/vm/utils/constants';
import { DiskRowDataLayout } from '@kubevirt-utils/resources/vm/utils/disk/constants';
import { readableSizeUnit } from '@kubevirt-utils/utils/units';

import DiskNameCell from './cells/DiskNameCell';
import DiskSourceCell from './cells/DiskSourceCell';
import DiskRowActions from './DiskRowActions';

import '../tables.scss';

export type DiskListCallbacks = {
  customize?: boolean;
  onSubmit?: (updatedVM: V1VirtualMachine) => Promise<V1VirtualMachine>;
  provisioningPercentages: NameWithPercentages;
  sourcesLoaded?: boolean;
  vm: V1VirtualMachine;
  vmi?: V1VirtualMachineInstance;
};

const renderActionsCell = (row: DiskRowDataLayout, callbacks: DiskListCallbacks): ReactNode => {
  const { customize, onSubmit, vm, vmi } = callbacks;
  return (
    <DiskRowActions customize={customize} obj={row} onDiskUpdate={onSubmit} vm={vm} vmi={vmi} />
  );
};

export const getDiskListColumns = (
  t: TFunction,
): ColumnConfig<DiskRowDataLayout, DiskListCallbacks>[] => [
  {
    getValue: (row) => row.name ?? '',
    key: 'name',
    label: t('Name'),
    renderCell: (row, callbacks) => (
      <DiskNameCell
        provisioningPercentages={callbacks.provisioningPercentages}
        row={row}
        vm={callbacks.vm}
        vmi={callbacks.vmi}
      />
    ),
    sortable: true,
  },
  {
    getValue: (row) => row.source ?? '',
    key: 'source',
    label: t('Source'),
    renderCell: (row, callbacks) => (
      <DiskSourceCell row={row} sourcesLoaded={callbacks.sourcesLoaded} vm={callbacks.vm} />
    ),
    sortable: true,
  },
  {
    getValue: (row) => row.size ?? '',
    key: 'size',
    label: t('Size'),
    renderCell: (row) => (
      <span data-test-id={`disk-size-${row.name}`}>
        {readableSizeUnit(row.size) ?? NO_DATA_DASH}
      </span>
    ),
    sortable: true,
  },
  {
    getValue: (row) => row.drive ?? '',
    key: 'drive',
    label: t('Drive'),
    renderCell: (row) => (
      <span data-test-id={`disk-drive-${row.name}`}>{row.drive ?? NO_DATA_DASH}</span>
    ),
    sortable: true,
  },
  {
    getValue: (row) => row.interface ?? '',
    key: 'interface',
    label: t('Interface'),
    renderCell: (row) => (
      <span data-test-id={`disk-interface-${row.name}`}>{row.interface ?? NO_DATA_DASH}</span>
    ),
    sortable: true,
  },
  {
    getValue: (row) => row.storageClass ?? '',
    key: 'storage-class',
    label: t('Storage class'),
    renderCell: (row) => (
      <span data-test-id={`disk-storage-class-${row.name}`}>
        {row.storageClass ?? NO_DATA_DASH}
      </span>
    ),
    sortable: true,
  },
  {
    key: 'actions',
    label: '',
    props: { className: 'pf-v6-c-table__action' },
    renderCell: renderActionsCell,
  },
];

export const getDiskRowId = (row: DiskRowDataLayout): string =>
  `${row.name ?? 'unknown'}-${row.source ?? 'no-source'}`;
