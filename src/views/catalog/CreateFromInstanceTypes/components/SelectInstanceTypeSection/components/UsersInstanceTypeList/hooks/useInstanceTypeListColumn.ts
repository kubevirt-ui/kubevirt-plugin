import { useCallback, useMemo, useState } from 'react';

import { V1alpha2VirtualMachineClusterInstancetype } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { PaginationState } from '@kubevirt-utils/hooks/usePagination/utils/types';
import { columnSorting } from '@kubevirt-utils/utils/utils';
import { TableColumn } from '@openshift-console/dynamic-plugin-sdk';
import { ThSortType } from '@patternfly/react-table/dist/esm/components/Table/base';

type UseInstanceTypeListColumnsValues = {
  columns: TableColumn<V1alpha2VirtualMachineClusterInstancetype>[];
  getSortType: (columnIndex: number) => ThSortType;
  sortedData: V1alpha2VirtualMachineClusterInstancetype[];
};

type UseInstanceTypeListColumns = (
  data: V1alpha2VirtualMachineClusterInstancetype[],
  pagination: PaginationState,
) => UseInstanceTypeListColumnsValues;

const useInstanceTypeListColumns: UseInstanceTypeListColumns = (data, pagination) => {
  const { t } = useKubevirtTranslation();

  const [activeSortIndex, setActiveSortIndex] = useState<number | null>(null);
  const [activeSortDirection, setActiveSortDirection] = useState<'asc' | 'desc' | null>(null);

  const columns: TableColumn<V1alpha2VirtualMachineClusterInstancetype>[] = useMemo(
    () => [
      {
        title: t('Name'),
        id: 'name',
        sort: 'metadata.name',
      },
      {
        title: t('Created'),
        id: 'created',
        sort: 'metadata.creationTimestamp',
      },
      {
        title: t('Description'),
        id: 'description',
        sort: 'metadata.annotations.description',
      },
    ],
    [t],
  );

  const getSortType = useCallback(
    (columnIndex: number): ThSortType => ({
      columnIndex,
      sortBy: { index: activeSortIndex, direction: activeSortDirection },
      onSort: (_event, index, direction) => {
        setActiveSortIndex(index);
        setActiveSortDirection(direction);
      },
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

  return { columns, getSortType, sortedData };
};

export default useInstanceTypeListColumns;
