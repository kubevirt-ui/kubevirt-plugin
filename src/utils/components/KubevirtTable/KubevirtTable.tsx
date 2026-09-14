import React, { type ReactElement, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router';

import { useDataViewTableSort } from '@kubevirt-utils/hooks/useDataViewTableSort/useDataViewTableSort';
import { generateRows } from '@kubevirt-utils/hooks/useDataViewTableSort/utils';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { type DataViewTr } from '@patternfly/react-data-view';

import StateHandler from '../StateHandler/StateHandler';
import KubevirtTableBody from './components/KubevirtTableBody';
import { useSelectionColumn } from './hooks/useSelectionColumn';
import { useTableSelection } from './hooks/useTableSelection';
import { type KubevirtTableProps } from './types';
import { getActiveColumns } from './utils/getActiveColumns';

import './KubevirtTable.scss';

export type { KubevirtTableProps } from './types';

const defaultGetRowId = (_row: unknown, index: number): string => String(index);
const defaultOnSelect = (_items: unknown[]): void => {};

const KubevirtTable = <TData, TCallbacks = undefined>(
  props: KubevirtTableProps<TData, TCallbacks>,
): ReactElement => {
  const {
    activeColumnKeys,
    ariaLabel,
    callbacks,
    className,
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
    persistSortInUrl,
    unfilteredData,
  } = props;

  const [searchParams, setSearchParams] = useSearchParams();

  const isSelectable = props.selectable === true;
  const onSelect = isSelectable ? props.onSelect : undefined;
  const selectedItems = isSelectable ? props.selectedItems : [];
  const showSelectAllCheckbox = isSelectable ? (props.showSelectAllCheckbox ?? true) : false;

  const activeColumns = useMemo(
    () => getActiveColumns(columns, activeColumnKeys),
    [columns, activeColumnKeys],
  );

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
    callbacks,
    persistSortInUrl ? searchParams : undefined,
    persistSortInUrl ? setSearchParams : undefined,
  );

  const paginatedData = useMemo(() => {
    if (!pagination) {
      return sortedData;
    }
    const { endIndex, startIndex } = pagination;
    return sortedData.slice(startIndex, endIndex);
  }, [sortedData, pagination]);

  const {
    allSelected,
    handleRowSelect,
    handleSelectAll,
    isRowSelected,
    someSelected,
    validSelectedItems,
  } = useTableSelection<TData>({
    data: sortedData,
    getRowId: getRowId ?? defaultGetRowId,
    onSelect: (onSelect ?? defaultOnSelect) as (selected: TData[]) => void,
    paginatedData,
    selectedItems,
  });

  // Sync valid selection back to parent when orphaned items are detected
  useEffect(() => {
    if (!onSelect || validSelectedItems.length === selectedItems.length) return;
    onSelect(validSelectedItems);
  }, [onSelect, validSelectedItems, selectedItems.length]);

  const rows: DataViewTr[] = useMemo(
    () =>
      generateRows({
        callbacks: callbacks as TCallbacks,
        columns: visibleColumns,
        data: paginatedData,
        getRowId,
        isRowSelected,
        onRowSelect: handleRowSelect,
        selectable: isSelectable,
      }),
    [
      paginatedData,
      visibleColumns,
      callbacks,
      getRowId,
      isSelectable,
      isRowSelected,
      handleRowSelect,
    ],
  );

  const selectionColumn = useSelectionColumn({
    allSelected,
    dataTest,
    handleSelectAll,
    showSelectAllCheckbox: isSelectable && showSelectAllCheckbox,
    someSelected,
  });

  const effectiveTableColumns = useMemo(() => {
    if (!isSelectable) return tableColumns;
    return [selectionColumn, ...tableColumns];
  }, [isSelectable, selectionColumn, tableColumns]);

  const isUnfilteredDataEmpty = isEmpty(unfilteredData ?? data);
  const showLoading = !loaded;
  const hasDataForStateHandler = showLoading ? false : !isUnfilteredDataEmpty;

  return (
    <div className={className} data-test={dataTest}>
      <StateHandler
        error={loadError}
        hasData={hasDataForStateHandler}
        loaded={loaded}
        showSkeletonLoading
      >
        <KubevirtTableBody
          ariaLabel={ariaLabel}
          data={paginatedData}
          effectiveTableColumns={effectiveTableColumns}
          fixedLayout={fixedLayout}
          loaded={loaded}
          noDataMsg={noDataMsg}
          noFilteredDataMsg={noFilteredDataMsg}
          rows={rows}
          unfilteredData={unfilteredData ?? data}
        />
      </StateHandler>
    </div>
  );
};

export default KubevirtTable;
