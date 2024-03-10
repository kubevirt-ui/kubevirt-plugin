import { useCallback, useMemo } from 'react';

import { VirtualMachineClusterInstancetypeModelRef } from '@kubevirt-ui/kubevirt-api/console';
import { V1beta1VirtualMachineClusterInstancetype } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import useKubevirtUserSettingsTableColumns from '@kubevirt-utils/hooks/useKubevirtUserSettings/useKubevirtUserSettingsTableColumns';
import { PaginationState } from '@kubevirt-utils/hooks/usePagination/utils/types';
import { columnSorting } from '@kubevirt-utils/utils/utils';
import { TableColumn } from '@openshift-console/dynamic-plugin-sdk';
import { sortable } from '@patternfly/react-table';

type UseClusterInstancetypeListColumnsValues = [
  TableColumn<V1beta1VirtualMachineClusterInstancetype>[],
  TableColumn<V1beta1VirtualMachineClusterInstancetype>[],
  boolean,
];

type UseClusterInstancetypeListColumns = (
  pagination: PaginationState,
  data: V1beta1VirtualMachineClusterInstancetype[],
) => UseClusterInstancetypeListColumnsValues;

const useClusterInstancetypeListColumns: UseClusterInstancetypeListColumns = (pagination, data) => {
  const { t } = useKubevirtTranslation();

  const sorting = useCallback(
    (direction, path) => columnSorting(data, direction, pagination, path),
    [data, pagination],
  );

  const columns: TableColumn<V1beta1VirtualMachineClusterInstancetype>[] = useMemo(
    () => [
      {
        id: 'name',
        sort: (_, direction) => sorting(direction, 'metadata.name'),
        title: t('Name'),
        transforms: [sortable],
      },
      {
        id: 'cpu',
        sort: (_, direction) => sorting(direction, 'spec.cpu.guest'),
        title: t('CPU'),
        transforms: [sortable],
      },
      {
        id: 'memory',
        sort: (_, direction) => sorting(direction, 'spec.memory.guest'),
        title: t('Memory'),
        transforms: [sortable],
      },
      {
        id: 'vendor',
        title: t('Vendor'),
      },
      {
        id: '',
        props: { className: 'dropdown-kebab-pf pf-v5-c-table__action' },
        title: '',
      },
    ],
    [t, sorting],
  );

  const [activeColumns, , loadedColumns] =
    useKubevirtUserSettingsTableColumns<V1beta1VirtualMachineClusterInstancetype>({
      columnManagementID: VirtualMachineClusterInstancetypeModelRef,
      columns,
    });

  return [columns, activeColumns, loadedColumns];
};

export default useClusterInstancetypeListColumns;
