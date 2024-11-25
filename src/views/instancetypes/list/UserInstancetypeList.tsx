import React, { FC } from 'react';

import useVirtualMachineInstanceTypes from '@catalog/CreateFromInstanceTypes/state/hooks/useVirtualMachineInstanceTypes';
import { VirtualMachineInstancetypeModelRef } from '@kubevirt-ui/kubevirt-api/console';
import { V1beta1VirtualMachineInstancetype } from '@kubevirt-ui/kubevirt-api/kubevirt';
import ListPageFilter from '@kubevirt-utils/components/ListPageFilter/ListPageFilter';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import usePagination from '@kubevirt-utils/hooks/usePagination/usePagination';
import { paginationDefaultValues } from '@kubevirt-utils/hooks/usePagination/utils/constants';
import useSetDefaultNonAdminUserProject from '@kubevirt-utils/hooks/useSetDefaultNonAdminUserProject/useSetDefaultNonAdminUserProject';
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

const UserInstancetypeList: FC<ListPageProps> = ({
  fieldSelector,
  hideColumnManagement,
  hideNameLabelFilters,
  hideTextFilter,
  nameFilter,
  namespace,
  selector,
}) => {
  const { t } = useKubevirtTranslation();
  useSetDefaultNonAdminUserProject();
  const [instanceTypes, loaded, loadError] = useVirtualMachineInstanceTypes(
    fieldSelector,
    selector,
    true,
  );

  const { onPaginationChange, pagination } = usePagination();

  const [unfilteredData, data, onFilterChange] = useListPageFilter<
    V1beta1VirtualMachineInstancetype,
    V1beta1VirtualMachineInstancetype
  >(instanceTypes, null, {
    name: { selected: [nameFilter] },
  });

  const [columns, activeColumns, loadedColumns] = useUserInstancetypeListColumns(pagination, data);

  if (loaded && isEmpty(unfilteredData)) {
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
          hideColumnManagement={hideColumnManagement}
          hideLabelFilter={hideTextFilter}
          hideNameLabelFilters={hideNameLabelFilters}
          loaded={loaded && loadedColumns}
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
          <div className="pf-u-text-align-center" id="no-instancetype-msg">
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
