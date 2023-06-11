import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { TableColumn } from '@openshift-console/dynamic-plugin-sdk';

import { InterfacesData } from '../utils/types';

const useVirtualMachinesOverviewTabInterfacesColumns = () => {
  const { t } = useKubevirtTranslation();

  const columns: TableColumn<InterfacesData>[] = [
    {
      id: 'name',
      title: t('Name'),
    },
    {
      id: 'ip',
      title: t('IP address'),
    },
  ];

  return columns;
};

export default useVirtualMachinesOverviewTabInterfacesColumns;
