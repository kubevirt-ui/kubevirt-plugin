import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import {
  K8sResourceCommon,
  TableColumn,
  useActiveColumns,
} from '@openshift-console/dynamic-plugin-sdk';
import { sortable } from '@patternfly/react-table';

const useActiveUsersColumnsVm = (): { title: string; id: string }[] => {
  const { t } = useKubevirtTranslation();

  const columns: TableColumn<K8sResourceCommon>[] = [
    {
      title: t('User Name'),
      id: 'userName',
      transforms: [sortable],
      sort: 'metadata.name',
    },
    {
      title: t('Domain'),
      id: 'domain',
      transforms: [sortable],
      sort: 'domain',
    },
    {
      title: t('Time of login'),
      id: 'loginTime',
      transforms: [sortable],
      sort: 'loginTime',
    },
    {
      title: t('Elapsed time since login'),
      id: 'elapsedTime',
    },
  ];

  const [activeColumns] = useActiveColumns<K8sResourceCommon>({
    columns,
    showNamespaceOverride: false,
    columnManagementID: '',
  });

  return activeColumns;
};

export default useActiveUsersColumnsVm;
