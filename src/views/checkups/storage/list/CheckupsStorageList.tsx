import React from 'react';

import { IoK8sApiBatchV1Job, IoK8sApiCoreV1ConfigMap } from '@kubevirt-ui/kubevirt-api/kubernetes';
import ListPageFilter from '@kubevirt-utils/components/ListPageFilter/ListPageFilter';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import usePagination from '@kubevirt-utils/hooks/usePagination/usePagination';
import { paginationDefaultValues } from '@kubevirt-utils/hooks/usePagination/utils/constants';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { ListPageBody, VirtualizedTable } from '@openshift-console/dynamic-plugin-sdk';
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
  const [columns, activeColumns, loadedColumns] = useCheckupsStorageListColumns();

  const {
    clusterRoleBinding,
    isPermitted,
    isPermittedToInstall,
    loading: loadingPermissions,
  } = useCheckupsStoragePermissions();
  const { configMaps, error, jobs, loaded } = useCheckupsStorageData();

  const { onPaginationChange, pagination } = usePagination();
  const [unfilterData, dataFilters, onFilterChange, filters] =
    useCheckupsStorageListFilters(configMaps);

  if (isEmpty(configMaps) && loaded && !loadingPermissions && loadedColumns) {
    return (
      <CheckupsStorageListEmptyState
        clusterRoleBinding={clusterRoleBinding}
        isPermitted={isPermitted}
        isPermittedToInstall={isPermittedToInstall}
        loadingPermissions={loadingPermissions}
      />
    );
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
            id: 'checkups-storage',
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
          loaded={loaded && !loadingPermissions && loadedColumns}
          rowFilters={filters}
        />
        {!isEmpty(dataFilters) && loaded && !loadingPermissions && (
          <Pagination
            onPerPageSelect={(_e, perPage, page, startIndex, endIndex) =>
              onPaginationChange({ endIndex, page, perPage, startIndex })
            }
            onSetPage={(_e, page, perPage, startIndex, endIndex) =>
              onPaginationChange({ endIndex, page, perPage, startIndex })
            }
            className="list-managment-group__pagination"
            isLastFullPageShown
            itemCount={dataFilters?.length}
            page={pagination?.page}
            perPage={pagination?.perPage}
            perPageOptions={paginationDefaultValues}
          />
        )}
      </div>
      <VirtualizedTable<IoK8sApiCoreV1ConfigMap>
        EmptyMsg={() => (
          <div className="pf-v6-u-text-align-center">{t('No storage checkups found')}</div>
        )}
        rowData={{
          getJobByName: (configMapName: string): IoK8sApiBatchV1Job[] =>
            getJobByName(jobs, configMapName),
        }}
        columns={activeColumns}
        data={dataFilters}
        loaded={loaded && !loadingPermissions && loadedColumns}
        loadError={error}
        Row={CheckupsStorageListRow}
        unfilteredData={unfilterData}
      />
    </ListPageBody>
  );
};

export default CheckupsStorageList;
