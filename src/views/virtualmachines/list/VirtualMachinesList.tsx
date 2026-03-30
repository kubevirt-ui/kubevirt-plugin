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
import { ExposedFilterFunctions } from '@kubevirt-utils/components/ListPageFilter/types';
import { DEFAULT_NAMESPACE } from '@kubevirt-utils/constants/constants';
import { PageTitles } from '@kubevirt-utils/constants/page-constants';
import useContainerWidth from '@kubevirt-utils/hooks/useContainerWidth';
import { KUBEVIRT_APISERVER_PROXY } from '@kubevirt-utils/hooks/useFeatures/constants';
import { useFeatures } from '@kubevirt-utils/hooks/useFeatures/useFeatures';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import useKubevirtUserSettingsTableColumns from '@kubevirt-utils/hooks/useKubevirtUserSettings/useKubevirtUserSettingsTableColumns';
import useKubevirtWatchResource from '@kubevirt-utils/hooks/useKubevirtWatchResource/useKubevirtWatchResource';
import {
  paginationDefaultValues,
  paginationInitialState,
} from '@kubevirt-utils/hooks/usePagination/utils/constants';
import { usePVCMapper } from '@kubevirt-utils/hooks/usePVCMapper';
import useQuery from '@kubevirt-utils/hooks/useQuery';
import { getName, getNamespace } from '@kubevirt-utils/resources/shared';
import useVirtualMachineInstanceMigrationMapper from '@kubevirt-utils/resources/vmim/hooks/useVirtualMachineInstanceMigrationMapper';
import useVirtualMachineInstanceMigrations from '@kubevirt-utils/resources/vmim/hooks/useVirtualMachineInstanceMigrations';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { getCluster } from '@multicluster/helpers/selectors';
import useIsAllClustersPage from '@multicluster/hooks/useIsAllClustersPage';
import { getCatalogURL } from '@multicluster/urls';
import {
  DocumentTitle,
  K8sVerb,
  ListPageBody,
  useListPageFilter,
} from '@openshift-console/dynamic-plugin-sdk';
import { Flex, Pagination } from '@patternfly/react-core';
import { useSignals } from '@preact/signals-react/runtime';
import SearchBar from '@search/components/SearchBar';
import { useFleetAccessReview } from '@stolostron/multicluster-sdk';
import { useAccessibleResources } from '@virtualmachines/search/hooks/useAccessibleResources';
import useVMSearchQueries from '@virtualmachines/search/hooks/useVMSearchQueries';
import VirtualMachineFilterToolbar from '@virtualmachines/search/VirtualMachineFilterToolbar';
import { vmsSignal } from '@virtualmachines/tree/utils/signals';
import { OBJECTS_FETCHING_LIMIT, VirtualMachineRowFilterType } from '@virtualmachines/utils';
import { getVMIFromMapper, getVMIMFromMapper } from '@virtualmachines/utils/mappers';

import VirtualMachineBulkActionButton from './components/VirtualMachineBulkActionButton';
import VirtualMachineEmptyState from './components/VirtualMachineEmptyState/VirtualMachineEmptyState';
import VirtualMachineSearchResultsHeader from './components/VirtualMachineSearchResultsHeader';
import VirtualMachineSelection from './components/VirtualMachineSelection/VirtualMachineSelection';
import useFiltersFromURL from './hooks/useFiltersFromURL';
import { useVirtualMachineInstanceMapper } from './hooks/useVirtualMachineInstanceMapper';
import { useVMListFilters } from './hooks/useVMListFilters/useVMListFilters';
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
  kind: string;
  namespace: string;
} & RefAttributes<ExposedFilterFunctions | null>;

const VirtualMachinesList: FC<VirtualMachinesListProps> = forwardRef((props, ref) => {
  const { t } = useKubevirtTranslation();
  const { allVMsLoaded, cluster, isSearchResultsPage = false, namespace } = props;

  const isAllClustersPage = useIsAllClustersPage();

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
  const vmis = useMemo(
    () => vmsToShow?.map((vm) => getVMIFromMapper(vmiMapper, vm)).filter(Boolean),
    [vmiMapper, vmsToShow],
  );

  const vmimMapper = useVirtualMachineInstanceMigrationMapper(vmims);
  const pvcMapper = usePVCMapper(namespace, cluster);

  const { filtersWithSelect, hiddenFilters } = useVMListFilters(vmiMapper, pvcMapper);

  const filtersFromURL = useFiltersFromURL([...filtersWithSelect, ...hiddenFilters]);

  const [pagination, setPagination] = useState(paginationInitialState);

  const [, filteredVMs, onFilterChange] = useListPageFilter<V1VirtualMachine, V1VirtualMachine>(
    vmsToShow,
    [...filtersWithSelect, ...hiddenFilters],
    filtersFromURL,
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

  useImperativeHandle(
    ref,
    () => ({
      onFilterChange,
    }),
    [onFilterChange],
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

  return (
    <>
      <DocumentTitle>{PageTitles.VirtualMachines}</DocumentTitle>
      <ListPageBody>
        <div className="vm-listpagebody" ref={listPageBodyRef}>
          {isSearchResultsPage && <VirtualMachineSearchResultsHeader />}
          {!isSearchResultsPage && allVMsLoaded && hasNoVMs ? (
            <VirtualMachineEmptyState catalogURL={catalogURL} namespace={namespace} />
          ) : (
            <>
              <SearchBar
                onFilterChange={onFilterChange}
                vmis={vmis}
                vmisLoaded={vmisLoaded}
                vms={vmsToShow}
                vmsLoaded={vmsLoaded}
              />
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
                  <ColumnManagement columnLayout={columnLayout} />
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
});

export default VirtualMachinesList;
