import { type FC, type ReactNode, type RefObject } from 'react';

import { type V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import KubevirtTable from '@kubevirt-utils/components/KubevirtTable/KubevirtTable';
import { getK8sRowId } from '@kubevirt-utils/components/KubevirtTable/utils';
import { type ColumnConfig } from '@kubevirt-utils/hooks/useDataViewTableSort/types';
import {
  type KubevirtFilter,
  type KubevirtFilterState,
} from '@kubevirt-utils/hooks/useKubevirtDataViewFilters/types';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { type PaginationState } from '@kubevirt-utils/hooks/usePagination/utils/types';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { type ColumnLayout } from '@openshift-console/dynamic-plugin-sdk';
import { type VMIMMapper } from '@virtualmachines/utils/mappers';

import { VM_COLUMN_KEYS, type VMCallbacks } from '../virtualMachinesDefinition';

import FleetVMInventoryBanner from './FleetVMInventoryBanner';
import VirtualMachineFilteredEmptyState from './VirtualMachineFilteredEmptyState/VirtualMachineFilteredEmptyState';
import VirtualMachinesListToolbar from './VirtualMachinesListToolbar';

type VirtualMachinesListBodyProps = {
  accessibleVMs: V1VirtualMachine[];
  activeColumnKeys: string[];
  allVMsInNamespace: V1VirtualMachine[];
  callbacks: VMCallbacks;
  clearAllFiltersWithReset: () => void;
  columnLayout: ColumnLayout;
  columns: ColumnConfig<V1VirtualMachine, VMCallbacks>[];
  error?: Error;
  exportButton: ReactNode;
  filterDefinitions: KubevirtFilter<V1VirtualMachine>[];
  filteredVMs: V1VirtualMachine[];
  filters: KubevirtFilterState;
  handleSetFilters: (newFilters: Partial<KubevirtFilterState>) => void;
  isSoftError: boolean;
  loaded: boolean;
  onPaginationChange: (pagination: PaginationState) => void;
  pagination: PaginationState;
  refresh?: () => void;
  searchInputRef: RefObject<HTMLInputElement>;
  vmimMapper: VMIMMapper;
  vmsToShow: V1VirtualMachine[];
};

const VirtualMachinesListBody: FC<VirtualMachinesListBodyProps> = ({
  accessibleVMs,
  activeColumnKeys,
  allVMsInNamespace,
  callbacks,
  clearAllFiltersWithReset,
  columnLayout,
  columns,
  error,
  exportButton,
  filterDefinitions,
  filteredVMs,
  filters,
  handleSetFilters,
  isSoftError,
  loaded,
  onPaginationChange,
  pagination,
  refresh,
  searchInputRef,
  vmimMapper,
  vmsToShow,
}) => {
  const { t } = useKubevirtTranslation();

  return (
    <>
      <FleetVMInventoryBanner
        error={isSoftError ? error : undefined}
        hasInventory={!isEmpty(vmsToShow)}
        onRetry={refresh}
      />
      <VirtualMachinesListToolbar
        accessibleVMs={accessibleVMs}
        callbacks={callbacks}
        clearAllFiltersWithReset={clearAllFiltersWithReset}
        columnLayout={columnLayout}
        columns={columns}
        exportButton={exportButton}
        filterDefinitions={filterDefinitions}
        filteredVMs={filteredVMs}
        filters={filters}
        handleSetFilters={handleSetFilters}
        onPageChange={onPaginationChange}
        pagination={pagination}
        searchInputRef={searchInputRef}
        vmimMapper={vmimMapper}
        vmsToShow={vmsToShow}
      />
      <KubevirtTable<V1VirtualMachine, VMCallbacks>
        activeColumnKeys={activeColumnKeys}
        ariaLabel={t('VirtualMachines table')}
        callbacks={callbacks}
        columns={columns}
        data={filteredVMs ?? []}
        getRowId={getK8sRowId}
        initialSortKey={VM_COLUMN_KEYS.name}
        isResizable
        loaded={loaded}
        loadError={isSoftError ? undefined : error}
        noFilteredDataMsg={
          <VirtualMachineFilteredEmptyState
            clearAllFilters={clearAllFiltersWithReset}
            filters={filters}
            searchInputRef={searchInputRef}
          />
        }
        pagination={pagination}
        persistSortInUrl
        unfilteredData={allVMsInNamespace}
      />
    </>
  );
};

export default VirtualMachinesListBody;
