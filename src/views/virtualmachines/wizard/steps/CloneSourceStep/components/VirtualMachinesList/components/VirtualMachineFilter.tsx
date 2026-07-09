import React, { FC } from 'react';

import { V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import ListPageFilter from '@kubevirt-utils/components/ListPageFilter/ListPageFilter';
import { paginationDefaultValues } from '@kubevirt-utils/hooks/usePagination/utils/constants';
import { PaginationState } from '@kubevirt-utils/hooks/usePagination/utils/types';
import { ColumnLayout, OnFilterChange, RowFilter } from '@openshift-console/dynamic-plugin-sdk';
import { Pagination, Split, SplitItem } from '@patternfly/react-core';

type VirtualMachineFilterProps = {
  columnLayout: ColumnLayout;
  filteredVMsCount: number | undefined;
  isCompact: boolean;
  onFilterChange: OnFilterChange;
  onPageChange: (pagination: PaginationState) => void;
  pagination: PaginationState;
  rowFilters: RowFilter<V1VirtualMachine>[];
  unfilteredData: V1VirtualMachine[];
};

const VirtualMachineFilter: FC<VirtualMachineFilterProps> = ({
  columnLayout,
  filteredVMsCount,
  isCompact,
  onFilterChange,
  onPageChange,
  pagination,
  rowFilters,
  unfilteredData,
}) => (
  <Split className="pf-v6-u-mb-sm" hasGutter>
    <SplitItem>
      <ListPageFilter
        columnLayout={columnLayout}
        data={unfilteredData}
        loaded
        onFilterChange={onFilterChange}
        rowFilters={rowFilters}
      />
    </SplitItem>
    <SplitItem isFilled />
    <SplitItem>
      <Pagination
        onPerPageSelect={(_e, perPage, page, startIndex, endIndex) =>
          onPageChange({ endIndex, page, perPage, startIndex })
        }
        onSetPage={(_e, page, perPage, startIndex, endIndex) =>
          onPageChange({ endIndex, page, perPage, startIndex })
        }
        className="list-managment-group__pagination"
        isCompact={isCompact}
        isLastFullPageShown
        itemCount={filteredVMsCount}
        page={pagination?.page}
        perPage={pagination?.perPage}
        perPageOptions={paginationDefaultValues}
      />
    </SplitItem>
  </Split>
);

export default VirtualMachineFilter;
