import * as React from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import {
  K8sResourceCommon,
  TableColumn,
  useActiveColumns,
} from '@openshift-console/dynamic-plugin-sdk';

const useVirtualMachinesInstancesColumns = (): { title: string; id: string }[] => {
  const { t } = useKubevirtTranslation();

  const columns: TableColumn<K8sResourceCommon>[] = React.useMemo(
    () => [
      {
        title: t('Name'),
        id: 'name',
      },
      {
        title: t('Namespace'),
        id: 'namespace',
      },
      {
        title: t('Status'),
        id: 'status',
      },
      {
        title: t('Conditions'),
        id: 'conditions',
      },
      {
        title: t('Created'),
        id: 'created',
      },
    ],
    [t],
  );

  const [activeColumns] = useActiveColumns<K8sResourceCommon>({
    columns,
    showNamespaceOverride: false,
    columnManagementID: '',
  });

  return activeColumns;
};

export default useVirtualMachinesInstancesColumns;
