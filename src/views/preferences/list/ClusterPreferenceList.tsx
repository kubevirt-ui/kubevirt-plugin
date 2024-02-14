import React, { FC } from 'react';

import useClusterPreferences from '@catalog/CreateFromInstanceTypes/state/hooks/useClusterPreferences';
import { V1beta1VirtualMachineClusterPreference } from '@kubevirt-ui/kubevirt-api/kubevirt';
import ListPageFilter from '@kubevirt-utils/components/ListPageFilter/ListPageFilter';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import usePagination from '@kubevirt-utils/hooks/usePagination/usePagination';
import { paginationDefaultValues } from '@kubevirt-utils/hooks/usePagination/utils/constants';
import { VirtualMachineClusterPreferenceModelRef } from '@kubevirt-utils/models';
import {
  ListPageBody,
  useListPageFilter,
  VirtualizedTable,
} from '@openshift-console/dynamic-plugin-sdk';
import { Pagination } from '@patternfly/react-core';

import ClusterPreferenceRow from './components/ClusterPreferenceRow';
import useClusterPreferenceListColumns from './hooks/useClusterPreferenceListColumns';

import '@kubevirt-utils/styles/list-managment-group.scss';

const ClusterPreferenceList: FC = () => {
  const { t } = useKubevirtTranslation();
  const [preferences, loaded, loadError] = useClusterPreferences();

  const { onPaginationChange, pagination } = usePagination();
  const [unfilteredData, data, onFilterChange] = useListPageFilter(preferences);
  const [columns, activeColumns, loadedColumns] = useClusterPreferenceListColumns(pagination, data);

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
            id: VirtualMachineClusterPreferenceModelRef,
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
      <VirtualizedTable<V1beta1VirtualMachineClusterPreference>
        EmptyMsg={() => (
          <div className="pf-u-text-align-center" id="no-preference-msg">
            {t('No preferences found')}
          </div>
        )}
        columns={activeColumns}
        data={data}
        loaded={loaded && loadedColumns}
        loadError={loadError}
        Row={ClusterPreferenceRow}
        unfilteredData={unfilteredData}
      />
    </ListPageBody>
  );
};

export default ClusterPreferenceList;
