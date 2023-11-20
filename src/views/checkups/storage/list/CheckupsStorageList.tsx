import React from 'react';

import { ConfigMapModel } from '@kubevirt-ui/kubevirt-api/console';
import { IoK8sApiBatchV1Job, IoK8sApiCoreV1ConfigMap } from '@kubevirt-ui/kubevirt-api/kubernetes';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import usePagination from '@kubevirt-utils/hooks/usePagination/usePagination';
import { paginationDefaultValues } from '@kubevirt-utils/hooks/usePagination/utils/constants';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import {
  ListPageBody,
  ListPageFilter,
  VirtualizedTable,
} from '@openshift-console/dynamic-plugin-sdk';
import { Pagination } from '@patternfly/react-core';

import { getJobByName } from '../../utils/utils';
import useCheckupsStorageData from '../components/hooks/useCheckupsStorageData';
import useCheckupsStorageListColumns from '../components/hooks/useCheckupsStorageListColumns';
import useCheckupsStorageListFilters from '../components/hooks/useCheckupsStorageListFilters';
import { useCheckupsStoragePermissions } from '../components/hooks/useCheckupsStoragePermissions';

import CheckupsStorageListEmptyState from './CheckupsStorageListEmptyState';
import CheckupsStorageListRow from './CheckupsStorageListRow';

const CheckupsStorageList = () => {
  const { t } = useKubevirtTranslation();
  const [columns, activeColumns] = useCheckupsStorageListColumns();

  const {
    clusterRoleBinding,
    isPermitted,
    loading: loadingPermissions,
  } = useCheckupsStoragePermissions();
  const { configMaps, error, jobs, loading } = useCheckupsStorageData();

  const { onPaginationChange, pagination } = usePagination();
  const [unfilterData, dataFilters, onFilterChange, filters] =
    useCheckupsStorageListFilters(configMaps);

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
            id: ConfigMapModel.kind,
            selectedColumns: new Set(activeColumns?.map((col) => col?.id)),
            type: t('Checkups'),
          }}
          onFilterChange={(...args) => {
            onFilterChange(...args);
            onPaginationChange({
              ...pagination,
              endIndex: pagination?.perPage,
              page: 1,
              startIndex: 0,
            });
          }}
          data={unfilterData}
          loaded={loading && !loadingPermissions}
          rowFilters={filters}
        />
        {!isEmpty(dataFilters) && loading && !loadingPermissions && (
          <Pagination
            onPerPageSelect={(_e, perPage, page, startIndex, endIndex) =>
              onPaginationChange({ endIndex, page, perPage, startIndex })
            }
            onSetPage={(_e, page, perPage, startIndex, endIndex) =>
              onPaginationChange({ endIndex, page, perPage, startIndex })
            }
            className="list-managment-group__pagination"
            defaultToFullPage
            itemCount={dataFilters?.length}
            page={pagination?.page}
            perPage={pagination?.perPage}
            perPageOptions={paginationDefaultValues}
          />
        )}
      </div>
      {isEmpty(configMaps) && loading && !loadingPermissions && (
        <CheckupsStorageListEmptyState
          clusterRoleBinding={clusterRoleBinding}
          isPermitted={isPermitted}
          loadingPermissions={loadingPermissions}
        />
      )}
      <VirtualizedTable<IoK8sApiCoreV1ConfigMap>
        rowData={{
          getJobByName: (configMapName: string): IoK8sApiBatchV1Job[] =>
            getJobByName(jobs, configMapName),
        }}
        columns={activeColumns}
        data={dataFilters}
        loaded={loading && !loadingPermissions}
        loadError={error}
        NoDataEmptyMsg={() => null}
        Row={CheckupsStorageListRow}
        unfilteredData={unfilterData}
      />
    </ListPageBody>
  );
};

export default CheckupsStorageList;
