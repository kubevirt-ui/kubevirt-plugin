import React, { FC } from 'react';

import {
  VirtualMachineInstancetypeModelGroupVersionKind,
  VirtualMachineInstancetypeModelRef,
} from '@kubevirt-ui/kubevirt-api/console';
import { V1beta1VirtualMachineInstancetype } from '@kubevirt-ui/kubevirt-api/kubevirt';
import ListPageFilter from '@kubevirt-utils/components/ListPageFilter/ListPageFilter';
import { ALL_NAMESPACES_SESSION_KEY } from '@kubevirt-utils/hooks/constants';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import usePagination from '@kubevirt-utils/hooks/usePagination/usePagination';
import { paginationDefaultValues } from '@kubevirt-utils/hooks/usePagination/utils/constants';
import {
  ListPageBody,
  useActiveNamespace,
  useK8sWatchResource,
  useListPageFilter,
  VirtualizedTable,
} from '@openshift-console/dynamic-plugin-sdk';
import { Pagination } from '@patternfly/react-core';

import UserInstancetypeRow from './components/UserInstancetypeRow';
import useUserInstancetypeListColumns from './hooks/useUserInstancetypeListColumns';

import '@kubevirt-utils/styles/list-managment-group.scss';

const UserInstancetypeList: FC = () => {
  const { t } = useKubevirtTranslation();
  const [activeNamespace] = useActiveNamespace();
  const [instanceTypes, loaded, loadError] = useK8sWatchResource<
    V1beta1VirtualMachineInstancetype[]
  >({
    groupVersionKind: VirtualMachineInstancetypeModelGroupVersionKind,
    isList: true,
    ...(activeNamespace !== ALL_NAMESPACES_SESSION_KEY && { namespace: activeNamespace }),
  });
  const { onPaginationChange, pagination } = usePagination();
  const [unfilteredData, data, onFilterChange] = useListPageFilter<
    V1beta1VirtualMachineInstancetype,
    V1beta1VirtualMachineInstancetype
  >(instanceTypes);
  const [columns, activeColumns, loadedColumns] = useUserInstancetypeListColumns(pagination, data);

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
            id: VirtualMachineInstancetypeModelRef,
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
          defaultToFullPage
          itemCount={data?.length}
          page={pagination?.page}
          perPage={pagination?.perPage}
          perPageOptions={paginationDefaultValues}
        />
      </div>
      <VirtualizedTable<V1beta1VirtualMachineInstancetype>
        EmptyMsg={() => (
          <div className="pf-u-text-align-center" id="no-instancetype-msg">
            {t('No VirtualMachineInstanceType found')}
          </div>
        )}
        columns={activeColumns}
        data={data}
        loaded={loaded && loadedColumns}
        loadError={loadError}
        Row={UserInstancetypeRow}
        unfilteredData={unfilteredData}
      />
    </ListPageBody>
  );
};

export default UserInstancetypeList;
