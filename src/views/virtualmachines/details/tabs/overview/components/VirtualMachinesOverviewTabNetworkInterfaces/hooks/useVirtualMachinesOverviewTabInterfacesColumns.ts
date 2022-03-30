import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { TableColumn } from '@openshift-console/dynamic-plugin-sdk';

import { InterfacesData } from '../utils/types';

const useVirtualMachinesOverviewTabInterfacesColumns = () => {
  const { t } = useKubevirtTranslation();

  const columns: TableColumn<InterfacesData>[] = [
    {
      title: t('Name'),
      id: 'name',
    },
    {
      title: t('IP address'),
      id: 'ip',
    },
  ];

  return columns;
};

export default useVirtualMachinesOverviewTabInterfacesColumns;
