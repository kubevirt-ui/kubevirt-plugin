import { type FC, useEffect, useMemo, useRef } from 'react';

import { type V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import KubevirtTable from '@kubevirt-utils/components/KubevirtTable/KubevirtTable';
import { getK8sRowId } from '@kubevirt-utils/components/KubevirtTable/utils';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import usePagination from '@kubevirt-utils/hooks/usePagination/usePagination';
import useQuery from '@kubevirt-utils/hooks/useQuery';
import { EXPORT_TABLE_KEYS, KubevirtTableExport } from '@kubevirt-utils/hooks/useTableExport';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { DataViewSortParams } from '@patternfly/react-data-view';

import { deselectAllVMs } from '../selectedVMs';
import { VM_COLUMN_KEYS, type VMCallbacks } from '../virtualMachinesDefinition';

import useExistingSelectedVMs from '../hooks/useExistingSelectedVMs';
import { useVMListColumns } from '../hooks/useVMListColumns';
import { useVMListFilterState } from '../hooks/useVMListFilterState';
import useVMListTelemetry from '../hooks/useVMListTelemetry';
import FleetVMInventoryBanner from './FleetVMInventoryBanner';
import VirtualMachineEmptyState from './VirtualMachineEmptyState/VirtualMachineEmptyState';
import VirtualMachineFilteredEmptyState from './VirtualMachineFilteredEmptyState/VirtualMachineFilteredEmptyState';
import VirtualMachinesListToolbar from './VirtualMachinesListToolbar';

type VirtualMachinesListBodyProps = {
  accessibleVMs: V1VirtualMachine[];
  allVMsInNamespace: V1VirtualMachine[];
  cluster?: string;
  error?: Error;
  isSoftError: boolean;
  namespace: string;
  refresh?: () => void;
  showEmptyState: boolean;
  vmsLoaded: boolean;
  vmsToShow: V1VirtualMachine[];
};

const VirtualMachinesListBody: FC<VirtualMachinesListBodyProps> = ({
  accessibleVMs,
  allVMsInNamespace,
  cluster,
  error,
  isSoftError,
  namespace,
  refresh,
  showEmptyState,
  vmsLoaded,
  vmsToShow,
}) => {
  const { t } = useKubevirtTranslation();
  const query = useQuery();

  const selectionResetKey = useMemo(() => {
    const params = new URLSearchParams(query);
    params.delete(DataViewSortParams.SORT_BY);
    params.delete(DataViewSortParams.DIRECTION);
    return params.toString();
  }, [query]);

  const {
    activeColumnKeys,
    callbacks,
    columnLayout,
    columns,
    loaded: columnsLoaded,
    pvcMapper,
    vmiMapper,
    vmimMapper,
  } = useVMListColumns(namespace, cluster);

  const { onPaginationChange, pagination, resetPagination } = usePagination();
  const searchInputRef = useRef<HTMLInputElement>(null);

  const { clearAllFiltersWithReset, filterDefinitions, filteredVMs, filters, handleSetFilters } =
    useVMListFilterState(vmsToShow, vmiMapper, pvcMapper, resetPagination);

  const selectedVirtualMachines = useExistingSelectedVMs(filteredVMs ?? []);

  useEffect(() => {
    deselectAllVMs();
  }, [namespace, cluster, selectionResetKey]);

  const loaded = vmsLoaded && columnsLoaded;

  useVMListTelemetry({ loaded });

  if (showEmptyState) return <VirtualMachineEmptyState namespace={namespace} />;

  const exportButton = (
    <KubevirtTableExport<V1VirtualMachine, VMCallbacks>
      activeColumnKeys={activeColumnKeys}
      asToolbarItem={false}
      callbacks={callbacks}
      columns={columns}
      data={filteredVMs ?? []}
      exportKey={EXPORT_TABLE_KEYS.VIRTUAL_MACHINES}
      initialSortKey={VM_COLUMN_KEYS.name}
      loaded={loaded}
      selectedData={selectedVirtualMachines}
    />
  );

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
        tableId={columnLayout.id}
        unfilteredData={allVMsInNamespace}
      />
    </>
  );
};

export default VirtualMachinesListBody;
