import { type TFunction } from 'i18next';

import { type ColumnConfig } from '@kubevirt-utils/hooks/useDataViewTableSort/types';
import { NO_DATA_DASH } from '@kubevirt-utils/resources/vm/utils/constants';
import { getHumanizedSize } from '@kubevirt-utils/utils/units';

export type FileSystemData = {
  diskName?: string;
  fileSystemType?: string;
  mountPoint?: string;
  totalBytes?: number;
  usedBytes?: number;
};

export const getFileSystemColumns = (t: TFunction): ColumnConfig<FileSystemData, undefined>[] => [
  {
    getValue: (row) => row.diskName ?? '',
    key: 'diskName',
    label: t('Name'),
    renderCell: (row) => row.diskName ?? NO_DATA_DASH,
    sortable: true,
  },
  {
    getValue: (row) => row.fileSystemType ?? '',
    key: 'fileSystemType',
    label: t('File system type'),
    renderCell: (row) => row.fileSystemType ?? NO_DATA_DASH,
    sortable: true,
  },
  {
    getValue: (row) => row.mountPoint ?? '',
    key: 'mountPoint',
    label: t('Mount point'),
    renderCell: (row) => row.mountPoint ?? NO_DATA_DASH,
    sortable: true,
  },
  {
    getValue: (row) => row.totalBytes ?? 0,
    key: 'totalBytes',
    label: t('Total bytes'),
    renderCell: (row) =>
      row.totalBytes != null ? getHumanizedSize(String(row.totalBytes)).string : NO_DATA_DASH,
    sortable: true,
  },
  {
    getValue: (row) => row.usedBytes ?? 0,
    key: 'usedBytes',
    label: t('Used bytes'),
    renderCell: (row) =>
      row.usedBytes != null ? getHumanizedSize(String(row.usedBytes)).string : NO_DATA_DASH,
    sortable: true,
  },
];

export const getFileSystemRowId = (fileSystem: FileSystemData): string =>
  `${fileSystem.diskName ?? NO_DATA_DASH}-${fileSystem.mountPoint ?? NO_DATA_DASH}`;
