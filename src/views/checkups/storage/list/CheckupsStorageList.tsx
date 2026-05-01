import React, { useMemo } from 'react';

import { IoK8sApiBatchV1Job } from '@kubevirt-ui-ext/kubevirt-api/kubernetes';
import KubevirtTable from '@kubevirt-utils/components/KubevirtTable/KubevirtTable';
import ListPageFilter from '@kubevirt-utils/components/ListPageFilter/ListPageFilter';
import { ALL_NAMESPACES_SESSION_KEY } from '@kubevirt-utils/hooks/constants';
import useActiveNamespace from '@kubevirt-utils/hooks/useActiveNamespace';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import useKubevirtTableColumns from '@kubevirt-utils/hooks/useKubevirtUserSettings/useKubevirtTableColumns';
import {
  ACTIONS,
  COLUMN_MANAGEMENT_IDS,
} from '@kubevirt-utils/hooks/useKubevirtUserSettings/utils/const';
import usePaginationWithFilters from '@kubevirt-utils/hooks/usePagination/usePaginationWithFilters';
import { paginationDefaultValues } from '@kubevirt-utils/hooks/usePagination/utils/constants';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import useIsACMPage from '@multicluster/useIsACMPage';
import { ListPageBody } from '@openshift-console/dynamic-plugin-sdk';
import { Pagination } from '@patternfly/react-core';
import { useHubClusterName } from '@stolostron/multicluster-sdk';

import useCheckupsListFilters from '../../utils/hooks/useCheckupsListFilters';
import { getCheckupsConfigMapRowId, getJobByName } from '../../utils/utils';
import useCheckupsStorageData from '../components/hooks/useCheckupsStorageData';
import { useCheckupsStoragePermissions } from '../components/hooks/useCheckupsStoragePermissions';
import { getFilters } from '../utils/filters';

import {
  CheckupsStorageCallbacks,
  getCheckupsStorageColumns,
} from './checkupsStorageListDefinition';
import CheckupsStorageListEmptyState from './CheckupsStorageListEmptyState';

import '@kubevirt-utils/styles/list-managment-group.scss';

const CheckupsStorageList = () => {
  const { t } = useKubevirtTranslation();
  const namespace = useActiveNamespace();
  const isACMPage = useIsACMPage();
  const [hubClusterName] = useHubClusterName();
  const showNamespace = namespace === ALL_NAMESPACES_SESSION_KEY;

  const {
    clusterRoleBinding,
    isPermitted,
    isPermittedToInstall,
    loading: loadingPermissions,
  } = useCheckupsStoragePermissions();
  const { configMaps, error, jobs, loaded } = useCheckupsStorageData();

  const [unfilteredData, filteredData, onFilterChange, filters] = useCheckupsListFilters(
    configMaps || [],
    getFilters,
  );

  const { handleFilterChange, handlePerPageSelect, handleSetPage, pagination } =
    usePaginationWithFilters(filteredData?.length ?? 0, onFilterChange);

  const columns = useMemo(
    () => getCheckupsStorageColumns(t, isACMPage, showNamespace, hubClusterName),
    [t, isACMPage, showNamespace, hubClusterName],
  );

  const { activeColumnKeys, loaded: loadedColumns } = useKubevirtTableColumns({
    columnManagementID: COLUMN_MANAGEMENT_IDS.CHECKUPS_STORAGE,
    columns,
  });

  const callbacks: CheckupsStorageCallbacks = useMemo(
    () => ({
      getJobByName: (configMapName: string): IoK8sApiBatchV1Job[] =>
        getJobByName(jobs, configMapName),
    }),
    [jobs],
  );

  const isLoaded = loaded && !loadingPermissions && loadedColumns;

  const columnLayout = useMemo(
    () => ({
      columns: columns
        .filter((col) => col.key !== ACTIONS)
        .map(({ additional, key, label }) => ({
          additional,
          id: key,
          title: label,
        })),
      id: COLUMN_MANAGEMENT_IDS.CHECKUPS_STORAGE,
      selectedColumns: new Set(activeColumnKeys),
      type: t('Checkups'),
    }),
    [columns, activeColumnKeys, t],
  );

  if (isEmpty(configMaps) && isLoaded && !error) {
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
          columnLayout={columnLayout}
          data={unfilteredData}
          loaded={isLoaded}
          onFilterChange={handleFilterChange}
          rowFilters={filters}
        />
        {!isEmpty(filteredData) && isLoaded && (
          <Pagination
            className="list-managment-group__pagination"
            isLastFullPageShown
            itemCount={filteredData?.length}
            onPerPageSelect={handlePerPageSelect}
            onSetPage={handleSetPage}
            page={pagination?.page}
            perPage={pagination?.perPage}
            perPageOptions={paginationDefaultValues}
          />
        )}
      </div>
      <KubevirtTable
        activeColumnKeys={activeColumnKeys}
        ariaLabel={t('Storage checkups table')}
        callbacks={callbacks}
        columns={columns}
        data={filteredData ?? []}
        dataTest="checkups-storage-table"
        fixedLayout
        getRowId={getCheckupsConfigMapRowId}
        loaded={isLoaded}
        loadError={error}
        noDataMsg={t('No storage checkups found')}
        pagination={pagination}
        unfilteredData={unfilteredData}
      />
    </ListPageBody>
  );
};

export default CheckupsStorageList;
