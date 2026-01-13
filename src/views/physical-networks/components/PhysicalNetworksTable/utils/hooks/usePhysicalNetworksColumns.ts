import { useCallback, useMemo, useState } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { PaginationState } from '@kubevirt-utils/hooks/usePagination/utils/types';
import { columnSorting } from '@kubevirt-utils/utils/utils';
import { TableColumn, useActiveColumns } from '@openshift-console/dynamic-plugin-sdk';
import { sortable } from '@patternfly/react-table';
import { ThSortType } from '@patternfly/react-table/dist/esm/components/Table/base/types';

import { PhysicalNetwork, PhysicalNetworks } from '../../../../utils/types';
import { PhysicalNetworkColumnIDs } from '../constants';

export type UsePhysicalNetworkColumns = (
  data: PhysicalNetworks,
  pagination: PaginationState,
) => {
  activeColumns: TableColumn<PhysicalNetwork>[];
  columns: TableColumn<PhysicalNetwork>[];
  getSortType: (columnIndex: number) => ThSortType;
  sortedData: PhysicalNetworks;
};

const usePhysicalNetworkColumns: UsePhysicalNetworkColumns = (data, pagination) => {
  const { t } = useKubevirtTranslation();
  const [activeSortIndex, setActiveSortIndex] = useState<null | number>(null);
  const [activeSortDirection, setActiveSortDirection] = useState<'asc' | 'desc' | null>(null);

  const columns: TableColumn<PhysicalNetwork>[] = useMemo(
    () => [
      {
        id: PhysicalNetworkColumnIDs.Expand,
        title: '',
      },
      {
        id: PhysicalNetworkColumnIDs.Name,
        props: { className: 'pf-m-width-30' },
        sort: 'name',
        title: t('Network name'),
        transforms: [sortable],
      },
      {
        id: PhysicalNetworkColumnIDs.NodeCount,
        props: { className: 'pf-m-width-30' },
        sort: 'nodeCount',
        title: t('Nodes'),
      },
    ],
    [t],
  );

  const getSortType = useCallback(
    (columnIndex: number): ThSortType => ({
      columnIndex,
      onSort: (_event, index, direction) => {
        setActiveSortIndex(index);
        setActiveSortDirection(direction);
      },
      sortBy: { direction: activeSortDirection, index: activeSortIndex },
    }),
    [activeSortDirection, activeSortIndex],
  );

  const sortedData = useMemo(
    () =>
      columnSorting(
        data,
        activeSortDirection,
        pagination,
        columns[activeSortIndex]?.sort as string,
      ),
    [activeSortDirection, activeSortIndex, columns, data, pagination],
  );

  const [activeColumns] = useActiveColumns<PhysicalNetwork>({
    columnManagementID: 'PhysicalNetworksColumns',
    columns: columns,
    showNamespaceOverride: false,
  });

  return { activeColumns, columns, getSortType, sortedData };
};

export default usePhysicalNetworkColumns;
