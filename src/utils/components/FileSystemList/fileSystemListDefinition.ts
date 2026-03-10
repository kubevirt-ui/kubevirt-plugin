import { TFunction } from 'react-i18next';

import { ColumnConfig } from '@kubevirt-utils/hooks/useDataViewTableSort/types';
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
    getValue: (r) => r.diskName ?? '',
    key: 'diskName',
    label: t('Name'),
    renderCell: (r) => r.diskName ?? NO_DATA_DASH,
    sortable: true,
  },
  {
    getValue: (r) => r.fileSystemType ?? '',
    key: 'fileSystemType',
    label: t('File system type'),
    renderCell: (r) => r.fileSystemType ?? NO_DATA_DASH,
    sortable: true,
  },
  {
    getValue: (r) => r.mountPoint ?? '',
    key: 'mountPoint',
    label: t('Mount point'),
    renderCell: (r) => r.mountPoint ?? NO_DATA_DASH,
    sortable: true,
  },
  {
    getValue: (r) => r.totalBytes ?? 0,
    key: 'totalBytes',
    label: t('Total bytes'),
    renderCell: (r) =>
      r.totalBytes != null ? getHumanizedSize(String(r.totalBytes)).string : NO_DATA_DASH,
    sortable: true,
  },
  {
    getValue: (r) => r.usedBytes ?? 0,
    key: 'usedBytes',
    label: t('Used bytes'),
    renderCell: (r) =>
      r.usedBytes != null ? getHumanizedSize(String(r.usedBytes)).string : NO_DATA_DASH,
    sortable: true,
  },
];

export const getFileSystemRowId = (fs: FileSystemData): string =>
  `${fs.diskName ?? NO_DATA_DASH}-${fs.mountPoint ?? NO_DATA_DASH}`;
