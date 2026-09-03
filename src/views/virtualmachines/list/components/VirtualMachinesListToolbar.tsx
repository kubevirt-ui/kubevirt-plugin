import React, { type FC, type RefObject } from 'react';

import { type V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import ColumnManagement from '@kubevirt-utils/components/ColumnManagementModal/ColumnManagement';
import { TableToolbarActionsFlex } from '@kubevirt-utils/components/TableToolbarActions/TableToolbarActionsFlex';
import { type ColumnConfig } from '@kubevirt-utils/hooks/useDataViewTableSort/types';
import { useSortedTableData } from '@kubevirt-utils/hooks/useDataViewTableSort/useSortedTableData';
import {
  type KubevirtFilter,
  type KubevirtFilterState,
} from '@kubevirt-utils/hooks/useKubevirtDataViewFilters/types';
import { paginationDefaultValues } from '@kubevirt-utils/hooks/usePagination/utils/constants';
import { type PaginationState } from '@kubevirt-utils/hooks/usePagination/utils/types';
import { type ColumnLayout } from '@openshift-console/dynamic-plugin-sdk';
import { Flex, Pagination } from '@patternfly/react-core';
import SearchBar from '@search/components/SearchBar';
import VirtualMachineFilterToolbar from '@virtualmachines/search/VirtualMachineFilterToolbar';
import { type VMIMMapper } from '@virtualmachines/utils/mappers';

import { VM_COLUMN_KEYS, type VMCallbacks } from '../virtualMachinesDefinition';

import VirtIODriversAlert from './VirtIODriversAlert/VirtIODriversAlert';
import VirtualMachineBulkActionButton from './VirtualMachineBulkActionButton';
import VirtualMachineSelection from './VirtualMachineSelection/VirtualMachineSelection';

import '@kubevirt-utils/styles/list-managment-group.scss';

type VirtualMachinesListToolbarProps = {
  accessibleVMs: V1VirtualMachine[];
  callbacks: VMCallbacks;
  clearAllFiltersWithReset: () => void;
  columnLayout: ColumnLayout;
  columns: ColumnConfig<V1VirtualMachine, VMCallbacks>[];
  exportButton: React.ReactNode;
  filterDefinitions: KubevirtFilter<V1VirtualMachine>[];
  filteredVMs: V1VirtualMachine[];
  filters: KubevirtFilterState;
  handleSetFilters: (newFilters: Partial<KubevirtFilterState>) => void;
  onPageChange: (pagination: PaginationState) => void;
  pagination: PaginationState;
  searchInputRef: RefObject<HTMLInputElement>;
  vmimMapper: VMIMMapper;
  vmsToShow: V1VirtualMachine[];
};

const VirtualMachinesListToolbar: FC<VirtualMachinesListToolbarProps> = ({
  accessibleVMs,
  callbacks,
  clearAllFiltersWithReset,
  columnLayout,
  columns,
  exportButton,
  filterDefinitions,
  filteredVMs,
  filters,
  handleSetFilters,
  onPageChange,
  pagination,
  searchInputRef,
  vmimMapper,
  vmsToShow,
}) => {
  const sortedVMs = useSortedTableData({
    callbacks,
    columns,
    data: filteredVMs ?? [],
    initialSortKey: VM_COLUMN_KEYS.name,
  });

  return (
    <>
      <SearchBar
        clearAllFilters={clearAllFiltersWithReset}
        filterDefinitions={filterDefinitions}
        filters={filters}
        inputRef={searchInputRef}
        onSetFilters={handleSetFilters}
        vms={accessibleVMs}
      />
      <VirtIODriversAlert vms={vmsToShow} />
      <VirtualMachineFilterToolbar
        className="list-managment-group__toolbar"
        clearAllFilters={clearAllFiltersWithReset}
        filterDefinitions={filterDefinitions}
        filters={filters}
        loaded
        onSetFilters={handleSetFilters}
        vms={vmsToShow}
      />
      <div className="list-managment-group">
        <VirtualMachineSelection pagination={pagination} vms={sortedVMs} />
        <Flex className="list-managment-group__flex" flexWrap={{ default: 'nowrap' }}>
          <VirtualMachineBulkActionButton vmimMapper={vmimMapper} vms={filteredVMs} />
          <TableToolbarActionsFlex>
            {exportButton}
            <ColumnManagement columnLayout={columnLayout} />
          </TableToolbarActionsFlex>
          <Pagination
            className="list-managment-group__pagination"
            isCompact
            isLastFullPageShown
            itemCount={filteredVMs?.length}
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
        </Flex>
      </div>
    </>
  );
};

export default VirtualMachinesListToolbar;
