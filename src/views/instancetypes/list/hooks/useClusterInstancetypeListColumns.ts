import { useCallback, useMemo } from 'react';

import { VirtualMachineClusterInstancetypeModelRef } from '@kubevirt-ui/kubevirt-api/console';
import { V1alpha2VirtualMachineClusterInstancetype } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import useKubevirtUserSettingsTableColumns from '@kubevirt-utils/hooks/useKubevirtUserSettings/useKubevirtUserSettingsTableColumns';
import { PaginationState } from '@kubevirt-utils/hooks/usePagination/utils/types';
import { columnSorting } from '@kubevirt-utils/utils/utils';
import { TableColumn } from '@openshift-console/dynamic-plugin-sdk';
import { sortable } from '@patternfly/react-table';

type UseClusterInstancetypeListColumnsValues = [
  TableColumn<V1alpha2VirtualMachineClusterInstancetype>[],
  TableColumn<V1alpha2VirtualMachineClusterInstancetype>[],
];

type UseClusterInstancetypeListColumns = (
  pagination: PaginationState,
  data: V1alpha2VirtualMachineClusterInstancetype[],
) => UseClusterInstancetypeListColumnsValues;

const useClusterInstancetypeListColumns: UseClusterInstancetypeListColumns = (pagination, data) => {
  const { t } = useKubevirtTranslation();

  const sorting = useCallback(
    (direction, path) => columnSorting(data, direction, pagination, path),
    [data, pagination],
  );

  const columns: TableColumn<V1alpha2VirtualMachineClusterInstancetype>[] = useMemo(
    () => [
      {
        title: t('Name'),
        id: 'name',
        transforms: [sortable],
        sort: (_, direction) => sorting(direction, 'metadata.name'),
      },
      {
        title: t('CPU'),
        id: 'cpu',
        transforms: [sortable],
        sort: (_, direction) => sorting(direction, 'spec.cpu.guest'),
      },
      {
        title: t('Memory'),
        id: 'memory',
        transforms: [sortable],
        sort: (_, direction) => sorting(direction, 'spec.memory.guest'),
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
    [t, sorting],
  );

  const [activeColumns] =
    useKubevirtUserSettingsTableColumns<V1alpha2VirtualMachineClusterInstancetype>({
      columns,
      columnManagementID: VirtualMachineClusterInstancetypeModelRef,
    });

  return [columns, activeColumns];
};

export default useClusterInstancetypeListColumns;
