import React, { ReactElement, ReactNode, useMemo } from 'react';

import { ColumnConfig } from '@kubevirt-utils/hooks/useDataViewTableSort/types';
import { useDataViewTableSort } from '@kubevirt-utils/hooks/useDataViewTableSort/useDataViewTableSort';
import { generateRows } from '@kubevirt-utils/hooks/useDataViewTableSort/utils';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { Bullseye } from '@patternfly/react-core';
import { DataViewTable, DataViewTr } from '@patternfly/react-data-view';

import ListSkeleton from '../StateHandler/ListSkeleton';
import StateHandler from '../StateHandler/StateHandler';

import './KubevirtTable.scss';

export type KubevirtTableProps<TData, TCallbacks = undefined> = {
  ariaLabel: string;
  callbacks?: TCallbacks;
  columns: ColumnConfig<TData, TCallbacks>[];
  data: TData[];
  fixedLayout?: boolean;
  getRowId?: (row: TData, index: number) => string;
  initialSortColumnIndex?: number;
  initialSortDirection?: 'asc' | 'desc';
  initialSortKey?: string;
  loaded?: boolean;
  loadError?: unknown;
  noDataEmptyMsg?: ReactNode;
  noFilteredDataEmptyMsg?: ReactNode;
  onSelect?: (selected: TData[]) => void;
  selectedItems?: TData[];
  unfilteredData?: TData[];
};

const KubevirtTable = <TData, TCallbacks = undefined>({
  ariaLabel,
  callbacks,
  columns,
  data,
  fixedLayout = false,
  getRowId,
  initialSortColumnIndex,
  initialSortDirection,
  initialSortKey,
  loaded = true,
  loadError,
  noDataEmptyMsg,
  noFilteredDataEmptyMsg,
  unfilteredData,
}: KubevirtTableProps<TData, TCallbacks>): ReactElement => {
  const effectiveInitialSortKey = useMemo(() => {
    if (initialSortKey) return initialSortKey;
    if (initialSortColumnIndex !== undefined && columns[initialSortColumnIndex]) {
      return columns[initialSortColumnIndex].key;
    }
    return columns[0]?.key;
  }, [initialSortKey, initialSortColumnIndex, columns]);

  const { sortedData, tableColumns, visibleColumns } = useDataViewTableSort(
    data,
    columns,
    effectiveInitialSortKey,
    initialSortDirection,
  );

  const rows: DataViewTr[] = useMemo(
    () => generateRows(sortedData, visibleColumns, callbacks as TCallbacks, getRowId),
    [sortedData, visibleColumns, callbacks, getRowId],
  );

  const isUnfilteredDataEmpty = isEmpty(unfilteredData ?? data);
  const isDataEmpty = isEmpty(data);

  const renderEmptyState = (): ReactNode => {
    if (!loaded) {
      return (
        <tr>
          <td colSpan={visibleColumns.length}>
            <Bullseye>
              <ListSkeleton />
            </Bullseye>
          </td>
        </tr>
      );
    }

    if (loadError) {
      return null;
    }

    if (!isDataEmpty) {
      return null;
    }

    if (isUnfilteredDataEmpty && noDataEmptyMsg) {
      return (
        <tr>
          <td className="pf-v6-u-text-align-center" colSpan={visibleColumns.length}>
            {noDataEmptyMsg}
          </td>
        </tr>
      );
    }

    if (isDataEmpty && noFilteredDataEmptyMsg) {
      return (
        <tr>
          <td className="pf-v6-u-text-align-center" colSpan={visibleColumns.length}>
            {noFilteredDataEmptyMsg}
          </td>
        </tr>
      );
    }

    return null;
  };

  const emptyState = renderEmptyState();

  const table = (
    <DataViewTable
      aria-label={ariaLabel}
      bodyStates={emptyState ? { empty: emptyState } : undefined}
      columns={tableColumns}
      rows={isDataEmpty && emptyState ? [] : rows}
    />
  );

  return (
    <StateHandler error={loadError} hasData={!isUnfilteredDataEmpty} loaded={loaded}>
      {fixedLayout ? <div className="kubevirt-table--fixed-layout">{table}</div> : table}
    </StateHandler>
  );
};

export default KubevirtTable;
