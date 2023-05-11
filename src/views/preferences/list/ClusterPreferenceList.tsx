import React, { FC } from 'react';

import { V1alpha2VirtualMachineClusterPreference } from '@kubevirt-ui/kubevirt-api/kubevirt';
import DeveloperPreviewLabel from '@kubevirt-utils/components/DeveloperPreviewLabel/DeveloperPreviewLabel';
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
    V1alpha2VirtualMachineClusterPreference[]
  >({
    groupVersionKind: VirtualMachineClusterPreferenceModelGroupVersionKind,
    isList: true,
    namespaced: false,
  });

  const { pagination, onPaginationChange } = usePagination();
  const [unfilteredData, data, onFilterChange] = useListPageFilter(preferences);
  const [columns, activeColumns] = useClusterPreferenceListColumns(pagination, data);

  return (
    <>
      <ListPageHeader
        title={t('VirtualMachineClusterPreferences')}
        badge={<DeveloperPreviewLabel />}
      >
        <ListPageCreate createAccessReview={{ groupVersionKind: kind }} groupVersionKind={kind}>
          {t('Create')}
        </ListPageCreate>
      </ListPageHeader>
      <ListPageBody>
        <div className="list-managment-group">
          <ListPageFilter
            data={unfilteredData}
            loaded={loaded}
            onFilterChange={(...args) => {
              onFilterChange(...args);
              onPaginationChange({
                page: 1,
                startIndex: 0,
                endIndex: pagination?.perPage,
                perPage: pagination?.perPage,
              });
            }}
            columnLayout={{
              columns: columns?.map(({ id, title, additional }) => ({
                id,
                title,
                additional,
              })),
              id: kind,
              selectedColumns: new Set(activeColumns?.map((col) => col?.id)),
              type: '',
            }}
          />
          <Pagination
            itemCount={data?.length}
            className="list-managment-group__pagination"
            page={pagination?.page}
            perPage={pagination?.perPage}
            defaultToFullPage
            onSetPage={(_e, page, perPage, startIndex, endIndex) =>
              onPaginationChange({ page, perPage, startIndex, endIndex })
            }
            onPerPageSelect={(_e, perPage, page, startIndex, endIndex) =>
              onPaginationChange({ page, perPage, startIndex, endIndex })
            }
            perPageOptions={paginationDefaultValues}
          />
        </div>
        <VirtualizedTable<V1alpha2VirtualMachineClusterPreference>
          data={data}
          unfilteredData={unfilteredData}
          loaded={loaded}
          loadError={loadError}
          columns={activeColumns}
          Row={ClusterPreferenceRow}
        />
      </ListPageBody>
    </>
  );
};

export default ClusterPreferenceList;
