import { type FC, useEffect, useMemo, useRef } from 'react';

import { type V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { tourGuideVM } from '@kubevirt-utils/components/GuidedTour/utils/constants';
import { runningTourSignal } from '@kubevirt-utils/components/GuidedTour/utils/guidedTourSignals';
import { PageTitles } from '@kubevirt-utils/constants/page-constants';
import usePagination from '@kubevirt-utils/hooks/usePagination/usePagination';
import useQuery from '@kubevirt-utils/hooks/useQuery';
import { EXPORT_TABLE_KEYS, KubevirtTableExport } from '@kubevirt-utils/hooks/useTableExport';
import { DocumentTitle, ListPageBody } from '@openshift-console/dynamic-plugin-sdk';
import { DataViewSortParams } from '@patternfly/react-data-view';
import { useSignals } from '@preact/signals-react/runtime';
import { vmsSignal } from '@virtualmachines/tree/utils/signals';

import VirtualMachineEmptyState from './components/VirtualMachineEmptyState/VirtualMachineEmptyState';
import VirtualMachinesListBody from './components/VirtualMachinesListBody';
import useExistingSelectedVMs from './hooks/useExistingSelectedVMs';
import { useVMDataSource } from './hooks/useVMDataSource';
import { useVMListColumns } from './hooks/useVMListColumns';
import { useVMListFilterState } from './hooks/useVMListFilterState';
import useVMListTelemetry from './hooks/useVMListTelemetry';
import useVMMetrics from './hooks/useVMMetrics';
import { deselectAllVMs } from './selectedVMs';
import { filterVMsByClusterAndNamespace } from './utils/utils';
import { VM_COLUMN_KEYS, type VMCallbacks } from './virtualMachinesDefinition';

import './VirtualMachinesList.scss';

type VirtualMachinesListProps = {
  allVMsLoaded?: boolean;
  cluster?: string;
  namespace: string;
};

const VirtualMachinesList: FC<VirtualMachinesListProps> = ({
  allVMsLoaded,
  cluster,
  namespace,
}) => {
  useSignals();
  useVMMetrics();

  const query = useQuery();
  const selectionResetKey = useMemo(() => {
    const params = new URLSearchParams(query);
    params.delete(DataViewSortParams.SORT_BY);
    params.delete(DataViewSortParams.DIRECTION);
    return params.toString();
  }, [query]);

  const { accessibleVMs, error, isSoftError, refresh, vms, vmsLoaded } = useVMDataSource(
    namespace,
    cluster,
  );
  const vmsToShow = useMemo(() => (runningTourSignal.value ? [tourGuideVM] : vms), [vms]);

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

  const allVMsInNamespace = useMemo(
    () => filterVMsByClusterAndNamespace(vmsSignal.value, namespace, cluster),
    /* eslint-disable-next-line react-hooks/exhaustive-deps */
    [vmsSignal.value, namespace, cluster],
  );
  const hasNoVMs = allVMsInNamespace.length === 0;

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
      <DocumentTitle>{PageTitles.VirtualMachines}</DocumentTitle>
      <ListPageBody>
        <div className="vm-listpagebody">
          {allVMsLoaded && hasNoVMs && !error ? (
            <VirtualMachineEmptyState namespace={namespace} />
          ) : (
            <VirtualMachinesListBody
              accessibleVMs={accessibleVMs}
              activeColumnKeys={activeColumnKeys}
              allVMsInNamespace={allVMsInNamespace}
              callbacks={callbacks}
              clearAllFiltersWithReset={clearAllFiltersWithReset}
              columnLayout={columnLayout}
              columns={columns}
              error={error}
              exportButton={exportButton}
              filterDefinitions={filterDefinitions}
              filteredVMs={filteredVMs}
              filters={filters}
              handleSetFilters={handleSetFilters}
              isSoftError={isSoftError}
              loaded={loaded}
              onPaginationChange={onPaginationChange}
              pagination={pagination}
              refresh={refresh}
              searchInputRef={searchInputRef}
              vmimMapper={vmimMapper}
              vmsToShow={vmsToShow}
            />
          )}
        </div>
      </ListPageBody>
    </>
  );
};

export default VirtualMachinesList;
