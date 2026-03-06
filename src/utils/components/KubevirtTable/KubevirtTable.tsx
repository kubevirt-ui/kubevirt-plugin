import React, { ReactElement, ReactNode, useMemo } from 'react';

import { ColumnConfig } from '@kubevirt-utils/hooks/useDataViewTableSort/types';
import { useDataViewTableSort } from '@kubevirt-utils/hooks/useDataViewTableSort/useDataViewTableSort';
import { generateRows } from '@kubevirt-utils/hooks/useDataViewTableSort/utils';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { EmptyState, EmptyStateVariant } from '@patternfly/react-core';
import { DataViewTable, DataViewTr } from '@patternfly/react-data-view';

import MutedTextSpan from '../MutedTextSpan/MutedTextSpan';
import StateHandler from '../StateHandler/StateHandler';

import './KubevirtTable.scss';

export type KubevirtTableProps<TData, TCallbacks = undefined> = {
  ariaLabel: string;
  callbacks?: TCallbacks;
  columns: ColumnConfig<TData, TCallbacks>[];
  data: TData[];
  dataTest?: string;
  fixedLayout?: boolean;
  getRowId?: (row: TData, index: number) => string;
  initialSortColumnIndex?: number;
  initialSortDirection?: 'asc' | 'desc';
  initialSortKey?: string;
  loaded?: boolean;
  loadError?: unknown;
  noDataEmptyMsg?: ReactNode;
  noDataEmptyText?: string;
  noFilteredDataEmptyMsg?: ReactNode;
  noFilteredDataEmptyText?: string;
  onSelect?: (selected: TData[]) => void;
  selectedItems?: TData[];
  unfilteredData?: TData[];
};

const KubevirtTable = <TData, TCallbacks = undefined>({
  ariaLabel,
  callbacks,
  columns,
  data,
  dataTest,
  fixedLayout = false,
  getRowId,
  initialSortColumnIndex,
  initialSortDirection,
  initialSortKey,
  loaded = true,
  loadError,
  noDataEmptyMsg,
  noDataEmptyText,
  noFilteredDataEmptyMsg,
  noFilteredDataEmptyText,
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

  const effectiveNoDataEmptyMsg =
    noDataEmptyMsg ?? (noDataEmptyText && <MutedTextSpan text={noDataEmptyText} />);

  const effectiveNoFilteredDataEmptyMsg =
    noFilteredDataEmptyMsg ??
    (noFilteredDataEmptyText && <MutedTextSpan text={noFilteredDataEmptyText} />);

  const renderFilteredEmptyState = (): ReactNode => {
    if (!isDataEmpty || isUnfilteredDataEmpty || !effectiveNoFilteredDataEmptyMsg) {
      return null;
    }

    return (
      <tr>
        <td className="pf-v6-u-text-align-center" colSpan={visibleColumns.length}>
          {effectiveNoFilteredDataEmptyMsg}
        </td>
      </tr>
    );
  };

  const filteredEmptyState = renderFilteredEmptyState();

  const table = (
    <DataViewTable
      aria-label={ariaLabel}
      bodyStates={filteredEmptyState ? { empty: filteredEmptyState } : undefined}
      columns={tableColumns}
      rows={filteredEmptyState ? [] : rows}
    />
  );

  const renderContent = (): ReactNode => {
    if (isUnfilteredDataEmpty && effectiveNoDataEmptyMsg) {
      return (
        <EmptyState headingLevel="h4" variant={EmptyStateVariant.xs}>
          {effectiveNoDataEmptyMsg}
        </EmptyState>
      );
    }

    return fixedLayout ? <div className="kubevirt-table--fixed-layout">{table}</div> : table;
  };

  return (
    <div data-test={dataTest}>
      <StateHandler error={loadError} hasData={!isUnfilteredDataEmpty} loaded={loaded}>
        {renderContent()}
      </StateHandler>
    </div>
  );
};

export default KubevirtTable;
