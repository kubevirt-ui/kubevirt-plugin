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
import classNames from 'classnames';

import {
  modelToGroupVersionKind,
  PersistentVolumeClaimModel,
  VirtualMachineInstanceMigrationModelGroupVersionKind,
  VirtualMachineInstanceModelGroupVersionKind,
  VirtualMachineModelGroupVersionKind,
  VirtualMachineModelRef,
} from '@kubevirt-ui/kubevirt-api/console';
import { IoK8sApiCoreV1PersistentVolumeClaim } from '@kubevirt-ui/kubevirt-api/kubernetes';
import {
  V1VirtualMachine,
  V1VirtualMachineInstance,
  V1VirtualMachineInstanceMigration,
} from '@kubevirt-ui/kubevirt-api/kubevirt';
import {
  runningTourSignal,
  tourGuideVM,
} from '@kubevirt-utils/components/GuidedTour/utils/constants';
import ListPageFilter from '@kubevirt-utils/components/ListPageFilter/ListPageFilter';
import {
  ExposedFilterFunctions,
  ResetTextSearch,
} from '@kubevirt-utils/components/ListPageFilter/types';
import { DEFAULT_NAMESPACE } from '@kubevirt-utils/constants/constants';
import { PageTitles } from '@kubevirt-utils/constants/page-constants';
import useContainerWidth from '@kubevirt-utils/hooks/useContainerWidth';
import { KUBEVIRT_APISERVER_PROXY } from '@kubevirt-utils/hooks/useFeatures/constants';
import { useFeatures } from '@kubevirt-utils/hooks/useFeatures/useFeatures';
import useKubevirtDataPodHealth from '@kubevirt-utils/hooks/useKubevirtDataPod/hooks/useKubevirtDataPodHealth';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import useKubevirtWatchResource from '@kubevirt-utils/hooks/useKubevirtWatchResource/useKubevirtWatchResource';
import {
  paginationDefaultValues,
  paginationInitialState,
} from '@kubevirt-utils/hooks/usePagination/utils/constants';
import useQuery from '@kubevirt-utils/hooks/useQuery';
import { getNamespace } from '@kubevirt-utils/resources/shared';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import useK8sWatchData from '@multicluster/hooks/useK8sWatchData';
import {
  DocumentTitle,
  K8sResourceCommon,
  ListPageBody,
  useListPageFilter,
  VirtualizedTable,
} from '@openshift-console/dynamic-plugin-sdk';
import { Flex, Pagination } from '@patternfly/react-core';
import { useSignals } from '@preact/signals-react/runtime';
import { vmsSignal } from '@virtualmachines/tree/utils/signals';
import { OBJECTS_FETCHING_LIMIT } from '@virtualmachines/utils';
import { convertIntoPVCMapper } from '@virtualmachines/utils/mappers';

import VirtualMachineBulkActionButton from './components/VirtualMachineBulkActionButton';
import VirtualMachineEmptyState from './components/VirtualMachineEmptyState/VirtualMachineEmptyState';
import VirtualMachineListSummary from './components/VirtualMachineListSummary/VirtualMachineListSummary';
import VirtualMachineRow from './components/VirtualMachineRow/VirtualMachineRow';
import VirtualMachineSearchResultsHeader from './components/VirtualMachineSearchResultsHeader';
import VirtualMachineSelection from './components/VirtualMachineSelection/VirtualMachineSelection';
import { TEXT_FILTER_LABELS_ID } from './hooks/constants';
import useExistingSelectedVMs from './hooks/useExistingSelectedVMs';
import useFiltersFromURL from './hooks/useFiltersFromURL';
import useVirtualMachineColumns from './hooks/useVirtualMachineColumns';
import { useVMListFilters } from './hooks/useVMListFilters/useVMListFilters';
import useVMMetrics from './hooks/useVMMetrics';
import { getListPageBodySize, ListPageBodySize } from './listPageBodySize';

