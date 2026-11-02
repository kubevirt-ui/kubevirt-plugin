import { useCallback, useMemo, useState } from 'react';

import { type V1beta1VirtualMachineClusterInstancetype } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { type PaginationState } from '@kubevirt-utils/hooks/usePagination/utils/types';
import { columnSortingCompare, comparePathsValues } from '@kubevirt-utils/utils/sortingUtils';
import { type TableColumn } from '@openshift-console/dynamic-plugin-sdk';
import { type ThSortType } from '@patternfly/react-table/dist/esm/components/Table/base/types';

import { compareInstanceTypeDescription } from '../utils/utils';

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
        title: t('Description'),
      },
    ],
    [t],
  );

  const getSortType = useCallback(
    (columnIndex: number): ThSortType => ({
      columnIndex,
      onSort: (_event, index, direction): void => {
        setActiveSortIndex(index);
        setActiveSortDirection(direction);
      },
      sortBy: { direction: activeSortDirection, index: activeSortIndex },
    }),
    [activeSortDirection, activeSortIndex],
  );

  const sortedData = useMemo(() => {
    const activeColumn = activeSortIndex != null ? columns[activeSortIndex] : undefined;
    const compareFunction =
      activeColumn?.id === 'description'
        ? compareInstanceTypeDescription
        : comparePathsValues(activeColumn?.sort as string);

    return columnSortingCompare(data, activeSortDirection, pagination, compareFunction);
  }, [activeSortDirection, activeSortIndex, columns, data, pagination]);

  return { columns, getSortType, sortedData };
};

export default useInstanceTypeListColumns;
