import { useCallback, useMemo } from 'react';

import { VirtualMachineClusterInstancetypeModelRef } from '@kubevirt-ui-ext/kubevirt-api/console';
import { V1beta1VirtualMachineClusterInstancetype } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import useKubevirtUserSettingsTableColumns from '@kubevirt-utils/hooks/useKubevirtUserSettings/useKubevirtUserSettingsTableColumns';
import { PaginationState } from '@kubevirt-utils/hooks/usePagination/utils/types';
import { columnSorting } from '@kubevirt-utils/utils/utils';
import useClusterParam from '@multicluster/hooks/useClusterParam';
import useIsACMPage from '@multicluster/useIsACMPage';
import { TableColumn } from '@openshift-console/dynamic-plugin-sdk';
import { sortable } from '@patternfly/react-table';

import { sortInstanceTypeByMemory } from './utils';

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
  const isACMPage = useIsACMPage();
  const cluster = useClusterParam();

  const sorting = useCallback(
    (direction, path) => columnSorting(data, direction, pagination, path),
    [data, pagination],
  );

  const sortingMemory = useCallback(
    (direction) => sortInstanceTypeByMemory(data, direction, pagination),
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
      ...(isACMPage && !cluster
        ? [
            {
              id: 'cluster',
              sort: (_, direction) => sorting(direction, 'cluster'),
              title: t('Cluster'),
              transforms: [sortable],
            },
          ]
        : []),
      {
        id: 'cpu',
        sort: (_, direction) => sorting(direction, 'spec.cpu.guest'),
        title: t('CPU'),
        transforms: [sortable],
      },
      {
        id: 'memory',
        sort: (_, direction) => sortingMemory(direction),
        title: t('Memory'),
        transforms: [sortable],
      },
      {
        id: 'vendor',
        title: t('Vendor'),
      },
      {
        id: '',
        props: { className: 'pf-v6-c-table__action' },
        title: '',
      },
    ],
    [t, isACMPage, sorting, sortingMemory],
  );

  const [activeColumns, , loadedColumns] =
    useKubevirtUserSettingsTableColumns<V1beta1VirtualMachineClusterInstancetype>({
      columnManagementID: VirtualMachineClusterInstancetypeModelRef,
      columns,
    });

  return [columns, activeColumns, loadedColumns];
};

export default useClusterInstancetypeListColumns;
