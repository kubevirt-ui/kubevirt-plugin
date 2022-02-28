import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { sortable } from '@patternfly/react-table';

const useDisksTableColumns = () => {
  const { t } = useKubevirtTranslation();

  const columns = [
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
      title: t('Storage Class'),
      id: 'storageClass',
      transforms: [sortable],
      sort: 'storageClass',
    },
  ];

  return columns;
};

export default useDisksTableColumns;
