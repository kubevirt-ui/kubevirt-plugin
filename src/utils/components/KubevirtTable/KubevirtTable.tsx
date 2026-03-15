import React, { ReactElement, ReactNode, useMemo } from 'react';

import { ColumnConfig } from '@kubevirt-utils/hooks/useDataViewTableSort/types';
import { useDataViewTableSort } from '@kubevirt-utils/hooks/useDataViewTableSort/useDataViewTableSort';
import { generateRows } from '@kubevirt-utils/hooks/useDataViewTableSort/utils';
import { PaginationState } from '@kubevirt-utils/hooks/usePagination/utils/types';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { EmptyState, EmptyStateVariant } from '@patternfly/react-core';
import { DataViewTable, DataViewTr } from '@patternfly/react-data-view';

import MutedTextSpan from '../MutedTextSpan/MutedTextSpan';
import StateHandler from '../StateHandler/StateHandler';

import './KubevirtTable.scss';

export type KubevirtTableProps<TData, TCallbacks = undefined> = {
  /** Column keys that should be visible (from user settings). If not provided, shows all non-additional columns */
  activeColumnKeys?: string[];
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
  noDataMsg?: ReactNode;
  noFilteredDataMsg?: ReactNode;
  onSelect?: (selected: TData[]) => void;
  /** Pagination state from usePagination hook. When provided, table will slice sorted data accordingly */
  pagination?: PaginationState;
  selectedItems?: TData[];
  unfilteredData?: TData[];
};

const renderNoDataContent = (content: ReactNode): ReactNode => {
  if (typeof content === 'string') {
    return <EmptyState headingLevel="h4" titleText={content} variant={EmptyStateVariant.xs} />;
  }
  return content;
};

const renderNoFilteredDataContent = (content: ReactNode): ReactNode => {
  if (typeof content === 'string') {
    return <MutedTextSpan text={content} />;
  }
  return content;
};

const KubevirtTable = <TData, TCallbacks = undefined>({
  activeColumnKeys,
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
  noDataMsg,
  noFilteredDataMsg,
  pagination,
  unfilteredData,
}: KubevirtTableProps<TData, TCallbacks>): ReactElement => {
  const activeColumns = useMemo(() => {
    if (!activeColumnKeys) {
      return columns.filter((col) => !col.additional);
    }
    return columns.filter((col) => activeColumnKeys.includes(col.key) || col.key === 'actions');
  }, [columns, activeColumnKeys]);

  const effectiveInitialSortKey = useMemo(() => {
    if (initialSortKey) return initialSortKey;
    if (initialSortColumnIndex !== undefined && activeColumns[initialSortColumnIndex]) {
      return activeColumns[initialSortColumnIndex].key;
    }
    return activeColumns[0]?.key;
  }, [initialSortKey, initialSortColumnIndex, activeColumns]);

  const { sortedData, tableColumns, visibleColumns } = useDataViewTableSort(
    data,
    activeColumns,
    effectiveInitialSortKey,
    initialSortDirection,
  );

  const paginatedData = useMemo(() => {
    if (!pagination) {
      return sortedData;
    }
    const { endIndex, startIndex } = pagination;
    return sortedData.slice(startIndex, endIndex);
  }, [sortedData, pagination]);

  const rows: DataViewTr[] = useMemo(
    () => generateRows(paginatedData, visibleColumns, callbacks as TCallbacks, getRowId),
    [paginatedData, visibleColumns, callbacks, getRowId],
  );

  const isUnfilteredDataEmpty = isEmpty(unfilteredData ?? data);
  const isDataEmpty = isEmpty(data);

  const effectiveNoFilteredDataMsg = renderNoFilteredDataContent(noFilteredDataMsg);

  const renderFilteredEmptyState = (): ReactNode => {
    if (!isDataEmpty || isUnfilteredDataEmpty || !effectiveNoFilteredDataMsg) {
      return null;
    }

    return (
      <tr>
        <td className="pf-v6-u-text-align-center" colSpan={visibleColumns.length}>
          {effectiveNoFilteredDataMsg}
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
    if (isUnfilteredDataEmpty && noDataMsg) {
      return renderNoDataContent(noDataMsg);
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
