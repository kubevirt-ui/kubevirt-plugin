import type { FC } from 'react';
import React from 'react';

import type { V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import KubevirtFilterToolbar from '@kubevirt-utils/components/KubevirtFilterToolbar/KubevirtFilterToolbar';
import type {
  KubevirtFilter,
  KubevirtFilterState,
  OnSetFilters,
} from '@kubevirt-utils/hooks/useKubevirtDataViewFilters/types';
import { paginationDefaultValues } from '@kubevirt-utils/hooks/usePagination/utils/constants';
import type { PaginationState } from '@kubevirt-utils/hooks/usePagination/utils/types';
import type { ColumnLayout } from '@openshift-console/dynamic-plugin-sdk';
import { Pagination, Split, SplitItem } from '@patternfly/react-core';

type VirtualMachineFilterProps = {
  clearAllFilters: () => void;
  columnLayout: ColumnLayout;
  data: V1VirtualMachine[];
  filterDefinitions: KubevirtFilter<V1VirtualMachine>[];
  filteredVMsCount: number | undefined;
  filters: KubevirtFilterState;
  isCompact: boolean;
  onPageChange: (pagination: PaginationState) => void;
  onSetFilters: OnSetFilters;
  pagination: PaginationState;
};

const VirtualMachineFilter: FC<VirtualMachineFilterProps> = ({
  clearAllFilters,
  columnLayout,
  data,
  filterDefinitions,
  filteredVMsCount,
  filters,
  isCompact,
  onPageChange,
  onSetFilters,
  pagination,
}) => (
  <Split className="pf-v6-u-mb-sm" hasGutter>
    <SplitItem>
      <KubevirtFilterToolbar
        clearAllFilters={clearAllFilters}
        columnLayout={columnLayout}
        data={data}
        filterDefinitions={filterDefinitions}
        filters={filters}
        loaded
        onSetFilters={onSetFilters}
      />
    </SplitItem>
    <SplitItem isFilled />
    <SplitItem>
      <Pagination
        isCompact={isCompact}
        isLastFullPageShown
        itemCount={filteredVMsCount}
        onPerPageSelect={(_event, perPage, page, startIndex, endIndex) =>
          onPageChange({ endIndex, page, perPage, startIndex })
        }
        onSetPage={(_event, page, perPage, startIndex, endIndex) =>
          onPageChange({ endIndex, page, perPage, startIndex })
        }
        page={pagination?.page}
        perPage={pagination?.perPage}
        perPageOptions={paginationDefaultValues}
      />
    </SplitItem>
  </Split>
);

export default VirtualMachineFilter;
