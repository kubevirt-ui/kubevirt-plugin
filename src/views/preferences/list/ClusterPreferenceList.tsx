import React, { FC } from 'react';

import { V1beta1VirtualMachineClusterPreference } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import usePagination from '@kubevirt-utils/hooks/usePagination/usePagination';
import { paginationDefaultValues } from '@kubevirt-utils/hooks/usePagination/utils/constants';
import { VirtualMachineClusterPreferenceModelGroupVersionKind } from '@kubevirt-utils/models';
import {
  ListPageBody,
  ListPageCreate,
  ListPageFilter,
  ListPageHeader,
  useK8sWatchResource,
  useListPageFilter,
  VirtualizedTable,
} from '@openshift-console/dynamic-plugin-sdk';
import { Pagination } from '@patternfly/react-core';

import ClusterPreferenceRow from './components/ClusterPreferenceRow';
import useClusterPreferenceListColumns from './hooks/useClusterPreferenceListColumns';

import '@kubevirt-utils/styles/list-managment-group.scss';

type ClusterPreferenceListProps = {
  kind: string;
};

const ClusterPreferenceList: FC<ClusterPreferenceListProps> = ({ kind }) => {
  const { t } = useKubevirtTranslation();
  const [preferences, loaded, loadError] = useK8sWatchResource<
    V1beta1VirtualMachineClusterPreference[]
  >({
    groupVersionKind: VirtualMachineClusterPreferenceModelGroupVersionKind,
    isList: true,
    namespaced: false,
  });

  const { onPaginationChange, pagination } = usePagination();
  const [unfilteredData, data, onFilterChange] = useListPageFilter(preferences);
  const [columns, activeColumns] = useClusterPreferenceListColumns(pagination, data);

  return (
    <>
      <ListPageHeader title={t('VirtualMachineClusterPreferences')}>
        <ListPageCreate createAccessReview={{ groupVersionKind: kind }} groupVersionKind={kind}>
          {t('Create')}
        </ListPageCreate>
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
              id: kind,
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
            loaded={loaded}
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
          columns={activeColumns}
          data={data}
          loaded={loaded}
          loadError={loadError}
          Row={ClusterPreferenceRow}
          unfilteredData={unfilteredData}
        />
      </ListPageBody>
    </>
  );
};

export default ClusterPreferenceList;
