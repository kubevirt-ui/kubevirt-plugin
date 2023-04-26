import React, { FC, useState } from 'react';

import {
  VirtualMachineInstanceMigrationModelGroupVersionKind,
  VirtualMachineInstanceModelGroupVersionKind,
  VirtualMachineModelGroupVersionKind,
  VirtualMachineModelRef,
} from '@kubevirt-ui/kubevirt-api/console';
import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { DEFAULT_NAMESPACE } from '@kubevirt-utils/constants/constants';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import useKubevirtWatchResource from '@kubevirt-utils/hooks/useKubevirtWatchResource';
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
import {
  OBJECTS_FETCHING_LIMIT,
  paginationDefaultValues,
  paginationInitialState,
} from '@virtualmachines/utils';

import { useVMListFilters } from '../utils';

import VirtualMachineEmptyState from './components/VirtualMachineEmptyState/VirtualMachineEmptyState';
import VirtualMachineRow from './components/VirtualMachineRow/VirtualMachineRow';
import VirtualMachinesCreateButton from './components/VirtualMachinesCreateButton/VirtualMachinesCreateButton';
import useVirtualMachineColumns from './hooks/useVirtualMachineColumns';

import './VirtualMachinesList.scss';

type VirtualMachinesListProps = {
  kind: string;
  namespace: string;
};

const VirtualMachinesList: FC<VirtualMachinesListProps> = ({ kind, namespace }) => {
  const { t } = useKubevirtTranslation();

  const catalogURL = `/k8s/ns/${namespace || DEFAULT_NAMESPACE}/templatescatalog`;

  const [vms, loaded, loadError] = useKubevirtWatchResource({
    groupVersionKind: VirtualMachineModelGroupVersionKind,
    isList: true,
    namespaced: true,
    namespace,
    limit: OBJECTS_FETCHING_LIMIT,
  });

  const [vmis, vmiLoaded] = useKubevirtWatchResource({
    groupVersionKind: VirtualMachineInstanceModelGroupVersionKind,
    isList: true,
    namespaced: true,
    namespace,
    limit: OBJECTS_FETCHING_LIMIT,
  });

  const [isSingleNodeCluster, isSingleNodeLoaded] = useSingleNodeCluster();

  const [vmims, vmimsLoaded] = useKubevirtWatchResource({
    groupVersionKind: VirtualMachineInstanceMigrationModelGroupVersionKind,
    isList: true,
    namespaced: true,
    namespace,
    limit: OBJECTS_FETCHING_LIMIT,
  });

  const { vmiMapper, vmimMapper, filters } = useVMListFilters(vmis, vms, vmims);

  const [pagination, setPagination] = useState(paginationInitialState);

  const [unfilteredData, data, onFilterChange] = useListPageFilter<
    V1VirtualMachine,
    V1VirtualMachine
  >(vms, filters);

  const onPageChange = ({ page, perPage, startIndex, endIndex }) => {
    setPagination(() => ({
      page,
      perPage,
      startIndex,
      endIndex,
    }));
  };

  const [columns, activeColumns] = useVirtualMachineColumns(namespace, pagination, data);

  return (
    <>
      <ListPageHeader title={t('VirtualMachines')}>
        {!isEmpty(vms) && <VirtualMachinesCreateButton namespace={namespace} />}
      </ListPageHeader>
      <ListPageBody>
        <div className="VirtualMachineList--filters__main">
          <ListPageFilter
            data={unfilteredData}
            loaded={loaded && vmiLoaded && vmimsLoaded && isSingleNodeLoaded}
            rowFilters={filters}
            onFilterChange={(...args) => {
              onFilterChange(...args);
              setPagination((prevPagination) => ({
                ...prevPagination,
                page: 1,
                startIndex: 0,
                endIndex: prevPagination?.perPage,
              }));
            }}
            columnLayout={{
              columns: columns?.map(({ id, title, additional }) => ({
                id,
                title,
                additional,
              })),
              id: VirtualMachineModelRef,
              selectedColumns: new Set(activeColumns?.map((col) => col?.id)),
              type: t('VirtualMachine'),
            }}
          />
          {!isEmpty(vms) && (
            <Pagination
              className="VirtualMachineList--filters__main-pagination"
              itemCount={data?.length}
              page={pagination?.page}
              perPage={pagination?.perPage}
              defaultToFullPage
              onSetPage={(_e, page, perPage, startIndex, endIndex) =>
                onPageChange({ page, perPage, startIndex, endIndex })
              }
              onPerPageSelect={(_e, perPage, page, startIndex, endIndex) =>
                onPageChange({ page, perPage, startIndex, endIndex })
              }
              perPageOptions={paginationDefaultValues}
            />
          )}
        </div>
        <VirtualizedTable<K8sResourceCommon>
          data={data}
          unfilteredData={unfilteredData}
          loaded={loaded && vmiLoaded && vmimsLoaded && isSingleNodeLoaded}
          columns={activeColumns}
          loadError={loadError}
          Row={VirtualMachineRow}
          rowData={{
            kind,
            getVmi: (ns: string, name: string) => vmiMapper?.mapper?.[ns]?.[name],
            getVmim: (ns: string, name: string) => vmimMapper?.[ns]?.[name],
            isSingleNodeCluster,
          }}
          NoDataEmptyMsg={() => (
            <VirtualMachineEmptyState catalogURL={catalogURL} namespace={namespace} />
          )}
        />
      </ListPageBody>
    </>
  );
};

export default VirtualMachinesList;
