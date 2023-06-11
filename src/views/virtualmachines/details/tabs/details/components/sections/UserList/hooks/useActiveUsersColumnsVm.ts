import { V1VirtualMachineInstanceGuestOSUser } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { TableColumn } from '@openshift-console/dynamic-plugin-sdk';
import { sortable } from '@patternfly/react-table';

const useActiveUsersColumnsVm = (): { id: string; title: string }[] => {
  const { t } = useKubevirtTranslation();

  const columns: TableColumn<V1VirtualMachineInstanceGuestOSUser>[] = [
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

  return columns;
};

export default useActiveUsersColumnsVm;
