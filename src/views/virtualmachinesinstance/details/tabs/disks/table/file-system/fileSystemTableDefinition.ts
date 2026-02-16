import { TFunction } from 'react-i18next';

import { V1VirtualMachineInstanceFileSystem } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { ColumnConfig } from '@kubevirt-utils/hooks/useDataViewTableSort';
import { NO_DATA_DASH } from '@kubevirt-utils/resources/vm/utils/constants';
import { humanizeBinaryBytes } from '@kubevirt-utils/utils/humanize.js';

/** Column definitions for the file system table */
export const getFileSystemColumns = (
  t: TFunction,
): ColumnConfig<V1VirtualMachineInstanceFileSystem, undefined>[] => [
  {
    getValue: (r) => r.diskName || '',
    key: 'diskName',
    label: t('Name'),
    renderCell: (r) => r.diskName,
    sortable: true,
  },
  {
    getValue: (r) => r.fileSystemType || '',
    key: 'fileSystemType',
    label: t('File system type'),
    renderCell: (r) => r.fileSystemType,
    sortable: true,
  },
  {
    getValue: (r) => r.mountPoint || '',
    key: 'mountPoint',
    label: t('Mount point'),
    renderCell: (r) => r.mountPoint,
    sortable: true,
  },
  {
    getValue: (r) => r.totalBytes || 0,
    key: 'totalBytes',
    label: t('Total bytes'),
    renderCell: (r) => (r.totalBytes ? humanizeBinaryBytes(r.totalBytes).string : NO_DATA_DASH),
    sortable: true,
  },
  {
    getValue: (r) => r.usedBytes || 0,
    key: 'usedBytes',
    label: t('Used bytes'),
    renderCell: (r) => (r.usedBytes ? humanizeBinaryBytes(r.usedBytes).string : NO_DATA_DASH),
    sortable: true,
  },
];

/** Generate unique row ID for file system rows */
export const getFileSystemRowId = (fs: V1VirtualMachineInstanceFileSystem, index: number): string =>
  `${fs.diskName}-${index}`;
