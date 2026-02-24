import React, {
  FC,
  forwardRef,
  RefAttributes,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react';

import {
  VirtualMachineModelGroupVersionKind,
  VirtualMachineModelRef,
} from '@kubevirt-ui-ext/kubevirt-api/console';
import { V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import ColumnManagement from '@kubevirt-utils/components/ColumnManagementModal/ColumnManagement';
import { tourGuideVM } from '@kubevirt-utils/components/GuidedTour/utils/constants';
import { runningTourSignal } from '@kubevirt-utils/components/GuidedTour/utils/guidedTourSignals';
import { ExposedFilterFunctions } from '@kubevirt-utils/components/ListPageFilter/types';
import { DEFAULT_NAMESPACE } from '@kubevirt-utils/constants/constants';
import { PageTitles } from '@kubevirt-utils/constants/page-constants';
import useContainerWidth from '@kubevirt-utils/hooks/useContainerWidth';
import { KUBEVIRT_APISERVER_PROXY } from '@kubevirt-utils/hooks/useFeatures/constants';
import { useFeatures } from '@kubevirt-utils/hooks/useFeatures/useFeatures';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import useKubevirtWatchResource from '@kubevirt-utils/hooks/useKubevirtWatchResource/useKubevirtWatchResource';
import {
  paginationDefaultValues,
  paginationInitialState,
} from '@kubevirt-utils/hooks/usePagination/utils/constants';
import { usePVCMapper } from '@kubevirt-utils/hooks/usePVCMapper';
import useQuery from '@kubevirt-utils/hooks/useQuery';
import { getNamespace } from '@kubevirt-utils/resources/shared';
import { getName } from '@kubevirt-utils/resources/shared';
import useVirtualMachineInstanceMigrationMapper from '@kubevirt-utils/resources/vmim/hooks/useVirtualMachineInstanceMigrationMapper';
import useVirtualMachineInstanceMigrations from '@kubevirt-utils/resources/vmim/hooks/useVirtualMachineInstanceMigrations';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { getCluster } from '@multicluster/helpers/selectors';
import { getCatalogURL } from '@multicluster/urls';
import useIsACMPage from '@multicluster/useIsACMPage';
import {
  DocumentTitle,
  K8sResourceCommon,
  ListPageBody,
  useListPageFilter,
  VirtualizedTable,
} from '@openshift-console/dynamic-plugin-sdk';
import { Flex, PageSection, Pagination } from '@patternfly/react-core';
import { useSignals } from '@preact/signals-react/runtime';
import { useHubClusterName } from '@stolostron/multicluster-sdk';
import { useAccessibleResources } from '@virtualmachines/search/hooks/useAccessibleResources';
import useVMSearchQueries from '@virtualmachines/search/hooks/useVMSearchQueries';
import VirtualMachineFilterToolbar from '@virtualmachines/search/VirtualMachineFilterToolbar';
import { vmsSignal } from '@virtualmachines/tree/utils/signals';
import { OBJECTS_FETCHING_LIMIT, VirtualMachineRowFilterType } from '@virtualmachines/utils';
import { getVMIFromMapper, getVMIMFromMapper } from '@virtualmachines/utils/mappers';

import VirtualMachineBulkActionButton from './components/VirtualMachineBulkActionButton';
import VirtualMachineEmptyState from './components/VirtualMachineEmptyState/VirtualMachineEmptyState';
import VirtualMachineListSummary from './components/VirtualMachineListSummary/VirtualMachineListSummary';
import VirtualMachineRow from './components/VirtualMachineRow/VirtualMachineRow';
import VirtualMachineSearchResultsHeader from './components/VirtualMachineSearchResultsHeader';
import VirtualMachineSelection from './components/VirtualMachineSelection/VirtualMachineSelection';
import useExistingSelectedVMs from './hooks/useExistingSelectedVMs';
import useFiltersFromURL from './hooks/useFiltersFromURL';
import useVirtualMachineColumns from './hooks/useVirtualMachineColumns';
import { useVirtualMachineInstanceMapper } from './hooks/useVirtualMachineInstanceMapper';
import { useVMListFilters } from './hooks/useVMListFilters/useVMListFilters';
import useVMMetrics from './hooks/useVMMetrics';
import { VM_FILTER_OPTIONS } from './utils/constants';
import { filterVMsByClusterAndNamespace } from './utils/utils';
import { getListPageBodySize, ListPageBodySize } from './listPageBodySize';
import { deselectAllVMs } from './selectedVMs';

import '@kubevirt-utils/styles/list-managment-group.scss';
import './VirtualMachinesList.scss';

type VirtualMachinesListProps = {
  allVMsLoaded?: boolean;
  cluster?: string;
  isSearchResultsPage?: boolean;
  kind: string;
  namespace: string;
} & RefAttributes<ExposedFilterFunctions | null>;

const VirtualMachinesList: FC<VirtualMachinesListProps> = forwardRef((props, ref) => {
  const { t } = useKubevirtTranslation();
  const { allVMsLoaded, cluster, isSearchResultsPage = false, kind, namespace } = props;

  const isACMPage = useIsACMPage();
  const [hubClusterName] = useHubClusterName();

  const searchQueries = useVMSearchQueries();

  const catalogURL = getCatalogURL(cluster, namespace || DEFAULT_NAMESPACE);
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
  } = useAccessibleResources<V1VirtualMachine>(
    VirtualMachineModelGroupVersionKind,
    VM_FILTER_OPTIONS,
  );

  const vms = namespace ? namespacedVMs : accessibleVMs;
  const vmsLoaded = namespace ? namespacedVMsLoaded : accessibleVMsLoaded;
  const vmsLoadError = namespace ? loadError : accessibleVMsError;

  const vmsToShow = useMemo(() => (runningTourSignal.value ? [tourGuideVM] : vms), [vms]);

  const [vmims, vmimsLoaded] = useVirtualMachineInstanceMigrations(cluster, namespace);

  const { vmiMapper, vmisLoaded } = useVirtualMachineInstanceMapper();
  const vmimMapper = useVirtualMachineInstanceMigrationMapper(vmims);
  const pvcMapper = usePVCMapper(namespace, cluster);

  const { filtersWithSelect, hiddenFilters } = useVMListFilters(vmiMapper, pvcMapper);

  const filtersFromURL = useFiltersFromURL([...filtersWithSelect, ...hiddenFilters]);

  const [pagination, setPagination] = useState(paginationInitialState);

  const [_, filteredVMs, onFilterChange] = useListPageFilter<V1VirtualMachine, V1VirtualMachine>(
    vmsToShow,
    [...filtersWithSelect, ...hiddenFilters],
    filtersFromURL,
  );

  const filteredVMIs = useMemo(
    () =>
      filteredVMs
        ?.map((vm) => getVMIFromMapper(vmiMapper, vm, isACMPage ? hubClusterName : undefined))
        .filter(Boolean),
    [filteredVMs, vmiMapper],
  );

  useEffect(() => {
    deselectAllVMs();
  }, [namespace, cluster]);

  useEffect(() => {
    deselectAllVMs();
    Object.values(VirtualMachineRowFilterType).forEach((filterType) => {
      onFilterChange?.(filterType, filtersFromURL[filterType]);
    });
  }, [query]);

  // Allow using folder filters from the tree view
  useImperativeHandle(
    ref,
    () => ({
      onFilterChange,
    }),
    [onFilterChange],
  );

  const paginatedVMs = useMemo(
    () => filteredVMs?.slice(pagination.startIndex, pagination.endIndex),
    [filteredVMs, pagination.startIndex, pagination.endIndex],
  );

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

  const [columns, activeColumns, loadedColumns] = useVirtualMachineColumns(
    namespace,
    pagination,
    filteredVMs,
    vmiMapper,
    pvcMapper,
    cluster,
  );

  const loaded = vmsLoaded && vmisLoaded && vmimsLoaded && !loadingFeatureProxy && loadedColumns;

  const existingSelectedVMs = useExistingSelectedVMs(filteredVMs);
  const isAllVMsSelected = filteredVMs?.length === existingSelectedVMs.length;

  const hasNoVMs = useMemo(
    () => isEmpty(filterVMsByClusterAndNamespace(vmsSignal.value, namespace, cluster)),
    [vmsSignal.value, namespace, cluster],
  );

  return (
    /* All of this table and components should be replaced to our own fitted components */
    <>
      <DocumentTitle>{PageTitles.VirtualMachines}</DocumentTitle>
      {!isSearchResultsPage && (
        <PageSection>
          <VirtualMachineListSummary vmis={filteredVMIs} vms={filteredVMs} />
        </PageSection>
      )}
      <ListPageBody>
        <div className="vm-listpagebody" ref={listPageBodyRef}>
          {isSearchResultsPage && <VirtualMachineSearchResultsHeader />}
          {!isSearchResultsPage && allVMsLoaded && hasNoVMs ? (
            <VirtualMachineEmptyState catalogURL={catalogURL} namespace={namespace} />
          ) : (
            <>
              <VirtualMachineFilterToolbar
                onFilterChange={(...args) => {
                  deselectAllVMs();
                  onFilterChange(...args);
                  setPagination((prevPagination) => ({
                    ...prevPagination,
                    endIndex: prevPagination?.perPage,
                    page: 1,
                    startIndex: 0,
                  }));
                }}
                className="list-managment-group__toolbar"
                filtersWithSelect={filtersWithSelect}
                hiddenFilters={hiddenFilters}
                isSearchResultsPage={isSearchResultsPage}
                listPageBodySize={listPageBodySize}
                loaded
              />
              <div className="list-managment-group">
                <VirtualMachineSelection pagination={pagination} vms={filteredVMs} />
                <Flex flexWrap={{ default: 'nowrap' }}>
                  <VirtualMachineBulkActionButton vmimMapper={vmimMapper} vms={filteredVMs} />
                  <ColumnManagement
                    columnLayout={{
                      columns: columns?.map(({ additional, id, title }) => ({
                        additional,
                        id,
                        title,
                      })),
                      id: VirtualMachineModelRef,
                      selectedColumns: new Set(activeColumns?.map((col) => col?.id)),
                      type: t('VirtualMachine'),
                    }}
                  />
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
              <VirtualizedTable<K8sResourceCommon>
                EmptyMsg={() => (
                  <div className="pf-v6-u-text-align-center">{t('No VirtualMachines found')}</div>
                )}
                rowData={{
                  getVmi: (vm: V1VirtualMachine) =>
                    getVMIFromMapper(vmiMapper, vm, isACMPage ? hubClusterName : undefined),
                  getVmim: (vm: V1VirtualMachine) =>
                    getVMIMFromMapper(vmimMapper, getName(vm), getNamespace(vm), getCluster(vm)),
                  kind,
                  pvcMapper,
                }}
                allRowsSelected={isAllVMsSelected}
                columns={activeColumns}
                data={paginatedVMs}
                loaded={loaded}
                loadError={vmsLoadError}
                Row={VirtualMachineRow}
                unfilteredData={vmsToShow}
              />
            </>
          )}
        </div>
      </ListPageBody>
    </>
  );
});

export default VirtualMachinesList;
