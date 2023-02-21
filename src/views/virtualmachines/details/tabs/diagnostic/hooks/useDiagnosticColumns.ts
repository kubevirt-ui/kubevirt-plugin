import { useMemo, useState } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { TableColumn, useActiveColumns } from '@openshift-console/dynamic-plugin-sdk';
import { ThSortType } from '@patternfly/react-table/dist/esm/components/Table/base';

import { DiagnosticSort } from '../utils/types';

type DiagnosticColumn = {
  title: string;
  id: string;
  sort: (columnIndex: any) => ThSortType;
};

type UseDiagnosticColumns = () => [
  columns: TableColumn<DiagnosticColumn>[],
  activeColumns: TableColumn<DiagnosticColumn>[],
  sort: DiagnosticSort,
];
const useDiagnosticColumns: UseDiagnosticColumns = () => {
  const { t } = useKubevirtTranslation();

  const [activeSortIndex, setActiveSortIndex] = useState<number>(0);
  const [activeSortDirection, setActiveSortDirection] = useState<'asc' | 'desc'>('asc');
  const [activeSortColumn, setActiveSortColumn] = useState<string>('reason');

  const getSorting = (column: string, columnIndex: number): ThSortType => ({
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

  const columns: TableColumn<DiagnosticColumn>[] = [
    {
      title: t('Reason'),
      id: 'reason',
      cell: { sort: (columnIndex) => getSorting('reason', columnIndex) },
    },
    {
      title: t('Message'),
      id: 'message',

      cell: { sort: (columnIndex) => getSorting('message', columnIndex) },
    },
    {
      title: t('Status'),
      id: 'status',
      cell: { sort: (columnIndex) => getSorting('status', columnIndex) },
    },
    {
      title: t('Type'),
      id: 'type',
      cell: { sort: (columnIndex) => getSorting('type', columnIndex) },
    },
    {
      title: t('Last transition time'),
      id: 'lastTransitionTime',
      cell: { sort: (columnIndex) => getSorting('lastTransitionTime', columnIndex) },
    },
  ];

  const [activeColumns] = useActiveColumns({
    columns,
    showNamespaceOverride: false,
    columnManagementID: 'diagnostic-tab',
  });

  const sort = useMemo(
    () => ({
      column: activeSortColumn,
      sortIndex: activeSortIndex,
      direction: activeSortDirection,
    }),
    [activeSortColumn, activeSortDirection, activeSortIndex],
  );

  return [columns, activeColumns, sort];
};

export default useDiagnosticColumns;
