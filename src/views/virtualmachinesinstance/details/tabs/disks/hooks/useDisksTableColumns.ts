import * as React from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { sortable } from '@patternfly/react-table';

import {
  columnsNumberSorting,
  columnsStringSorting,
  DiskPresentation,
} from '../utils/virtualMachinesInstancePageDisksTabUtils';

const useDisksTableColumns = () => {
  const { t } = useKubevirtTranslation();

  const columns = React.useMemo(
    () => [
      {
        title: t('Name'),
        id: 'name',
        transforms: [sortable],
        sort: columnsStringSorting<DiskPresentation>('name'),
      },
      {
        title: t('Source'),
        id: 'source',
        transforms: [sortable],
        sort: columnsStringSorting<DiskPresentation>('source'),
      },
      {
        title: t('Size'),
        id: 'size',
        transforms: [sortable],
        sort: columnsNumberSorting<DiskPresentation>('size'),
      },
      {
        title: t('Drive'),
        id: 'drive',
        transforms: [sortable],
        sort: columnsStringSorting<DiskPresentation>('drive'),
      },
      {
        title: t('Interface'),
        id: 'interface',
        transforms: [sortable],
        sort: columnsStringSorting<DiskPresentation>('interface'),
      },
      {
        title: t('Storage Class'),
        id: 'storageClass',
        transforms: [sortable],
        sort: columnsStringSorting<DiskPresentation>('storageClass'),
      },
    ],
    [t],
  );

  return columns;
};

export default useDisksTableColumns;
