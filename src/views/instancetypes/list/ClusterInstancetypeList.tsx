import React, { FC } from 'react';

import useClusterInstanceTypes from '@catalog/CreateFromInstanceTypes/state/hooks/useClusterInstanceTypes';
import { VirtualMachineClusterInstancetypeModelRef } from '@kubevirt-ui/kubevirt-api/console';
import { V1beta1VirtualMachineClusterInstancetype } from '@kubevirt-ui/kubevirt-api/kubevirt';
import ListPageFilter from '@kubevirt-utils/components/ListPageFilter/ListPageFilter';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import usePagination from '@kubevirt-utils/hooks/usePagination/usePagination';
import { paginationDefaultValues } from '@kubevirt-utils/hooks/usePagination/utils/constants';
import {
  ListPageBody,
  useListPageFilter,
  VirtualizedTable,
} from '@openshift-console/dynamic-plugin-sdk';
import { Pagination } from '@patternfly/react-core';

import ClusterInstancetypeRow from './components/ClusterInstancetypeRow';
import useClusterInstancetypeListColumns from './hooks/useClusterInstancetypeListColumns';

import '@kubevirt-utils/styles/list-managment-group.scss';

const ClusterInstancetypeList: FC = () => {
  const { t } = useKubevirtTranslation();
  const [instanceTypes, loaded, loadError] = useClusterInstanceTypes();

  const { onPaginationChange, pagination } = usePagination();
  const [unfilteredData, data, onFilterChange] = useListPageFilter(instanceTypes);
  const [columns, activeColumns, loadedColumns] = useClusterInstancetypeListColumns(
    pagination,
    data,
  );

  return (
    <ListPageBody>
      <div className="list-managment-group">
        <ListPageFilter
          columnLayout={{
            columns: columns?.map(({ additional, id, title }) => ({
              additional,
              id,
              title,
            })),
            id: VirtualMachineClusterInstancetypeModelRef,
            selectedColumns: new Set(activeColumns?.map((col) => col?.id)),
            type: '',
          }}
          onFilterChange={(...args) => {
            onFilterChange(...args);
            onPaginationChange({
              endIndex: pagination?.perPage,
              page: 1,
              perPage: pagination?.perPage,
              startIndex: 0,
            });
          }}
          data={unfilteredData}
          loaded={loaded && loadedColumns}
        />
        <Pagination
          onPerPageSelect={(_e, perPage, page, startIndex, endIndex) =>
            onPaginationChange({ endIndex, page, perPage, startIndex })
          }
          onSetPage={(_e, page, perPage, startIndex, endIndex) =>
            onPaginationChange({ endIndex, page, perPage, startIndex })
          }
          className="list-managment-group__pagination"
          isLastFullPageShown
          itemCount={data?.length}
          page={pagination?.page}
          perPage={pagination?.perPage}
          perPageOptions={paginationDefaultValues}
        />
      </div>
      <VirtualizedTable<V1beta1VirtualMachineClusterInstancetype>
        EmptyMsg={() => (
          <div className="pf-u-text-align-center" id="no-instancetype-msg">
            {t('No VirtualMachineClusterInstanceType found')}
          </div>
        )}
        columns={activeColumns}
        data={data}
        loaded={loaded && loadedColumns}
        loadError={loadError}
        Row={ClusterInstancetypeRow}
        unfilteredData={unfilteredData}
      />
    </ListPageBody>
  );
};

export default ClusterInstancetypeList;
