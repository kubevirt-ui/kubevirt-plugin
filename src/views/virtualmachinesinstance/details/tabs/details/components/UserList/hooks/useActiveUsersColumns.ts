import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import {
  K8sResourceCommon,
  TableColumn,
  useActiveColumns,
} from '@openshift-console/dynamic-plugin-sdk';
import { sortable } from '@patternfly/react-table';

const useActiveUsersColumns = (): { id: string; title: string }[] => {
  const { t } = useKubevirtTranslation();

  const columns: TableColumn<K8sResourceCommon>[] = [
    {
      id: 'userName',
      sort: 'metadata.name',
      title: t('User Name'),
      transforms: [sortable],
    },
    {
      id: 'domain',
      sort: 'domain',
      title: t('Domain'),
      transforms: [sortable],
    },
    {
      id: 'loginTime',
      sort: 'loginTime',
      title: t('Time of login'),
      transforms: [sortable],
    },
    {
      id: 'elapsedTime',
      title: t('Elapsed time since login'),
    },
  ];

  const [activeColumns] = useActiveColumns<K8sResourceCommon>({
    columnManagementID: '',
    columns,
    showNamespaceOverride: false,
  });

  return activeColumns;
};

export default useActiveUsersColumns;
