/* eslint-disable max-lines */
import React, { type FC, useCallback, useEffect, useMemo, useRef, useState } from 'react';

import {
  NodeModel,
  VirtualMachineModelGroupVersionKind,
  VirtualMachineModelRef,
} from '@kubevirt-ui-ext/kubevirt-api/console';
import { type V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import ColumnManagement from '@kubevirt-utils/components/ColumnManagementModal/ColumnManagement';
import { tourGuideVM } from '@kubevirt-utils/components/GuidedTour/utils/constants';
import { runningTourSignal } from '@kubevirt-utils/components/GuidedTour/utils/guidedTourSignals';
import KubevirtTable from '@kubevirt-utils/components/KubevirtTable/KubevirtTable';
import { TableToolbarActionsFlex } from '@kubevirt-utils/components/TableToolbarActions/TableToolbarActionsFlex';
import { PageTitles } from '@kubevirt-utils/constants/page-constants';
import { KUBEVIRT_APISERVER_PROXY } from '@kubevirt-utils/hooks/useFeatures/constants';
import { useFeatures } from '@kubevirt-utils/hooks/useFeatures/useFeatures';
import { type KubevirtFilterState } from '@kubevirt-utils/hooks/useKubevirtDataViewFilters/types';
import useKubevirtDataViewFilters from '@kubevirt-utils/hooks/useKubevirtDataViewFilters/useKubevirtDataViewFilters';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import useKubevirtWatchResource from '@kubevirt-utils/hooks/useKubevirtWatchResource/useKubevirtWatchResource';
import {
  paginationDefaultValues,
  paginationInitialState,
} from '@kubevirt-utils/hooks/usePagination/utils/constants';
import { type PaginationState } from '@kubevirt-utils/hooks/usePagination/utils/types';
import useQuery from '@kubevirt-utils/hooks/useQuery';
import { EXPORT_TABLE_KEYS, KubevirtTableExport } from '@kubevirt-utils/hooks/useTableExport';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import useIsAllClustersPage from '@multicluster/hooks/useIsAllClustersPage';
import { DocumentTitle, type K8sVerb, ListPageBody } from '@openshift-console/dynamic-plugin-sdk';
import { Flex, Pagination } from '@patternfly/react-core';
import { useSignals } from '@preact/signals-react/runtime';
import SearchBar from '@search/components/SearchBar';
import { useFleetAccessReview } from '@stolostron/multicluster-sdk';
import { useAccessibleResources } from '@virtualmachines/search/hooks/useAccessibleResources';
import useVMSearchQueries from '@virtualmachines/search/hooks/useVMSearchQueries';
import VirtualMachineFilterToolbar from '@virtualmachines/search/VirtualMachineFilterToolbar';
import { vmsSignal } from '@virtualmachines/tree/utils/signals';
import { OBJECTS_FETCHING_LIMIT } from '@virtualmachines/utils';

import VirtIODriversAlert from './components/VirtIODriversAlert/VirtIODriversAlert';
import VirtualMachineBulkActionButton from './components/VirtualMachineBulkActionButton';
import VirtualMachineEmptyState from './components/VirtualMachineEmptyState/VirtualMachineEmptyState';
import VirtualMachineFilteredEmptyState from './components/VirtualMachineFilteredEmptyState/VirtualMachineFilteredEmptyState';
import VirtualMachineSelection from './components/VirtualMachineSelection/VirtualMachineSelection';
import useFilterSync from './hooks/useFilterSync/useFilterSync';
import useVirtualMachineListColumnUtils from './hooks/useVirtualMachineListColumnUtils';
import useVirtualMachineListColumns from './hooks/useVirtualMachinesListColumns';
import useVMListFilters from './hooks/useVMListFilters';
import useVMListTelemetry from './hooks/useVMListTelemetry';
import useVMMetrics from './hooks/useVMMetrics';
import { deselectAllVMs } from './selectedVMs';
import { VM_FILTER_OPTIONS } from './utils/constants';
import { filterVMsByClusterAndNamespace } from './utils/utils';
import { getVMRowId, VM_COLUMN_KEYS, type VMCallbacks } from './virtualMachinesDefinition';

import '@kubevirt-utils/styles/list-managment-group.scss';
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

  const isAllClustersPage = useIsAllClustersPage();

  const searchQueries = useVMSearchQueries();

  const { loading: loadingFeatureProxy } = useFeatures(KUBEVIRT_APISERVER_PROXY);

  useSignals();
  useVMMetrics();

  const query = useQuery();

  const [namespacedVMs, namespacedVMsLoaded, loadError] = useKubevirtWatchResource<
    V1VirtualMachine[]
  >(
    namespace
      ? {
          cluster,
          groupVersionKind: VirtualMachineModelGroupVersionKind,
          isList: true,
          limit: OBJECTS_FETCHING_LIMIT,
          namespace,
          namespaced: true,
        }
      : null,
    VM_FILTER_OPTIONS,
    searchQueries?.vmQueries,
  );

  const accessibleVMsResults = useAccessibleResources<V1VirtualMachine>({
    filterOptions: VM_FILTER_OPTIONS,
    groupVersionKind: VirtualMachineModelGroupVersionKind,
  });
  const { loaded: accessibleVMsLoaded, resources: accessibleVMs } = accessibleVMsResults;
  const accessibleVMsError = accessibleVMsResults.loadError as Error;

  const vms = namespace ? namespacedVMs : accessibleVMs;
  const vmsLoaded = namespace ? namespacedVMsLoaded : accessibleVMsLoaded;
  const vmsLoadError = namespace ? loadError : accessibleVMsError;

  const vmsToShow = useMemo(() => (runningTourSignal.value ? [tourGuideVM] : vms), [vms]);

  const {
    callbacks,
    loaded: columnUtilsLoaded,
    pvcMapper,
    vmiMapper,
    vmimMapper,
  } = useVirtualMachineListColumnUtils(cluster, namespace);

  const filterDefinitions = useVMListFilters(vmiMapper, pvcMapper);
  const {
    clearAllFilters,
    filteredData: filteredVMs,
    filters,
    onSetFilters,
  } = useKubevirtDataViewFilters({
    data: vmsToShow ?? [],
    filterDefinitions,
  });

  const [pagination, setPagination] = useState(paginationInitialState);

  const resetPagination = useCallback(() => {
    setPagination((prev) => ({
      ...prev,
      endIndex: prev?.perPage,
      page: 1,
      startIndex: 0,
    }));
  }, []);

  const handleSetFilters = useCallback(
    (newFilters: Partial<KubevirtFilterState>) => {
      deselectAllVMs();
      resetPagination();
      onSetFilters(newFilters);
    },
    [onSetFilters, resetPagination],
  );

  useFilterSync(handleSetFilters);

  useEffect(() => {
    deselectAllVMs();
  }, [namespace, cluster, query]);

  const searchInputRef = useRef<HTMLInputElement>(null);

  const onPageChange = ({ endIndex, page, perPage, startIndex }: PaginationState): void => {
    setPagination(() => ({
      endIndex,
      page,
      perPage,
      startIndex,
    }));
  };

  const [canGetNode] = useFleetAccessReview({
    cluster,
    namespace,
    resource: NodeModel.plural,
    verb: 'get' as K8sVerb,
  });

  const { activeColumnKeys, columnLayout, columns, loadedColumns } = useVirtualMachineListColumns(
    VirtualMachineModelRef,
    namespace,
    isAllClustersPage,
    canGetNode,
  );

  const loaded = vmsLoaded && columnUtilsLoaded && !loadingFeatureProxy && loadedColumns;

  useVMListTelemetry({ loaded });

  const allVMsInNamespace = useMemo(
    () => filterVMsByClusterAndNamespace(vmsSignal.value, namespace, cluster),
    /* eslint-disable-next-line react-hooks/exhaustive-deps */
    [vmsSignal.value, namespace, cluster],
  );

  const hasNoVMs = useMemo(() => isEmpty(allVMsInNamespace), [allVMsInNamespace]);

  const clearAllFiltersWithReset = useCallback(() => {
    deselectAllVMs();
    resetPagination();
    clearAllFilters();
  }, [clearAllFilters, resetPagination]);

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
              <SearchBar
                clearAllFilters={clearAllFilters}
                filterDefinitions={filterDefinitions}
                filters={filters}
                inputRef={searchInputRef}
                onSetFilters={handleSetFilters}
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
                <VirtualMachineSelection pagination={pagination} vms={filteredVMs} />
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
