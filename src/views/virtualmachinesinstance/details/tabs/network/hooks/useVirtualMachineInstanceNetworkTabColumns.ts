import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { sortable } from '@patternfly/react-table';

export const useVirtualMachineInstanceNetworkTabColumns = () => {
  const { t } = useKubevirtTranslation();

  const columns = [
    {
      id: 'name',
      sort: 'name',
      title: t('Name'),
      transforms: [sortable],
    },
    {
      id: 'model',
      sort: 'model',
      title: t('Model'),
      transforms: [sortable],
    },
    {
      id: 'network',
      sort: 'network',
      title: t('Network'),
      transforms: [sortable],
    },
    {
      id: 'type',
      sort: 'type',
      title: t('Type'),
      transforms: [sortable],
    },
    {
      id: 'macAddress',
      sort: 'macAddress',
      title: t('MAC Address'),
      transforms: [sortable],
    },
  ];

  return columns;
};

export default useVirtualMachineInstanceNetworkTabColumns;
