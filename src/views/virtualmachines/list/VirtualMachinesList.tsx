import React, { FC, useMemo, useState } from 'react';

import {
  VirtualMachineInstanceMigrationModelGroupVersionKind,
  VirtualMachineInstanceModelGroupVersionKind,
  VirtualMachineModelGroupVersionKind,
  VirtualMachineModelRef,
} from '@kubevirt-ui/kubevirt-api/console';
import {
  V1VirtualMachine,
  V1VirtualMachineInstance,
  V1VirtualMachineInstanceMigration,
} from '@kubevirt-ui/kubevirt-api/kubevirt';
import ListPageFilter from '@kubevirt-utils/components/ListPageFilter/ListPageFilter';
import { DEFAULT_NAMESPACE } from '@kubevirt-utils/constants/constants';
import { KUBEVIRT_APISERVER_PROXY } from '@kubevirt-utils/hooks/useFeatures/constants';
import { useFeatures } from '@kubevirt-utils/hooks/useFeatures/useFeatures';
import useKubevirtDataPodHealth from '@kubevirt-utils/hooks/useKubevirtDataPod/hooks/useKubevirtDataPodHealth';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import useKubevirtWatchResource from '@kubevirt-utils/hooks/useKubevirtWatchResource';
import {
  paginationDefaultValues,
  paginationInitialState,
} from '@kubevirt-utils/hooks/usePagination/utils/constants';
import useSingleNodeCluster from '@kubevirt-utils/hooks/useSingleNodeCluster';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import {
  K8sResourceCommon,
  ListPageBody,
  ListPageHeader,
  useListPageFilter,
  VirtualizedTable,
} from '@openshift-console/dynamic-plugin-sdk';
import { Flex, FlexItem, Pagination } from '@patternfly/react-core';
import { useSignals } from '@preact/signals-react/runtime';
import useQuery from '@virtualmachines/details/tabs/metrics/NetworkCharts/hook/useQuery';
import VirtualMachineTreeView from '@virtualmachines/tree/VirtualMachineTreeView';
import { OBJECTS_FETCHING_LIMIT } from '@virtualmachines/utils';

import { useVMListFilters } from '../utils';

import VirtualMachineActionButton from './components/VirtualMachineActionButton';
import VirtualMachineEmptyState from './components/VirtualMachineEmptyState/VirtualMachineEmptyState';
import VirtualMachineRow from './components/VirtualMachineRow/VirtualMachineRow';
import VirtualMachinesCreateButton from './components/VirtualMachinesCreateButton/VirtualMachinesCreateButton';
import useSelectedFilters from './hooks/useSelectedFilters';
import useVirtualMachineColumns from './hooks/useVirtualMachineColumns';
import { deselectAll, selectAll, selectedVMs } from './selectedVMs';

import '@kubevirt-utils/styles/list-managment-group.scss';
import './VirtualMachinesList.scss';

type VirtualMachinesListProps = {
  kind: string;
  namespace: string;
};

