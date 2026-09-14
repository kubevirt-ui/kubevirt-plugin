import React, { type ReactNode } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { DataViewTable, type DataViewTr } from '@patternfly/react-data-view';
import { type DataViewTh } from '@patternfly/react-data-view/dist/esm/DataViewTable';

import { renderNoDataContent, renderNoFilteredDataContent } from './KubevirtTableEmptyStates';

type KubevirtTableBodyProps = {
  ariaLabel?: string;
  data: unknown[];
  effectiveTableColumns: DataViewTh[];
  fixedLayout?: boolean;
  loaded: boolean;
  noDataMsg?: ReactNode;
  noFilteredDataMsg?: ReactNode;
  rows: DataViewTr[];
  unfilteredData?: unknown[];
};

const KubevirtTableBody = ({
  ariaLabel,
  data,
  effectiveTableColumns,
  fixedLayout,
  loaded,
  noDataMsg,
  noFilteredDataMsg,
  rows,
  unfilteredData,
}: KubevirtTableBodyProps): ReactNode => {
  const { t } = useKubevirtTranslation();
  const isUnfilteredDataEmpty = isEmpty(unfilteredData ?? data);
  const isDataEmpty = isEmpty(data);
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

export default KubevirtTableBody;
