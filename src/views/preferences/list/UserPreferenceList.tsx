import React from 'react';

import {
  VirtualMachinePreferenceModelGroupVersionKind,
  VirtualMachinePreferenceModelRef,
} from '@kubevirt-ui/kubevirt-api/console/models/VirtualMachinePreferenceModel';
import { V1beta1VirtualMachinePreference } from '@kubevirt-ui/kubevirt-api/kubevirt';
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

import UserPreferenceRow from './components/UserPreferenceRow';
import useUserPreferenceListColumns from './hooks/useUserPreferenceListColumns';

const UserPreferenceList = () => {
  const { t } = useKubevirtTranslation();
  const [activeNamespace] = useActiveNamespace();
  const [preferences, loaded, loadError] = useK8sWatchResource<V1beta1VirtualMachinePreference[]>({
    groupVersionKind: VirtualMachinePreferenceModelGroupVersionKind,
    isList: true,
    ...(activeNamespace !== ALL_NAMESPACES_SESSION_KEY && { namespace: activeNamespace }),
  });

  const { onPaginationChange, pagination } = usePagination();
  const [unfilteredData, data, onFilterChange] = useListPageFilter<
    V1beta1VirtualMachinePreference,
    V1beta1VirtualMachinePreference
  >(preferences);
  const [columns, activeColumns, loadedColumns] = useUserPreferenceListColumns(pagination, data);

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
            id: VirtualMachinePreferenceModelRef,
            selectedColumns: new Set(activeColumns?.map((col) => col?.id)),
            type: t('preferences'),
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
      <VirtualizedTable<V1beta1VirtualMachinePreference>
        NoDataEmptyMsg={() => (
          <div className="pf-u-text-align-center" id="no-preference-msg">
            {t('No preferences found')}
          </div>
        )}
        columns={activeColumns}
        data={data}
        loaded={loaded && loadedColumns}
        loadError={loadError}
        Row={UserPreferenceRow}
        unfilteredData={unfilteredData}
      />
    </ListPageBody>
  );
};

export default UserPreferenceList;
