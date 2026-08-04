import React, { FC, useMemo } from 'react';

import { IoK8sApiBatchV1Job } from '@kubevirt-ui-ext/kubevirt-api/kubernetes';
import KubevirtFilterToolbar from '@kubevirt-utils/components/KubevirtFilterToolbar/KubevirtFilterToolbar';
import KubevirtTable from '@kubevirt-utils/components/KubevirtTable/KubevirtTable';
import useKubevirtDataViewFilters from '@kubevirt-utils/hooks/useKubevirtDataViewFilters/useKubevirtDataViewFilters';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import useKubevirtTableColumns from '@kubevirt-utils/hooks/useKubevirtUserSettings/useKubevirtTableColumns';
import {
  ACTIONS,
  COLUMN_MANAGEMENT_IDS,
} from '@kubevirt-utils/hooks/useKubevirtUserSettings/utils/const';
import usePaginationWithFilters from '@kubevirt-utils/hooks/usePagination/usePaginationWithFilters';
import { paginationDefaultValues } from '@kubevirt-utils/hooks/usePagination/utils/constants';
import { EXPORT_TABLE_KEYS, KubevirtTableExport } from '@kubevirt-utils/hooks/useTableExport';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import useIsACMPage from '@multicluster/useIsACMPage';
import { ListPageBody } from '@openshift-console/dynamic-plugin-sdk';
import { Pagination } from '@patternfly/react-core';
import { useHubClusterName } from '@stolostron/multicluster-sdk';

import { CHECKUPS_COLUMN_KEYS } from '../../utils/constants';
import { getCheckupsConfigMapRowId, getJobByName } from '../../utils/utils';
import useCheckupsSelfValidationData from '../components/hooks/useCheckupsSelfValidationData';
import useCheckupsSelfValidationPermissions from '../components/hooks/useCheckupsSelfValidationPermissions';
import { getCheckupsSelfValidationListFilters } from '../utils';

import {
  CheckupsSelfValidationCallbacks,
  getCheckupsSelfValidationColumns,
} from './checkupsSelfValidationListDefinition';
import CheckupsSelfValidationListEmptyState from './CheckupsSelfValidationListEmptyState';

import '@kubevirt-utils/styles/list-managment-group.scss';

const CheckupsSelfValidationList: FC = () => {
  const { t } = useKubevirtTranslation();
  const isACMPage = useIsACMPage();
  const [hubClusterName] = useHubClusterName();

  const {
    clusterRoleBinding,
    isPermitted,
    isPermittedToInstall,
    loadError: permissionsError,
    loading: loadingPermissions,
  } = useCheckupsSelfValidationPermissions();
  const { configMaps, error: dataError, jobs, loaded } = useCheckupsSelfValidationData();
  const error = dataError || permissionsError;

  const filterDefinitions = useMemo(() => getCheckupsSelfValidationListFilters(t), [t]);
  const { clearAllFilters, filteredData, filters, onSetFilters } = useKubevirtDataViewFilters({
    data: configMaps ?? [],
    filterDefinitions,
  });

  const {
    handlePerPageSelect,
    handleSetPage,
    pagination,
    handleFilterChange: handleSetFilters,
  } = usePaginationWithFilters(filteredData?.length ?? 0, onSetFilters);

  const columns = useMemo(
    () => getCheckupsSelfValidationColumns(t, isACMPage, jobs ?? [], hubClusterName),
    [t, isACMPage, jobs, hubClusterName],
  );

  const { activeColumnKeys, loaded: loadedColumns } = useKubevirtTableColumns({
    columnManagementID: COLUMN_MANAGEMENT_IDS.CHECKUPS_SELF_VALIDATION,
    columns,
  });

  const callbacks: CheckupsSelfValidationCallbacks = useMemo(
    () => ({
      getJobByName: (configMapName: string, exactMatch: boolean): IoK8sApiBatchV1Job[] =>
        getJobByName(jobs, configMapName, exactMatch),
    }),
    [jobs],
  );

  const columnLayout = useMemo(
    () => ({
      columns: columns
        .filter((col) => col.key !== ACTIONS)
        .map(({ additional, key, label }) => ({ additional, id: key, title: label })),
      id: COLUMN_MANAGEMENT_IDS.CHECKUPS_SELF_VALIDATION,
      selectedColumns: new Set(activeColumnKeys),
      type: t('Checkups'),
    }),
    [columns, activeColumnKeys, t],
  );

  const isLoaded = loaded && !loadingPermissions && loadedColumns;

  if (isEmpty(configMaps) && isLoaded && !error) {
    return (
      <CheckupsSelfValidationListEmptyState
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
        <KubevirtFilterToolbar
          clearAllFilters={clearAllFilters}
          columnLayout={columnLayout}
          data={configMaps}
          filterDefinitions={filterDefinitions}
          filters={filters}
          loaded={isLoaded}
          onSetFilters={handleSetFilters}
          toolbarEndContent={
            <KubevirtTableExport
              activeColumnKeys={activeColumnKeys}
              callbacks={callbacks}
              columns={columns}
              data={filteredData ?? []}
              exportKey={EXPORT_TABLE_KEYS.SELF_VALIDATION_CHECKUPS}
              initialSortDirection="desc"
              initialSortKey={CHECKUPS_COLUMN_KEYS.START_TIME_CAMEL}
              loaded={isLoaded}
            />
          }
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
        ariaLabel={t('Self validation checkups table')}
        callbacks={callbacks}
        columns={columns}
        data={filteredData ?? []}
        dataTest="checkups-self-validation-table"
        fixedLayout
        getRowId={getCheckupsConfigMapRowId}
        initialSortDirection="desc"
        initialSortKey={CHECKUPS_COLUMN_KEYS.START_TIME_CAMEL}
        loaded={isLoaded}
        loadError={error}
        noDataMsg={t('No self validation checkups found')}
        pagination={pagination}
        persistSortInUrl
        unfilteredData={configMaps}
      />
    </ListPageBody>
  );
};

export default CheckupsSelfValidationList;
