import * as React from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { TableColumn } from '@openshift-console/dynamic-plugin-sdk';

import { DiskRowDataLayout } from '../utils/VirtualMachineDisksTabUtils';

const useDiskColumns = () => {
  const { t } = useKubevirtTranslation();

  const columns: TableColumn<DiskRowDataLayout>[] = React.useMemo(
    () => [
      {
        title: t('Name'),
        id: 'name',
      },
      {
        title: t('Source'),
        id: 'source',
      },
      {
        title: t('Size'),
        id: 'size',
      },
      {
        title: t('Drive'),
        id: 'drive',
      },
      {
        title: t('Interface'),
        id: 'interface',
      },
      {
        title: t('Storage class'),
        id: 'storage-class',
      },
      {
        title: '',
        id: 'actions',
        props: { className: 'dropdown-kebab-pf pf-c-table__action' },
      },
    ],
    [t],
  );

  return columns;
};

export default useDiskColumns;
