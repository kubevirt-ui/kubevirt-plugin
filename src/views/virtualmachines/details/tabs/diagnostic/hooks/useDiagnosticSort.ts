import { useMemo, useState } from 'react';

import { ThSortType } from '@patternfly/react-table/dist/esm/components/Table/base/types';

type GetSorting = (column: string, columnIndex: number) => ThSortType;

type UseDiagnosticSort = () => {
  getSorting: GetSorting;
  sort: {
    column: string;
    direction: 'asc' | 'desc';
    sortIndex: number;
  };
};

const useDiagnosticSort: UseDiagnosticSort = () => {
  const [activeSortIndex, setActiveSortIndex] = useState<number>(0);
  const [activeSortDirection, setActiveSortDirection] = useState<'asc' | 'desc'>('asc');
  const [activeSortColumn, setActiveSortColumn] = useState<string>('reason');

  const getSorting: GetSorting = (column, columnIndex) => ({
    columnIndex,
    onSort: (_, index, direction) => {
      setActiveSortIndex(index);
      setActiveSortColumn(column);
      setActiveSortDirection(direction);
    },
    sortBy: {
      defaultDirection: 'asc',
      direction: activeSortDirection,
      index: activeSortIndex,
    },
  });

  const sort = useMemo(
    () => ({
      column: activeSortColumn,
      direction: activeSortDirection,
      sortIndex: activeSortIndex,
    }),
    [activeSortColumn, activeSortDirection, activeSortIndex],
  );

  return { getSorting, sort };
};

export default useDiagnosticSort;
