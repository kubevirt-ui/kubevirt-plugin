import { V1alpha1VirtualMachineSnapshot } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { TableColumn } from '@openshift-console/dynamic-plugin-sdk';
import { sortable } from '@patternfly/react-table';

const useSnapshotColumns = () => {
  const { t } = useKubevirtTranslation();

  const columns: TableColumn<V1alpha1VirtualMachineSnapshot>[] = [
    {
      id: 'name',
      sort: 'metadata.name',
      title: t('Name'),
      transforms: [sortable],
    },
    {
      id: 'created',
      sort: 'metadata.creationTimestamp',
      title: t('Created'),
      transforms: [sortable],
    },
    {
      id: 'status',
      sort: 'status.readyToUse',
      title: t('Status'),
      transforms: [sortable],
    },
    {
      id: 'last-restored',
      title: t('Last restored'),
    },
    {
      id: 'indications',
      title: t('Indications'),
    },
    {
      id: '',
      props: { className: 'dropdown-kebab-pf pf-v5-c-table__action' },
      title: '',
    },
  ];

  return columns;
};

export default useSnapshotColumns;
