import { useMemo, useState } from 'react';

import { ThSortType } from '@patternfly/react-table/dist/esm/components/Table/base';

type GetSorting = (column: string, columnIndex: number) => ThSortType;

type UseDiagnosticSort = () => {
  getSorting: GetSorting;
  sort: {
    column: string;
    sortIndex: number;
    direction: 'asc' | 'desc';
  };
};

const useDiagnosticSort: UseDiagnosticSort = () => {
  const [activeSortIndex, setActiveSortIndex] = useState<number>(0);
  const [activeSortDirection, setActiveSortDirection] = useState<'asc' | 'desc'>('asc');
  const [activeSortColumn, setActiveSortColumn] = useState<string>('reason');

  const getSorting: GetSorting = (column, columnIndex) => ({
    sortBy: {
      index: activeSortIndex,
      direction: activeSortDirection,
      defaultDirection: 'asc',
    },
    onSort: (_, index, direction) => {
      setActiveSortIndex(index);
      setActiveSortColumn(column);
      setActiveSortDirection(direction);
    },
    columnIndex,
  });

  const sort = useMemo(
    () => ({
      column: activeSortColumn,
      sortIndex: activeSortIndex,
      direction: activeSortDirection,
    }),
    [activeSortColumn, activeSortDirection, activeSortIndex],
  );

  return { sort, getSorting };
};

export default useDiagnosticSort;
