import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { DiskRowDataLayout } from '@kubevirt-utils/resources/vm/utils/disk/constants';
import { TableColumn } from '@openshift-console/dynamic-plugin-sdk';
import { sortable } from '@patternfly/react-table';

const useDiskColumns = () => {
  const { t } = useKubevirtTranslation();

  const columns: TableColumn<DiskRowDataLayout>[] = [
    {
      id: 'name',
      sort: 'name',
      title: t('Name'),
      transforms: [sortable],
    },
    {
      id: 'source',
      sort: 'source',
      title: t('Source'),
      transforms: [sortable],
    },
    {
      id: 'size',
      sort: 'size',
      title: t('Size'),
      transforms: [sortable],
    },
    {
      id: 'drive',
      sort: 'drive',
      title: t('Drive'),
      transforms: [sortable],
    },
    {
      id: 'interface',
      sort: 'interface',
      title: t('Interface'),
      transforms: [sortable],
    },
    {
      id: 'storage-class',
      sort: 'storageClass',
      title: t('Storage class'),
      transforms: [sortable],
    },
    {
      id: '',
      props: { className: 'dropdown-kebab-pf pf-c-table__action' },
      title: '',
    },
  ];

  return columns;
};

export default useDiskColumns;
