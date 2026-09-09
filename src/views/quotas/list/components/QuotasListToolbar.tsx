// Extracted from QuotasList.tsx
// Root: src/views/quotas/list/QuotasList.tsx

import React, { type ComponentProps, type FC } from 'react';

import KubevirtFilterToolbar from '@kubevirt-utils/components/KubevirtFilterToolbar/KubevirtFilterToolbar';
import { type ColumnLayout } from '@kubevirt-utils/components/KubevirtTable/types';
import { type ColumnConfig } from '@kubevirt-utils/hooks/useDataViewTableSort/types';
import {
  type KubevirtFilterState,
  type OnSetFilters,
} from '@kubevirt-utils/hooks/useKubevirtDataViewFilters/types';
import { paginationDefaultValues } from '@kubevirt-utils/hooks/usePagination/utils/constants';
import { type PaginationState } from '@kubevirt-utils/hooks/usePagination/utils/types';
import { EXPORT_TABLE_KEYS, KubevirtTableExport } from '@kubevirt-utils/hooks/useTableExport';
import { type ApplicationAwareQuota } from '@kubevirt-utils/resources/quotas/types';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { Pagination } from '@patternfly/react-core';

import { type QuotaCallbacks } from '../utils/helpers';

type QuotasListToolbarProps = {
  activeColumnKeys: string[];
  callbacks: QuotaCallbacks;
  clearAllFilters: () => void;
  columnLayout: ColumnLayout;
  columns: ColumnConfig<ApplicationAwareQuota, QuotaCallbacks>[];
  filteredData: ApplicationAwareQuota[];
  filters: KubevirtFilterState;
  handlePerPageSelect: ComponentProps<typeof Pagination>['onPerPageSelect'];
  handleSetFilters: OnSetFilters;
  handleSetPage: ComponentProps<typeof Pagination>['onSetPage'];
  isLoaded: boolean;
  pagination: PaginationState;
  quotas: ApplicationAwareQuota[];
};

const QuotasListToolbar: FC<QuotasListToolbarProps> = ({
  activeColumnKeys,
  callbacks,
  clearAllFilters,
  columnLayout,
  columns,
  filteredData,
  filters,
  handlePerPageSelect,
  handleSetFilters,
  handleSetPage,
  isLoaded,
  pagination,
  quotas,
}) => (
  <div className="list-managment-group">
    <KubevirtFilterToolbar
      clearAllFilters={clearAllFilters}
      columnLayout={columnLayout}
      data={quotas}
      filters={filters}
      loaded={isLoaded}
      onSetFilters={handleSetFilters}
      toolbarEndContent={
        <KubevirtTableExport<ApplicationAwareQuota, QuotaCallbacks>
          activeColumnKeys={activeColumnKeys}
          callbacks={callbacks}
          columns={columns}
          data={filteredData ?? []}
          exportKey={EXPORT_TABLE_KEYS.APPLICATION_AWARE_QUOTAS}
          loaded={isLoaded}
        />
      }
    />
    {!isEmpty(filteredData) && isLoaded && (
      <Pagination
        className="list-managment-group__pagination"
        isLastFullPageShown
        itemCount={filteredData?.length}
        onPerPageSelect={handlePerPageSelect}
        onSetPage={handleSetPage}
        page={pagination?.page}
        perPage={pagination?.perPage}
        perPageOptions={paginationDefaultValues}
      />
    )}
  </div>
);

export default QuotasListToolbar;
