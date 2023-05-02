import { useMemo } from 'react';

import { VirtualMachineClusterInstancetypeModelRef } from '@kubevirt-ui/kubevirt-api/console';
import { V1alpha2VirtualMachineClusterInstancetype } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import useKubevirtUserSettingsTableColumns from '@kubevirt-utils/hooks/useKubevirtUserSettings/useKubevirtUserSettingsTableColumns';
import { TableColumn } from '@openshift-console/dynamic-plugin-sdk';
import { sortable } from '@patternfly/react-table';

const useClusterInstancetypeListColumns = (): [
  TableColumn<V1alpha2VirtualMachineClusterInstancetype>[],
  TableColumn<V1alpha2VirtualMachineClusterInstancetype>[],
] => {
  const { t } = useKubevirtTranslation();

  const columns: TableColumn<V1alpha2VirtualMachineClusterInstancetype>[] = useMemo(
    () => [
      {
        title: t('Name'),
        id: 'name',
        transforms: [sortable],
        sort: 'metadata.name',
      },
      {
        title: t('CPU'),
        id: 'cpu',
        transforms: [sortable],
        sort: 'spec.cpu.guest',
      },
      {
        title: t('Memory'),
        id: 'memory',
        transforms: [sortable],
        sort: 'spec.memory.guest',
      },
      {
        title: t('Vendor'),
        id: 'vendor',
      },
      {
        title: '',
        id: '',
        props: { className: 'dropdown-kebab-pf pf-c-table__action' },
      },
    ],
    [t],
  );

  const [activeColumns] =
    useKubevirtUserSettingsTableColumns<V1alpha2VirtualMachineClusterInstancetype>({
      columns,
      columnManagementID: VirtualMachineClusterInstancetypeModelRef,
    });

  return [columns, activeColumns];
};

export default useClusterInstancetypeListColumns;
