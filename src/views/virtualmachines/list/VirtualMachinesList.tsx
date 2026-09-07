import React, { type FC, useEffect, useMemo, useRef } from 'react';

import { type V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { tourGuideVM } from '@kubevirt-utils/components/GuidedTour/utils/constants';
import { runningTourSignal } from '@kubevirt-utils/components/GuidedTour/utils/guidedTourSignals';
import KubevirtTable from '@kubevirt-utils/components/KubevirtTable/KubevirtTable';
import { PageTitles } from '@kubevirt-utils/constants/page-constants';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import usePagination from '@kubevirt-utils/hooks/usePagination/usePagination';
import useQuery from '@kubevirt-utils/hooks/useQuery';
import { EXPORT_TABLE_KEYS, KubevirtTableExport } from '@kubevirt-utils/hooks/useTableExport';
import { DocumentTitle, ListPageBody } from '@openshift-console/dynamic-plugin-sdk';
import { DataViewSortParams } from '@patternfly/react-data-view';
import { useSignals } from '@preact/signals-react/runtime';
import { vmsSignal } from '@virtualmachines/tree/utils/signals';

import VirtualMachineEmptyState from './components/VirtualMachineEmptyState/VirtualMachineEmptyState';
import VirtualMachineFilteredEmptyState from './components/VirtualMachineFilteredEmptyState/VirtualMachineFilteredEmptyState';
import VirtualMachinesListToolbar from './components/VirtualMachinesListToolbar';
import { useVMDataSource } from './hooks/useVMDataSource';
import { useVMListColumns } from './hooks/useVMListColumns';
import { useVMListFilterState } from './hooks/useVMListFilterState';
import useVMListTelemetry from './hooks/useVMListTelemetry';
import useVMMetrics from './hooks/useVMMetrics';
import { deselectAllVMs } from './selectedVMs';
import { filterVMsByClusterAndNamespace } from './utils/utils';
import { getVMRowId, VM_COLUMN_KEYS, type VMCallbacks } from './virtualMachinesDefinition';

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
  const { t } = useKubevirtTranslation();
  useSignals();
  useVMMetrics();

  const query = useQuery();
  const selectionResetKey = useMemo(() => {
    const params = new URLSearchParams(query);
    params.delete(DataViewSortParams.SORT_BY);
    params.delete(DataViewSortParams.DIRECTION);
    return params.toString();
  }, [query]);

  const { accessibleVMs, vms, vmsLoaded, vmsLoadError } = useVMDataSource(namespace, cluster);
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
  const hasNoVMs = useMemo(() => allVMsInNamespace.length === 0, [allVMsInNamespace]);

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
    />
  );

  return (
    <>
      <DocumentTitle>{PageTitles.VirtualMachines}</DocumentTitle>
      <ListPageBody>
        <div className="vm-listpagebody">
          {allVMsLoaded && hasNoVMs ? (
            <VirtualMachineEmptyState namespace={namespace} />
          ) : (
            <>
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
                getRowId={getVMRowId}
                initialSortKey={VM_COLUMN_KEYS.name}
                loaded={loaded}
                loadError={vmsLoadError}
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
          )}
        </div>
      </ListPageBody>
    </>
  );
};

export default VirtualMachinesList;
