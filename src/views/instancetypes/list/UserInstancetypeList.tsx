import React, { FC, useMemo } from 'react';

import { VirtualMachineInstancetypeModelRef } from '@kubevirt-ui/kubevirt-api/console';
import { V1beta1VirtualMachineInstancetype } from '@kubevirt-ui/kubevirt-api/kubevirt';
import ListPageFilter from '@kubevirt-utils/components/ListPageFilter/ListPageFilter';
import { useClusterFilter } from '@kubevirt-utils/hooks/useClusterFilter';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import usePagination from '@kubevirt-utils/hooks/usePagination/usePagination';
import { paginationDefaultValues } from '@kubevirt-utils/hooks/usePagination/utils/constants';
import { useProjectFilter } from '@kubevirt-utils/hooks/useProjectFilter';
import useSelectedRowFilterClusters from '@kubevirt-utils/hooks/useSelectedRowFilterClusters';
import useSelectedRowFilterProjects from '@kubevirt-utils/hooks/useSelectedRowFilterProjects';
import { ListPageProps } from '@kubevirt-utils/utils/types';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import {
  ListPageBody,
  useListPageFilter,
  VirtualizedTable,
} from '@openshift-console/dynamic-plugin-sdk';
import { Pagination } from '@patternfly/react-core';

import UserInstancetypeEmptyState from './components/UserInstancetypeEmptyState/UserInstancetypeEmptyState';
import UserInstancetypeRow from './components/UserInstancetypeRow';
import useUserInstancetypeListColumns from './hooks/useUserInstancetypeListColumns';

import '@kubevirt-utils/styles/list-managment-group.scss';

type UserInstancetypeListProps = ListPageProps & {
  instanceTypes: V1beta1VirtualMachineInstancetype[];
  loaded: boolean;
  loadError: Error;
};

const UserInstancetypeList: FC<UserInstancetypeListProps> = ({
  hideColumnManagement,
  hideNameLabelFilters,
  hideTextFilter,
  instanceTypes,
  loaded,
  loadError,
  nameFilter,
  namespace,
}) => {
  const { t } = useKubevirtTranslation();
  const filteredClusters = useSelectedRowFilterClusters();
  const namespaceFilterParams = useSelectedRowFilterProjects();

  const { onPaginationChange, pagination } = usePagination();

  const clusterFilter = useClusterFilter();
  const projectFilter = useProjectFilter();

  const filtersWithSelect = useMemo(
    () => [clusterFilter, projectFilter],
    [clusterFilter, projectFilter],
  );

  const [unfilteredData, data, onFilterChange] = useListPageFilter<
    V1beta1VirtualMachineInstancetype,
    V1beta1VirtualMachineInstancetype
  >(instanceTypes, filtersWithSelect, {
    name: { selected: [nameFilter] },
  });

  const [columns, activeColumns, loadedColumns] = useUserInstancetypeListColumns(pagination, data);

  if (
    loaded &&
    isEmpty(unfilteredData) &&
    isEmpty(filteredClusters) &&
    isEmpty(namespaceFilterParams)
  ) {
    return <UserInstancetypeEmptyState namespace={namespace} />;
  }

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
          filtersWithSelect={filtersWithSelect}
          hideColumnManagement={hideColumnManagement}
          hideLabelFilter={hideTextFilter}
          hideNameLabelFilters={hideNameLabelFilters}
          loaded={loadedColumns}
        />
        {!isEmpty(data) && (
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
        )}
      </div>
      <VirtualizedTable<V1beta1VirtualMachineInstancetype>
        EmptyMsg={() => (
          <div className="pf-v6-u-text-align-center" id="no-instancetype-msg">
            {t('No VirtualMachineInstanceTypes found')}
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
