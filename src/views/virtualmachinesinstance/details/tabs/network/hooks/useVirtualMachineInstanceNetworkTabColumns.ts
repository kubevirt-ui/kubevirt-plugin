import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { sortable } from '@patternfly/react-table';

export const useVirtualMachineInstanceNetworkTabColumns = () => {
  const { t } = useKubevirtTranslation();

  const columns = [
    {
      title: t('Name'),
      id: 'name',
      transforms: [sortable],
      sort: 'name',
    },
    {
      title: t('Model'),
      id: 'model',
      transforms: [sortable],
      sort: 'model',
    },
    {
      title: t('Network'),
      id: 'network',
      transforms: [sortable],
      sort: 'network',
    },
    {
      title: t('Type'),
      id: 'type',
      transforms: [sortable],
      sort: 'type',
    },
    {
      title: t('MAC Address'),
      id: 'macAddress',
      transforms: [sortable],
      sort: 'macAddress',
    },
  ];

  return columns;
};

export default useVirtualMachineInstanceNetworkTabColumns;
