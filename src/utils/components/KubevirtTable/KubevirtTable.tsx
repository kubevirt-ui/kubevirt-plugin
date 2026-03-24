import React, { ReactElement, ReactNode, useMemo } from 'react';

import { PF_TABLE_CHECK_CLASS } from '@kubevirt-utils/hooks/useDataViewTableSort/constants';
import { useDataViewTableSort } from '@kubevirt-utils/hooks/useDataViewTableSort/useDataViewTableSort';
import { generateRows } from '@kubevirt-utils/hooks/useDataViewTableSort/utils';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { ACTIONS } from '@kubevirt-utils/hooks/useKubevirtUserSettings/utils/const';
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
  const { t } = useKubevirtTranslation();
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
    unfilteredData,
  } = props;

  const isSelectable = props.selectable === true;
  const onSelect = isSelectable ? props.onSelect : undefined;
  const selectedItems = isSelectable ? props.selectedItems : [];
  const showSelectAllCheckbox = isSelectable ? props.showSelectAllCheckbox ?? true : false;

  const activeColumns = useMemo(() => {
    if (!activeColumnKeys) {
      return columns.filter((col) => !col.additional);
    }
    const filtered = columns.filter(
      (col) => activeColumnKeys.includes(col.key) || col.key === ACTIONS,
    );
    // Fall back to default columns if persisted keys no longer match any column
    return filtered.length > 0 ? filtered : columns.filter((col) => !col.additional);
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
    callbacks,
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
  } = useTableSelection({
    data: sortedData,
    getRowId: getRowId ?? ((_, index) => String(index)),
    onSelect: onSelect ?? (() => {}),
    paginatedData,
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

  const selectAllId = dataTest ? `${dataTest}-select-all` : 'select-all-rows';

  const selectionColumn = useMemo(() => {
    if (!isSelectable) return null;

    if (!showSelectAllCheckbox) {
      return {
        cell: <span className="pf-v6-u-screen-reader">{t('Selection')}</span>,
        props: { className: PF_TABLE_CHECK_CLASS },
      };
    }

    const getCheckboxState = (): boolean | null => {
      if (allSelected) return true;
      if (someSelected) return null;
      return false;
    };

    return {
      cell: (
        <Checkbox
          aria-label={t('Select all rows')}
          data-test={selectAllId}
          id={selectAllId}
          isChecked={getCheckboxState()}
          onChange={handleSelectAll}
        />
      ),
      props: { className: PF_TABLE_CHECK_CLASS },
    };
  }, [
    isSelectable,
    showSelectAllCheckbox,
    allSelected,
    someSelected,
    selectAllId,
    handleSelectAll,
    t,
  ]);

  const effectiveTableColumns = useMemo(() => {
    if (!isSelectable || !selectionColumn) return tableColumns;
    return [selectionColumn, ...tableColumns];
  }, [isSelectable, selectionColumn, tableColumns]);

  const isUnfilteredDataEmpty = isEmpty(unfilteredData ?? data);
  const isDataEmpty = isEmpty(data);

  // Only apply default message when unfilteredData is explicitly provided (table has filtering)
  const hasFiltering = unfilteredData !== undefined;
  const defaultFilteredMsg = hasFiltering ? t('No results match the current filters') : undefined;
  const effectiveNoFilteredDataMsg = renderNoFilteredDataContent(
    noFilteredDataMsg ?? defaultFilteredMsg,
  );

  const showFilteredEmptyState = loaded && isDataEmpty && !isUnfilteredDataEmpty;

  const table = (
    <DataViewTable
      aria-label={ariaLabel}
      className="kubevirt-table"
      columns={effectiveTableColumns}
      rows={rows}
    />
  );

  const renderContent = (): ReactNode => {
    if (isUnfilteredDataEmpty && noDataMsg) {
      return renderNoDataContent(noDataMsg);
    }

    if (showFilteredEmptyState) {
      return (
        <div className="pf-v6-u-text-align-center pf-v6-u-py-lg">{effectiveNoFilteredDataMsg}</div>
      );
    }

    return fixedLayout ? <div className="kubevirt-table--fixed-layout">{table}</div> : table;
  };

  // Show loading when not loaded, regardless of stale data
  // hasData is set to false during loading to ensure skeleton is shown
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
        {renderContent()}
      </StateHandler>
    </div>
  );
};

export default KubevirtTable;
