import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { DiskRowDataLayout } from '@kubevirt-utils/resources/vm/utils/disk/constants';
import { TableColumn } from '@openshift-console/dynamic-plugin-sdk';
import { sortable } from '@patternfly/react-table';

const useDiskColumns = () => {
  const { t } = useKubevirtTranslation();

  const columns: TableColumn<DiskRowDataLayout>[] = [
    {
      title: t('Name'),
      id: 'name',
      transforms: [sortable],
      sort: 'name',
    },
    {
      title: t('Source'),
      id: 'source',
      transforms: [sortable],
      sort: 'source',
    },
    {
      title: t('Size'),
      id: 'size',
      transforms: [sortable],
      sort: 'size',
    },
    {
      title: t('Drive'),
      id: 'drive',
      transforms: [sortable],
      sort: 'drive',
    },
    {
      title: t('Interface'),
      id: 'interface',
      transforms: [sortable],
      sort: 'interface',
    },
    {
      title: t('Storage class'),
      id: 'storage-class',
      transforms: [sortable],
      sort: 'storageClass',
    },
    {
      title: '',
      id: '',
      props: { className: 'dropdown-kebab-pf pf-c-table__action' },
    },
  ];

  return columns;
};

export default useDiskColumns;