const VirtualMachinesList: FC<VirtualMachinesListProps> = ({ kind, namespace }) => {
  const { t } = useKubevirtTranslation();
  const catalogURL = `/k8s/ns/${namespace || DEFAULT_NAMESPACE}/catalog`;
  const { featureEnabled, loading: loadingFeatureProxy } = useFeatures(KUBEVIRT_APISERVER_PROXY);
  const isProxyPodAlive = useKubevirtDataPodHealth();

  useSignals();

  const query = useQuery();

  const [vms, vmLoaded, loadError] = useKubevirtWatchResource<V1VirtualMachine[]>(
    {
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

  const [vmis, vmiLoaded] = useKubevirtWatchResource<V1VirtualMachineInstance[]>(
    {
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

  const [isSingleNodeCluster, isSingleNodeLoaded] = useSingleNodeCluster();

  const [vmims, vmimsLoaded] = useKubevirtWatchResource<V1VirtualMachineInstanceMigration[]>({
    groupVersionKind: VirtualMachineInstanceMigrationModelGroupVersionKind,
    isList: true,
    limit: OBJECTS_FETCHING_LIMIT,
    namespace,
    namespaced: true,
  });

  const { filters, searchFilters, vmiMapper, vmimMapper } = useVMListFilters(vmis, vms, vmims);

  const [pagination, setPagination] = useState(paginationInitialState);

  const [unfilterData, dataFilters, onFilterChange] = useListPageFilter<
    V1VirtualMachine,
    V1VirtualMachine
  >(vms, [...filters, ...searchFilters]);

  const selectedFilters = useSelectedFilters(filters, searchFilters);

  const [unfilteredData, data] = useMemo(() => {
    if (!featureEnabled || isProxyPodAlive === false) return [unfilterData, dataFilters];

    const matchedVMS = vms?.filter(
      ({ metadata: { name, namespace: ns }, status: { printableStatus = '' } = {} }) => {
        return (
          vmiMapper?.mapper?.[ns]?.[name] ||
          (!query.has('rowFilter-node') && !query.has('ip') && printableStatus !== 'Running')
        );
      },
    );
    return [matchedVMS, matchedVMS];
  }, [featureEnabled, isProxyPodAlive, unfilterData, dataFilters, vms, vmiMapper?.mapper, query]);

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
  );

  const loaded =
    vmLoaded &&
    vmiLoaded &&
    vmimsLoaded &&
    isSingleNodeLoaded &&
    !loadingFeatureProxy &&
    loadedColumns;

  const vmsFilteredWithProxy = isProxyPodAlive && selectedFilters.length > 0;

  const noVMs = isEmpty(unfilteredData) && !vmsFilteredWithProxy;

  const allVMsSelected = data?.length === selectedVMs.value.length;

  if (loaded && noVMs) {
    return (
      <VirtualMachineTreeView>
        <VirtualMachineEmptyState catalogURL={catalogURL} namespace={namespace} />
      </VirtualMachineTreeView>
    );
  }

  return (
    /* All of this table and components should be replaced to our own fitted components */
    <VirtualMachineTreeView onFilterChange={onFilterChange}>
      <ListPageHeader title={t('VirtualMachines')}>
        <Flex>
          <FlexItem>
            <VirtualMachineActionButton />
          </FlexItem>
          <FlexItem>
            <VirtualMachinesCreateButton namespace={namespace} />
          </FlexItem>
        </Flex>
      </ListPageHeader>
      <ListPageBody>
        <div className="vm-listpagebody">
          <div className="list-managment-group">
            <ListPageFilter
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
              data={unfilteredData}
              loaded={loaded}
              rowFilters={filters}
              searchFilters={searchFilters}
            />
            {!isEmpty(dataFilters) && (
              <Pagination
                onPerPageSelect={(_e, perPage, page, startIndex, endIndex) =>
                  onPageChange({ endIndex, page, perPage, startIndex })
                }
                onSetPage={(_e, page, perPage, startIndex, endIndex) =>
                  onPageChange({ endIndex, page, perPage, startIndex })
                }
                className="list-managment-group__pagination"
                isLastFullPageShown
                itemCount={data?.length}
                page={pagination?.page}
                perPage={pagination?.perPage}
                perPageOptions={paginationDefaultValues}
              />
            )}
          </div>
          <VirtualizedTable<K8sResourceCommon>
            EmptyMsg={() => (
              <div className="pf-u-text-align-center">{t('No VirtualMachines found')}</div>
            )}
            onSelect={(_, selected, index) => {
              if (index === -1) allVMsSelected ? deselectAll() : selectAll(data);
            }}
            rowData={{
              getVmi: (ns: string, name: string) => vmiMapper?.mapper?.[ns]?.[name],
              getVmim: (ns: string, name: string) => vmimMapper?.[ns]?.[name],
              isSingleNodeCluster,
              kind,
            }}
            allRowsSelected={allVMsSelected}
            columns={activeColumns}
            data={data}
            loaded={loaded}
            loadError={loadError}
            Row={VirtualMachineRow}
            unfilteredData={unfilteredData}
          />
        </div>
      </ListPageBody>
    </VirtualMachineTreeView>
  );
};

export default VirtualMachinesList;