import '@kubevirt-utils/styles/list-managment-group.scss';
import './VirtualMachinesList.scss';

type VirtualMachinesListProps = {
  cluster?: string;
  isSearchResultsPage?: boolean;
  kind: string;
  namespace: string;
} & RefAttributes<ExposedFilterFunctions | null>;

const VirtualMachinesList: FC<VirtualMachinesListProps> = forwardRef((props, ref) => {
  const { t } = useKubevirtTranslation();
  const { isSearchResultsPage = false, kind, namespace } = props;
  const catalogURL = `/k8s/ns/${namespace || DEFAULT_NAMESPACE}/catalog`;
  const { featureEnabled, loading: loadingFeatureProxy } = useFeatures(KUBEVIRT_APISERVER_PROXY);
  const isProxyPodAlive = useKubevirtDataPodHealth();

  const listPageFilterRef = useRef<{ resetTextSearch: ResetTextSearch } | null>(null);

  useSignals();
  useVMMetrics();

  const query = useQuery();

  const [vms, vmsLoaded, loadError] = useKubevirtWatchResource<V1VirtualMachine[]>(
    {
      cluster: props.cluster,
      groupVersionKind: VirtualMachineModelGroupVersionKind,
      isList: true,
      limit: OBJECTS_FETCHING_LIMIT,
      namespace,
      namespaced: true,
    },
    {
      labels: 'metadata.labels',
      name: 'metadata.name',
      'rowFilter-instanceType': 'spec.instancetype.name',
      'rowFilter-live-migratable': 'status.conditions',
      'rowFilter-os': 'spec.template.metadata.annotations.vm\\.kubevirt\\.io/os',
      'rowFilter-status': 'status.printableStatus',
      'rowFilter-template': 'metadata.labels.vm\\.kubevirt\\.io/template',
    },
  );

  const vmsToShow = useMemo(() => (runningTourSignal.value ? [tourGuideVM] : vms), [vms]);

  const [vmis, vmisLoaded] = useKubevirtWatchResource<V1VirtualMachineInstance[]>(
    {
      cluster: props.cluster,
      groupVersionKind: VirtualMachineInstanceModelGroupVersionKind,
      isList: true,
      limit: OBJECTS_FETCHING_LIMIT,
      namespace,
      namespaced: true,
    },
    {
      ip: 'status.interfaces',
      'rowFilter-node': 'status.nodeName',
    },
  );

  const [pvcs] = useK8sWatchData<IoK8sApiCoreV1PersistentVolumeClaim[]>({
    cluster: props.cluster,
    groupVersionKind: modelToGroupVersionKind(PersistentVolumeClaimModel),
    isList: true,
    limit: OBJECTS_FETCHING_LIMIT,
    namespace,
    namespaced: true,
  });

  const pvcMapper = useMemo(() => convertIntoPVCMapper(pvcs), [pvcs]);

  const [vmims, vmimsLoaded] = useK8sWatchData<V1VirtualMachineInstanceMigration[]>({
    cluster: props.cluster,
    groupVersionKind: VirtualMachineInstanceMigrationModelGroupVersionKind,
    isList: true,
    limit: OBJECTS_FETCHING_LIMIT,
    namespace,
    namespaced: true,
  });

  const { advancedFilters, filters, projectFilter, searchFilters, vmiMapper, vmimMapper } =
    useVMListFilters(vmis, vmsToShow, vmims, pvcMapper);

  const filtersFromURL = useFiltersFromURL(filters, [
    ...advancedFilters,
    ...searchFilters,
    projectFilter,
  ]);

  const [pagination, setPagination] = useState(paginationInitialState);

  const [_, filteredData, onFilterChange] = useListPageFilter<V1VirtualMachine, V1VirtualMachine>(
    vmsToShow,
    [...filters, ...advancedFilters, ...searchFilters, projectFilter],
    filtersFromURL,
  );

  // Used for removing folder filter
  // only passing filtersFromURL to useListPageFilter hook's staticFilters doesn't work, because label filter is hardcoded in the hook as a dynamic filter
  useEffect(() => {
    onFilterChange?.(TEXT_FILTER_LABELS_ID, filtersFromURL[TEXT_FILTER_LABELS_ID]);
  }, [query]);

  // Allow using folder filters from the tree view
  useImperativeHandle(
    ref,
    () => ({
      onFilterChange,
      resetTextSearch: (newTextFilters) => {
        listPageFilterRef.current?.resetTextSearch(newTextFilters);
      },
    }),
    [onFilterChange],
  );

  const [filteredVMs, paginatedVMs] = useMemo(() => {
    if (!featureEnabled || isProxyPodAlive === false) {
      return [filteredData, filteredData?.slice(pagination.startIndex, pagination.endIndex)];
    }

    const matchedVMs = filteredData?.filter(
      ({ metadata: { name, namespace: ns }, status: { printableStatus = '' } = {} }) => {
        return (
          vmiMapper?.mapper?.[ns]?.[name] ||
          (!query.has('rowFilter-node') && !query.has('ip') && printableStatus !== 'Running')
        );
      },
    );

    return [matchedVMs, matchedVMs?.slice(pagination.startIndex, pagination.endIndex)];
  }, [
    featureEnabled,
    isProxyPodAlive,
    filteredData,
    pagination.startIndex,
    pagination.endIndex,
    vmiMapper?.mapper,
    query,
  ]);

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
  );

  const loaded = vmsLoaded && vmisLoaded && vmimsLoaded && !loadingFeatureProxy && loadedColumns;

  const existingSelectedVMs = useExistingSelectedVMs(filteredVMs);
  const isAllVMsSelected = filteredVMs?.length === existingSelectedVMs.length;

  const allVMs = vmsSignal?.value;

  const hasNoVMs = isEmpty(
    namespace ? allVMs?.filter((resource) => getNamespace(resource) === namespace) : allVMs,
  );

  return (
    /* All of this table and components should be replaced to our own fitted components */
    <>
      <DocumentTitle>{PageTitles.VirtualMachines}</DocumentTitle>
      {!isSearchResultsPage && (
        <VirtualMachineListSummary
          namespace={namespace}
          onFilterChange={onFilterChange}
          vmis={vmis}
          vms={allVMs}
        />
      )}
      <ListPageBody>
        <div className="vm-listpagebody" ref={listPageBodyRef}>
          {isSearchResultsPage && <VirtualMachineSearchResultsHeader />}
          {loaded && hasNoVMs ? (
            <VirtualMachineEmptyState catalogURL={catalogURL} namespace={namespace} />
          ) : (
            <>
              <ListPageFilter
                className={classNames('list-managment-group__toolbar', {
                  'is-compact': listPageBodySize === ListPageBodySize.sm,
                })}
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
                onFilterChange={(...args) => {
                  onFilterChange(...args);
                  setPagination((prevPagination) => ({
                    ...prevPagination,
                    endIndex: prevPagination?.perPage,
                    page: 1,
                    startIndex: 0,
                  }));
                }}
                advancedFilters={advancedFilters}
                data={allVMs}
                listPageBodySize={listPageBodySize}
                loaded
                projectFilter={projectFilter}
                refProp={listPageFilterRef}
                rowFilters={filters}
                searchFilters={searchFilters}
              />
              <div className="list-managment-group">
                <VirtualMachineSelection pagination={pagination} vms={filteredVMs} />
                <Flex flexWrap={{ default: 'nowrap' }}>
                  <VirtualMachineBulkActionButton vms={filteredVMs} />
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
                  getVmi: (ns: string, name: string) => vmiMapper?.mapper?.[ns]?.[name],
                  getVmim: (ns: string, name: string) => vmimMapper?.[ns]?.[name],
                  kind,
                  pvcMapper,
                }}
                allRowsSelected={isAllVMsSelected}
                columns={activeColumns}
                data={paginatedVMs}
                loaded
                loadError={loadError}
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
