import React, { ReactElement, ReactNode, useMemo } from 'react';

import { useDataViewTableSort } from '@kubevirt-utils/hooks/useDataViewTableSort/useDataViewTableSort';
import { generateRows } from '@kubevirt-utils/hooks/useDataViewTableSort/utils';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { Checkbox, EmptyState, EmptyStateVariant } from '@patternfly/react-core';
import { DataViewTable, DataViewTr } from '@patternfly/react-data-view';

import MutedTextSpan from '../MutedTextSpan/MutedTextSpan';
import StateHandler from '../StateHandler/StateHandler';

import { useTableSelection } from './hooks/useTableSelection';
import { KubevirtTableProps } from './types';

import './KubevirtTable.scss';

export type { KubevirtTableProps } from './types';

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

const KubevirtTable = <TData, TCallbacks = undefined>(
  props: KubevirtTableProps<TData, TCallbacks>,
): ReactElement => {
  const {
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
    unfilteredData,
  } = props;

  const isSelectable = props.selectable === true;
  const onSelect = isSelectable ? props.onSelect : undefined;
  const selectedItems = isSelectable ? props.selectedItems : [];

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

  const {
    allSelected,
    handleRowSelect,
    handleSelectAll,
    isRowSelected,
    someSelected,
    validSelectedItems,
  } = useTableSelection({
    data: sortedData,
    getRowId: getRowId ?? ((_, index) => String(index)),
    onSelect: onSelect ?? (() => {}),
    selectedItems,
  });

  // Sync valid selection back to parent when orphaned items are detected
  React.useEffect(() => {
    if (isSelectable && validSelectedItems.length !== selectedItems.length) {
      onSelect?.(validSelectedItems);
    }
  }, [isSelectable, validSelectedItems, selectedItems.length, onSelect]);

  const rows: DataViewTr[] = useMemo(
    () =>
      generateRows(
        sortedData,
        visibleColumns,
        callbacks as TCallbacks,
        getRowId,
        isSelectable,
        isRowSelected,
        handleRowSelect,
      ),
    [sortedData, visibleColumns, callbacks, getRowId, isSelectable, isRowSelected, handleRowSelect],
  );

  const selectAllId = dataTest ? `${dataTest}-select-all` : 'select-all-rows';

  const selectionColumn = useMemo(() => {
    if (!isSelectable) return null;

    const getCheckboxState = (): boolean | null => {
      if (allSelected) return true;
      if (someSelected) return null;
      return false;
    };

    return {
      cell: (
        <Checkbox
          aria-label="Select all rows"
          data-test={selectAllId}
          id={selectAllId}
          isChecked={getCheckboxState()}
          onChange={handleSelectAll}
        />
      ),
      props: { className: 'pf-v6-c-table__check' },
    };
  }, [isSelectable, allSelected, someSelected, selectAllId, handleSelectAll]);

  const effectiveTableColumns = useMemo(() => {
    if (!isSelectable || !selectionColumn) return tableColumns;
    return [selectionColumn, ...tableColumns];
  }, [isSelectable, selectionColumn, tableColumns]);

  const isUnfilteredDataEmpty = isEmpty(unfilteredData ?? data);
  const isDataEmpty = isEmpty(data);

  const effectiveNoFilteredDataMsg = renderNoFilteredDataContent(noFilteredDataMsg);
  const effectiveColSpan = isSelectable ? visibleColumns.length + 1 : visibleColumns.length;

  const renderFilteredEmptyState = (): ReactNode => {
    if (!isDataEmpty || isUnfilteredDataEmpty || !effectiveNoFilteredDataMsg) {
      return null;
    }

    return (
      <tr>
        <td className="pf-v6-u-text-align-center" colSpan={effectiveColSpan}>
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
      columns={effectiveTableColumns}
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
