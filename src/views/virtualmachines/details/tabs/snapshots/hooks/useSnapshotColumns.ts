import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { sortable } from '@patternfly/react-table';

const useSnapshotColumns = () => {
  const { t } = useKubevirtTranslation();

  const columns = [
    {
      title: t('Name'),
      id: 'name',
      transforms: [sortable],
      sort: 'metadata.name',
    },
    {
      title: t('Created'),
      id: 'created',
      transforms: [sortable],
      sort: 'metadata.creationTimestamp',
    },
    {
      title: t('Status'),
      id: 'status',
      transforms: [sortable],
      sort: 'status.readyToUse',
    },
    {
      title: t('Last restored'),
      id: 'last-restored',
    },
    {
      title: t('Indications'),
      id: 'indications',
    },
    {
      title: '',
      id: 'restore-snapshot',
    },
    {
      title: '',
      id: 'actions',
      props: { className: 'dropdown-kebab-pf pf-c-table__action' },
    },
  ];

  return columns;
};

export default useSnapshotColumns;
