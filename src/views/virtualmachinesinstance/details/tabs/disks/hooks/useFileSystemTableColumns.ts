import * as React from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { sortable } from '@patternfly/react-table';

import {
  columnsNumberSorting,
  columnsStringSorting,
  FileSystemPresentation,
} from '../utils/virtualMachinesInstancePageDisksTabUtils';

const useFileSystemTableColumns = () => {
  const { t } = useKubevirtTranslation();

  const columns = React.useMemo(
    () => [
      {
        title: t('Name'),
        id: 'diskName',
        transforms: [sortable],
        sort: columnsStringSorting<FileSystemPresentation>('diskName'),
      },
      {
        title: t('File System Type'),
        id: 'fileSystemType',
        transforms: [sortable],
        sort: columnsStringSorting<FileSystemPresentation>('fileSystemType'),
      },
      {
        title: t('Mount Point'),
        id: 'mountPoint',
        transforms: [sortable],
        sort: columnsStringSorting<FileSystemPresentation>('mountPoint'),
      },
      {
        title: t('Total Bytes'),
        id: 'totalBytes',
        transforms: [sortable],
        sort: columnsNumberSorting<FileSystemPresentation>('totalBytes'),
      },
      {
        title: t('Used Bytes'),
        id: 'usedBytes',
        transforms: [sortable],
        sort: columnsNumberSorting<FileSystemPresentation>('usedBytes'),
      },
    ],
    [t],
  );

  return columns;
};

export default useFileSystemTableColumns;
