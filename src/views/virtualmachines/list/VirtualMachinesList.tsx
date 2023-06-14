import React, { FC, useState } from 'react';

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
import { DEFAULT_NAMESPACE } from '@kubevirt-utils/constants/constants';
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
  ListPageFilter,
  ListPageHeader,
  useListPageFilter,
  VirtualizedTable,
} from '@openshift-console/dynamic-plugin-sdk';
import { Pagination } from '@patternfly/react-core';
import { OBJECTS_FETCHING_LIMIT } from '@virtualmachines/utils';

import { useVMListFilters } from '../utils';

import VirtualMachineEmptyState from './components/VirtualMachineEmptyState/VirtualMachineEmptyState';
import VirtualMachineRow from './components/VirtualMachineRow/VirtualMachineRow';
import VirtualMachinesCreateButton from './components/VirtualMachinesCreateButton/VirtualMachinesCreateButton';
import useVirtualMachineColumns from './hooks/useVirtualMachineColumns';

import '@kubevirt-utils/styles/list-managment-group.scss';
import './VirtualMachinesList.scss';

type VirtualMachinesListProps = {
  kind: string;
  namespace: string;
};

const VirtualMachinesList: FC<VirtualMachinesListProps> = ({ kind, namespace }) => {
  const { t } = useKubevirtTranslation();

  const catalogURL = `/k8s/ns/${namespace || DEFAULT_NAMESPACE}/templatescatalog`;

  const [vms, loaded, loadError] = useKubevirtWatchResource<V1VirtualMachine[]>({
    groupVersionKind: VirtualMachineModelGroupVersionKind,
    isList: true,
    limit: OBJECTS_FETCHING_LIMIT,
    namespace,
    namespaced: true,
  });

  const [vmis, vmiLoaded] = useKubevirtWatchResource<V1VirtualMachineInstance[]>({
    groupVersionKind: VirtualMachineInstanceModelGroupVersionKind,
    isList: true,
    limit: OBJECTS_FETCHING_LIMIT,
    namespace,
    namespaced: true,
  });

  const [isSingleNodeCluster, isSingleNodeLoaded] = useSingleNodeCluster();

  const [vmims, vmimsLoaded] = useKubevirtWatchResource<V1VirtualMachineInstanceMigration[]>({
    groupVersionKind: VirtualMachineInstanceMigrationModelGroupVersionKind,
    isList: true,
    limit: OBJECTS_FETCHING_LIMIT,
    namespace,
    namespaced: true,
  });

  const { filters, vmiMapper, vmimMapper } = useVMListFilters(vmis, vms, vmims);

  const [pagination, setPagination] = useState(paginationInitialState);

  const [unfilteredData, data, onFilterChange] = useListPageFilter<
    V1VirtualMachine,
    V1VirtualMachine
  >(vms, filters);

  const onPageChange = ({ endIndex, page, perPage, startIndex }) => {
    setPagination(() => ({
      endIndex,
      page,
      perPage,
      startIndex,
    }));
  };

  const [columns, activeColumns] = useVirtualMachineColumns(namespace, pagination, data);

  return (
    <>
      <ListPageHeader title={t('VirtualMachines')}>
        {!isEmpty(vms) && <VirtualMachinesCreateButton namespace={namespace} />}
      </ListPageHeader>
      <ListPageBody>
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
            loaded={loaded && vmiLoaded && vmimsLoaded && isSingleNodeLoaded}
            rowFilters={filters}
          />
          {!isEmpty(vms) && (
            <Pagination
              onPerPageSelect={(_e, perPage, page, startIndex, endIndex) =>
                onPageChange({ endIndex, page, perPage, startIndex })
              }
              onSetPage={(_e, page, perPage, startIndex, endIndex) =>
                onPageChange({ endIndex, page, perPage, startIndex })
              }
              className="list-managment-group__pagination"
              defaultToFullPage
              itemCount={data?.length}
              page={pagination?.page}
              perPage={pagination?.perPage}
              perPageOptions={paginationDefaultValues}
            />
          )}
        </div>
        <VirtualizedTable<K8sResourceCommon>
          NoDataEmptyMsg={() => (
            <VirtualMachineEmptyState catalogURL={catalogURL} namespace={namespace} />
          )}
          rowData={{
            getVmi: (ns: string, name: string) => vmiMapper?.mapper?.[ns]?.[name],
            getVmim: (ns: string, name: string) => vmimMapper?.[ns]?.[name],
            isSingleNodeCluster,
            kind,
          }}
          columns={activeColumns}
          data={data}
          loaded={loaded && vmiLoaded && vmimsLoaded && isSingleNodeLoaded}
          loadError={loadError}
          Row={VirtualMachineRow}
          unfilteredData={unfilteredData}
        />
      </ListPageBody>
    </>
  );
};

export default VirtualMachinesList;
