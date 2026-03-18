import React, { ReactNode } from 'react';
import { TFunction } from 'react-i18next';

import DiskNameCell from '@kubevirt-utils/components/DiskNameCell/DiskNameCell';
import { ColumnConfig } from '@kubevirt-utils/hooks/useDataViewTableSort/types';
import { NO_DATA_DASH } from '@kubevirt-utils/resources/vm/utils/constants';
import { DiskRowDataLayout } from '@kubevirt-utils/resources/vm/utils/disk/constants';
import { readableSizeUnit } from '@kubevirt-utils/utils/units';

import DiskRowActions from './components/DiskRowActions';
import DiskSourceCell from './components/DiskSourceCell';

const renderActionsCell = (row: DiskRowDataLayout): ReactNode => (
  <DiskRowActions diskName={row?.name} />
);

export const getWizardDiskColumns = (t: TFunction): ColumnConfig<DiskRowDataLayout>[] => [
  {
    getValue: (row) => row?.name ?? '',
    key: 'name',
    label: t('Name'),
    renderCell: (row) => <DiskNameCell row={row} />,
    sortable: true,
  },
  {
    getValue: (row) => row?.source ?? '',
    key: 'source',
    label: t('Source'),
    renderCell: (row) => <DiskSourceCell row={row} />,
    sortable: true,
  },
  {
    getValue: (row) => row?.size ?? '',
    key: 'size',
    label: t('Size'),
    renderCell: (row) => <>{readableSizeUnit(row?.size) ?? NO_DATA_DASH}</>,
    sortable: true,
  },
  {
    getValue: (row) => row?.drive ?? '',
    key: 'drive',
    label: t('Drive'),
    renderCell: (row) => <>{row?.drive ?? NO_DATA_DASH}</>,
    sortable: true,
  },
  {
    getValue: (row) => row?.interface ?? '',
    key: 'interface',
    label: t('Interface'),
    renderCell: (row) => <>{row?.interface ?? NO_DATA_DASH}</>,
    sortable: true,
  },
  {
    getValue: (row) => row?.storageClass ?? '',
    key: 'storage-class',
    label: t('Storage class'),
    renderCell: (row) => <>{row?.storageClass ?? NO_DATA_DASH}</>,
    sortable: true,
  },
  {
    key: 'actions',
    label: '',
    props: { className: 'pf-v6-c-table__action' },
    renderCell: renderActionsCell,
  },
];

export const getWizardDiskRowId = (row: DiskRowDataLayout, index: number): string =>
  row?.name ?? `disk-${index}`;
