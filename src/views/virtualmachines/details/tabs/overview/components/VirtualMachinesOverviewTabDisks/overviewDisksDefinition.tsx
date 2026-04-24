import React, { FC } from 'react';
import { TFunction } from 'i18next';

import { ColumnConfig } from '@kubevirt-utils/hooks/useDataViewTableSort/types';
import { NO_DATA_DASH } from '@kubevirt-utils/resources/vm/utils/constants';
import { DiskRowDataLayout } from '@kubevirt-utils/resources/vm/utils/disk/constants';
import { readableSizeUnit } from '@kubevirt-utils/utils/units';

const NameCell: FC<{ row: DiskRowDataLayout }> = ({ row }) => (
  <div data-test-id={`disk-${row?.name}`}>{row?.name}</div>
);

const DriveCell: FC<{ row: DiskRowDataLayout }> = ({ row }) => (
  <div data-test-id={`disk-drive-${row?.name}`}>{row?.drive ?? NO_DATA_DASH}</div>
);

const SizeCell: FC<{ row: DiskRowDataLayout }> = ({ row }) => (
  <div data-test-id={`disk-size-${row?.name}`}>{readableSizeUnit(row?.size) ?? NO_DATA_DASH}</div>
);

const InterfaceCell: FC<{ row: DiskRowDataLayout }> = ({ row }) => (
  <div data-test-id={`disk-interface-${row?.name}`}>{row?.interface ?? NO_DATA_DASH}</div>
);

export const getOverviewDisksColumns = (
  t: TFunction,
): ColumnConfig<DiskRowDataLayout, undefined>[] => [
  {
    key: 'name',
    label: t('Name'),
    renderCell: (row) => <NameCell row={row} />,
  },
  {
    key: 'drive',
    label: t('Drive'),
    renderCell: (row) => <DriveCell row={row} />,
  },
  {
    key: 'size',
    label: t('Size'),
    renderCell: (row) => <SizeCell row={row} />,
  },
  {
    key: 'interface',
    label: t('Interface'),
    renderCell: (row) => <InterfaceCell row={row} />,
  },
];

export const getOverviewDiskRowId = (row: DiskRowDataLayout): string =>
  `${row.name ?? NO_DATA_DASH}-${row.source ?? NO_DATA_DASH}`;
