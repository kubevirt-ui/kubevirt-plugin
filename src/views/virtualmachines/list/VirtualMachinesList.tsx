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
import { useParams } from 'react-router-dom-v5-compat';
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
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import useKubevirtWatchResource from '@kubevirt-utils/hooks/useKubevirtWatchResource';
import {
  paginationDefaultValues,
  paginationInitialState,
} from '@kubevirt-utils/hooks/usePagination/utils/constants';
import useQuery from '@kubevirt-utils/hooks/useQuery';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import {
  DocumentTitle,
  K8sResourceCommon,
  ListPageBody,
  useListPageFilter,
  VirtualizedTable,
} from '@openshift-console/dynamic-plugin-sdk';
import { Flex, Pagination } from '@patternfly/react-core';
import { useSignals } from '@preact/signals-react/runtime';
import { useFleetK8sWatchResource } from '@stolostron/multicluster-sdk';
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
import useSelectedFilters from './hooks/useSelectedFilters';
import useVirtualMachineColumns from './hooks/useVirtualMachineColumns';
import { useVMListFilters } from './hooks/useVMListFilters/useVMListFilters';
import useVMMetrics from './hooks/useVMMetrics';
import { getListManagementGroupSize, ListManagementGroupSize } from './listManagementGroupSize';

import '@kubevirt-utils/styles/list-managment-group.scss';
import './VirtualMachinesList.scss';

type VirtualMachinesListProps = {
  isSearchResultsPage?: boolean;
  kind: string;
  namespace: string;
} & RefAttributes<ExposedFilterFunctions | null>;

const VirtualMachinesList: FC<VirtualMachinesListProps> = forwardRef((props, ref) => {
  const { t } = useKubevirtTranslation();
  const { isSearchResultsPage = false, kind, namespace } = props;
  const catalogURL = `/k8s/ns/${namespace || DEFAULT_NAMESPACE}/catalog`;
  const { featureEnabled, loading: loadingFeatureProxy } = useFeatures(KUBEVIRT_APISERVER_PROXY);
  const isProxyPodAlive = false;

  const listPageFilterRef = useRef<{ resetTextSearch: ResetTextSearch } | null>(null);

  const params = useParams<{ cluster: string }>();

  useSignals();
  useVMMetrics();

  const query = useQuery();

  const [vms, vmsLoaded, loadError] = useKubevirtWatchResource<V1VirtualMachine[]>(
    {
      cluster: params.cluster,
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
      cluster: params.cluster,
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

  const [pvcs] = useFleetK8sWatchResource<IoK8sApiCoreV1PersistentVolumeClaim[]>({
    cluster: params.cluster,
    groupVersionKind: modelToGroupVersionKind(PersistentVolumeClaimModel),
    isList: true,
    limit: OBJECTS_FETCHING_LIMIT,
    namespace,
    namespaced: true,
  });

  const pvcMapper = useMemo(() => convertIntoPVCMapper(pvcs), [pvcs]);

  const [vmims, vmimsLoaded] = useFleetK8sWatchResource<V1VirtualMachineInstanceMigration[]>({
    cluster: params.cluster,
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  const selectedFilters = useSelectedFilters(filters, searchFilters);

  const [data, paginatedVMs] = useMemo(() => {
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

  const listManagementGroupRef = useRef<HTMLDivElement>(null);
  const listManagementGroupSize = getListManagementGroupSize(
    useContainerWidth(listManagementGroupRef),
  );

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
    data,
    vmiMapper,
    pvcMapper,
  );

  const loaded = vmsLoaded && vmisLoaded && vmimsLoaded && !loadingFeatureProxy && loadedColumns;

  const vmsFilteredWithProxy = isProxyPodAlive && selectedFilters.length > 0;

  const noVMs = isEmpty(vmsToShow) && !vmsFilteredWithProxy;

  const existingSelectedVMs = useExistingSelectedVMs(data);
  const allVMsSelected = data?.length === existingSelectedVMs.length;

  const vmSummary = (
    <VirtualMachineListSummary
      namespace={namespace}
      onFilterChange={onFilterChange}
      vmis={vmis}
      vms={vmsToShow}
    />
  );

  if (loaded && noVMs) {
    return (
      <>
        {!isSearchResultsPage && vmSummary}
        <VirtualMachineEmptyState catalogURL={catalogURL} namespace={namespace} />
      </>
    );
  }

  return (
    /* All of this table and components should be replaced to our own fitted components */
    <>
      <DocumentTitle>{PageTitles.VirtualMachines}</DocumentTitle>
      {!isSearchResultsPage && vmSummary}
      <ListPageBody>
        <div className="vm-listpagebody">
          {isSearchResultsPage && <VirtualMachineSearchResultsHeader />}
          <ListPageFilter
            className={classNames('list-managment-group__toolbar', {
              'is-compact': listManagementGroupSize === ListManagementGroupSize.sm,
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
            data={vmsToShow}
            listManagementGroupSize={listManagementGroupSize}
            loaded={loaded}
            projectFilter={projectFilter}
            refProp={listPageFilterRef}
            rowFilters={filters}
            searchFilters={searchFilters}
          />
          <div className="list-managment-group" ref={listManagementGroupRef}>
            <VirtualMachineSelection loaded={loaded} pagination={pagination} vms={data} />
            <Flex flexWrap={{ default: 'nowrap' }}>
              <div className="vm-actions-toggle">
                <VirtualMachineBulkActionButton vms={data} />
              </div>
              <Pagination
                onPerPageSelect={(_e, perPage, page, startIndex, endIndex) =>
                  onPageChange({ endIndex, page, perPage, startIndex })
                }
                onSetPage={(_e, page, perPage, startIndex, endIndex) =>
                  onPageChange({ endIndex, page, perPage, startIndex })
                }
                className="list-managment-group__pagination"
                isCompact={listManagementGroupSize !== ListManagementGroupSize.lg}
                isLastFullPageShown
                itemCount={data?.length}
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
            allRowsSelected={allVMsSelected}
            columns={activeColumns}
            data={paginatedVMs}
            loaded={loaded}
            loadError={loadError}
            Row={VirtualMachineRow}
            unfilteredData={vmsToShow}
          />
        </div>
      </ListPageBody>
    </>
  );
});

export default VirtualMachinesList;
