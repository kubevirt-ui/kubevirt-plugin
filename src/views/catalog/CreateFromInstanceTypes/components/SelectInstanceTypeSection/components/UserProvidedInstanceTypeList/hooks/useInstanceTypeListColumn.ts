import { useCallback, useMemo, useState } from 'react';

import { V1beta1VirtualMachineClusterInstancetype } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { PaginationState } from '@kubevirt-utils/hooks/usePagination/utils/types';
import { columnSorting } from '@kubevirt-utils/utils/utils';
import { TableColumn } from '@openshift-console/dynamic-plugin-sdk';
import { ThSortType } from '@patternfly/react-table/dist/esm/components/Table/base/types';

type UseInstanceTypeListColumnsValues = {
  columns: TableColumn<V1beta1VirtualMachineClusterInstancetype>[];
  getSortType: (columnIndex: number) => ThSortType;
  sortedData: V1beta1VirtualMachineClusterInstancetype[];
};

type UseInstanceTypeListColumns = (
  data: V1beta1VirtualMachineClusterInstancetype[],
  pagination: PaginationState,
) => UseInstanceTypeListColumnsValues;

const useInstanceTypeListColumns: UseInstanceTypeListColumns = (data, pagination) => {
  const { t } = useKubevirtTranslation();

  const [activeSortIndex, setActiveSortIndex] = useState<null | number>(null);
  const [activeSortDirection, setActiveSortDirection] = useState<'asc' | 'desc' | null>(null);

  const columns: TableColumn<V1beta1VirtualMachineClusterInstancetype>[] = useMemo(
    () => [
      {
        id: 'name',
        sort: 'metadata.name',
        title: t('Name'),
      },
      {
        id: 'created',
        sort: 'metadata.creationTimestamp',
        title: t('Created'),
      },
      {
        id: 'description',
        sort: 'metadata.annotations.description',
        title: t('Description'),
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

  return { columns, getSortType, sortedData };
};

export default useInstanceTypeListColumns;
