import React, { ReactElement, ReactNode, useMemo } from 'react';

import { ColumnConfig } from '@kubevirt-utils/hooks/useDataViewTableSort/types';
import { useDataViewTableSort } from '@kubevirt-utils/hooks/useDataViewTableSort/useDataViewTableSort';
import { generateRows } from '@kubevirt-utils/hooks/useDataViewTableSort/utils';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
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
  noDataMsg?: ReactNode;
  noFilteredDataMsg?: ReactNode;
  onSelect?: (selected: TData[]) => void;
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

  const { t } = useKubevirtTranslation();

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

  // Only apply default message when unfilteredData is explicitly provided (table has filtering)
  const hasFiltering = unfilteredData !== undefined;
  const defaultFilteredMsg = hasFiltering ? t('No results match the current filters') : undefined;
  const effectiveNoFilteredDataMsg = renderNoFilteredDataContent(
    noFilteredDataMsg ?? defaultFilteredMsg,
  );

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
