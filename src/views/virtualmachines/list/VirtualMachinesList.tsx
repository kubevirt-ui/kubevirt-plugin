import React, { FC, useCallback, useEffect, useMemo, useRef, useState } from 'react';

import {
  NodeModel,
  VirtualMachineModelGroupVersionKind,
  VirtualMachineModelRef,
} from '@kubevirt-ui-ext/kubevirt-api/console';
import { V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import ColumnManagement from '@kubevirt-utils/components/ColumnManagementModal/ColumnManagement';
import { tourGuideVM } from '@kubevirt-utils/components/GuidedTour/utils/constants';
import { runningTourSignal } from '@kubevirt-utils/components/GuidedTour/utils/guidedTourSignals';
import KubevirtTable from '@kubevirt-utils/components/KubevirtTable/KubevirtTable';
import { buildColumnLayout } from '@kubevirt-utils/components/KubevirtTable/utils';
import { TableToolbarActionsFlex } from '@kubevirt-utils/components/TableToolbarActions/TableToolbarActionsFlex';
import { PageTitles } from '@kubevirt-utils/constants/page-constants';
import useContainerWidth from '@kubevirt-utils/hooks/useContainerWidth';
import { KUBEVIRT_APISERVER_PROXY } from '@kubevirt-utils/hooks/useFeatures/constants';
import { useFeatures } from '@kubevirt-utils/hooks/useFeatures/useFeatures';
import { KubevirtFilterState } from '@kubevirt-utils/hooks/useKubevirtDataViewFilters/types';
import useKubevirtDataViewFilters from '@kubevirt-utils/hooks/useKubevirtDataViewFilters/useKubevirtDataViewFilters';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import useKubevirtUserSettingsTableColumns from '@kubevirt-utils/hooks/useKubevirtUserSettings/useKubevirtUserSettingsTableColumns';
import useKubevirtWatchResource from '@kubevirt-utils/hooks/useKubevirtWatchResource/useKubevirtWatchResource';
import {
  paginationDefaultValues,
  paginationInitialState,
} from '@kubevirt-utils/hooks/usePagination/utils/constants';
import { usePVCMapper } from '@kubevirt-utils/hooks/usePVCMapper';
import useQuery from '@kubevirt-utils/hooks/useQuery';
import { EXPORT_TABLE_KEYS, KubevirtTableExport } from '@kubevirt-utils/hooks/useTableExport';
import { getName, getNamespace } from '@kubevirt-utils/resources/shared';
import useVirtualMachineInstanceMigrationMapper from '@kubevirt-utils/resources/vmim/hooks/useVirtualMachineInstanceMigrationMapper';
import useVirtualMachineInstanceMigrations from '@kubevirt-utils/resources/vmim/hooks/useVirtualMachineInstanceMigrations';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { getCluster } from '@multicluster/helpers/selectors';
import useIsAllClustersPage from '@multicluster/hooks/useIsAllClustersPage';
import { DocumentTitle, K8sVerb, ListPageBody } from '@openshift-console/dynamic-plugin-sdk';
import { Flex, Pagination } from '@patternfly/react-core';
import { useSignals } from '@preact/signals-react/runtime';
import SearchBar from '@search/components/SearchBar';
import { useFleetAccessReview } from '@stolostron/multicluster-sdk';
import { useAccessibleResources } from '@virtualmachines/search/hooks/useAccessibleResources';
import useVMSearchQueries from '@virtualmachines/search/hooks/useVMSearchQueries';
import VirtualMachineFilterToolbar from '@virtualmachines/search/VirtualMachineFilterToolbar';
import { vmsSignal } from '@virtualmachines/tree/utils/signals';
import { OBJECTS_FETCHING_LIMIT } from '@virtualmachines/utils';
import { getVMIFromMapper, getVMIMFromMapper } from '@virtualmachines/utils/mappers';

import VirtualMachineBulkActionButton from './components/VirtualMachineBulkActionButton';
import VirtualMachineEmptyState from './components/VirtualMachineEmptyState/VirtualMachineEmptyState';
import VirtualMachineSearchResultsHeader from './components/VirtualMachineSearchResultsHeader';
import VirtualMachineSelection from './components/VirtualMachineSelection/VirtualMachineSelection';
import useClearFiltersOnClusterNamespaceChange from './hooks/useClearFiltersOnClusterNamespaceChange';
import { useVirtualMachineInstanceMapper } from './hooks/useVirtualMachineInstanceMapper';
import useVMListFilters from './hooks/useVMListFilters';
import useVMListTelemetry from './hooks/useVMListTelemetry';
import useVMMetrics from './hooks/useVMMetrics';
import { VM_FILTER_OPTIONS } from './utils/constants';
import { filterVMsByClusterAndNamespace } from './utils/utils';
import { getListPageBodySize, ListPageBodySize } from './listPageBodySize';
import { deselectAllVMs } from './selectedVMs';
import { getVMColumns, getVMRowId, VM_COLUMN_KEYS, VMCallbacks } from './virtualMachinesDefinition';

import '@kubevirt-utils/styles/list-managment-group.scss';
import './VirtualMachinesList.scss';

type VirtualMachinesListProps = {
  allVMsLoaded?: boolean;
  cluster?: string;
  isSearchResultsPage?: boolean;
  namespace: string;
};

const VirtualMachinesList: FC<VirtualMachinesListProps> = (props) => {
  const { t } = useKubevirtTranslation();
  const { allVMsLoaded, cluster, isSearchResultsPage = false, namespace } = props;

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

  const {
    loaded: accessibleVMsLoaded,
    loadError: accessibleVMsError,
    resources: accessibleVMs,
  } = useAccessibleResources<V1VirtualMachine>({
    filterOptions: VM_FILTER_OPTIONS,
    groupVersionKind: VirtualMachineModelGroupVersionKind,
  });

  const vms = namespace ? namespacedVMs : accessibleVMs;
  const vmsLoaded = namespace ? namespacedVMsLoaded : accessibleVMsLoaded;
  const vmsLoadError = namespace ? loadError : accessibleVMsError;

  const vmsToShow = useMemo(() => (runningTourSignal.value ? [tourGuideVM] : vms), [vms]);

  const [vmims, vmimsLoaded] = useVirtualMachineInstanceMigrations(cluster, namespace);

  const { vmiMapper, vmisLoaded } = useVirtualMachineInstanceMapper();

  const vmimMapper = useVirtualMachineInstanceMigrationMapper(vmims);
  const pvcMapper = usePVCMapper(namespace, cluster);

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

  useClearFiltersOnClusterNamespaceChange({
    cluster,
    filters,
    namespace,
    onSetFilters,
    resetPagination,
  });

  useEffect(() => {
    deselectAllVMs();
  }, [namespace, cluster, query]);

  const listPageBodyRef = useRef<HTMLDivElement>(null);
  const listPageBodySize = getListPageBodySize(useContainerWidth(listPageBodyRef));

  const onPageChange = ({ endIndex, page, perPage, startIndex }) => {
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

  const columns = useMemo(
    () => getVMColumns(t, namespace, isAllClustersPage, canGetNode),
    [t, namespace, isAllClustersPage, canGetNode],
  );

  const manageableColumns = useMemo(() => columns.filter((col) => col.label), [columns]);

  const [activeColumns, , loadedColumns] = useKubevirtUserSettingsTableColumns<V1VirtualMachine>({
    columnManagementID: VirtualMachineModelRef,
    columns: manageableColumns.map((col) => ({
      additional: col.additional,
      id: col.key,
      props: col.props,
      title: col.label,
    })),
  });

  const activeColumnKeys = useMemo(() => {
    const managedKeys =
      activeColumns?.map((col) => col?.id) ??
      manageableColumns.filter((col) => !col.additional).map((col) => col.key);

    // Always include non-manageable (unlabeled) columns such as the selection column
    const nonManageableKeys = columns.filter((col) => !col.label).map((col) => col.key);

    return Array.from(new Set([...nonManageableKeys, ...managedKeys]));
  }, [activeColumns, columns, manageableColumns]);

  const columnLayout = useMemo(
    () => buildColumnLayout(manageableColumns, activeColumnKeys, VirtualMachineModelRef),
    [manageableColumns, activeColumnKeys],
  );

  const loaded = vmsLoaded && vmisLoaded && vmimsLoaded && !loadingFeatureProxy && loadedColumns;

  useVMListTelemetry({
    isSearchResultsPage,
    loaded,
    resultCount: filteredVMs?.length ?? 0,
  });

  const allVMsInNamespace = useMemo(
    () => filterVMsByClusterAndNamespace(vmsSignal.value, namespace, cluster),
    [vmsSignal.value, namespace, cluster],
  );

  const hasNoVMs = useMemo(() => isEmpty(allVMsInNamespace), [allVMsInNamespace]);

  const callbacks: VMCallbacks = useMemo(
    () => ({
      getVmi: (vm: V1VirtualMachine) => getVMIFromMapper(vmiMapper, vm),
      getVmim: (vm: V1VirtualMachine) =>
        getVMIMFromMapper(vmimMapper, getName(vm), getNamespace(vm), getCluster(vm)),
      pvcMapper,
      vmiMapper,
      vmimMapper,
    }),
    [vmiMapper, vmimMapper, pvcMapper],
  );

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
        <div className="vm-listpagebody" ref={listPageBodyRef}>
          {isSearchResultsPage && <VirtualMachineSearchResultsHeader />}
          {!isSearchResultsPage && allVMsLoaded && hasNoVMs ? (
            <VirtualMachineEmptyState namespace={namespace} />
          ) : (
            <>
              <SearchBar
                clearAllFilters={clearAllFilters}
                filterDefinitions={filterDefinitions}
                onSetFilters={handleSetFilters}
              />
              <VirtualMachineFilterToolbar
                clearAllFilters={() => {
                  deselectAllVMs();
                  resetPagination();
                  clearAllFilters();
                }}
                className="list-managment-group__toolbar"
                filterDefinitions={filterDefinitions}
                filters={filters}
                isSearchResultsPage={isSearchResultsPage}
                listPageBodySize={listPageBodySize}
                loaded
                onSetFilters={handleSetFilters}
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
                    onPerPageSelect={(_e, perPage, page, startIndex, endIndex) =>
                      onPageChange({ endIndex, page, perPage, startIndex })
                    }
                    onSetPage={(_e, page, perPage, startIndex, endIndex) =>
                      onPageChange({ endIndex, page, perPage, startIndex })
                    }
                    className="list-managment-group__pagination"
                    isCompact={listPageBodySize !== ListPageBodySize.lg}
                    isLastFullPageShown
                    itemCount={filteredVMs?.length}
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
                noFilteredDataMsg={t('No VirtualMachines found')}
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
