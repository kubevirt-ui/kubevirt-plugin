import React, { FC, useMemo } from 'react';

import { IoK8sApiBatchV1Job } from '@kubevirt-ui-ext/kubevirt-api/kubernetes';
import KubevirtTable from '@kubevirt-utils/components/KubevirtTable/KubevirtTable';
import ListPageFilter from '@kubevirt-utils/components/ListPageFilter/ListPageFilter';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import useKubevirtTableColumns from '@kubevirt-utils/hooks/useKubevirtUserSettings/useKubevirtTableColumns';
import usePaginationWithFilters from '@kubevirt-utils/hooks/usePagination/usePaginationWithFilters';
import { paginationDefaultValues } from '@kubevirt-utils/hooks/usePagination/utils/constants';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import useIsACMPage from '@multicluster/useIsACMPage';
import { ListPageBody } from '@openshift-console/dynamic-plugin-sdk';
import { Pagination } from '@patternfly/react-core';

import { getJobByName } from '../../utils/utils';
import useCheckupsSelfValidationData from '../components/hooks/useCheckupsSelfValidationData';
import useCheckupsSelfValidationListFilters from '../components/hooks/useCheckupsSelfValidationListFilters';
import useCheckupsSelfValidationPermissions from '../components/hooks/useCheckupsSelfValidationPermissions';

import {
  CheckupsSelfValidationCallbacks,
  getCheckupsSelfValidationColumns,
  getCheckupsSelfValidationRowId,
} from './checkupsSelfValidationListDefinition';
import CheckupsSelfValidationListEmptyState from './CheckupsSelfValidationListEmptyState';

import '@kubevirt-utils/styles/list-managment-group.scss';

const CheckupsSelfValidationList: FC = () => {
  const { t } = useKubevirtTranslation();
  const isACMPage = useIsACMPage();

  const {
    clusterRoleBinding,
    isPermitted,
    isPermittedToInstall,
    loading: loadingPermissions,
  } = useCheckupsSelfValidationPermissions();
  const { configMaps, error, jobs, loaded } = useCheckupsSelfValidationData();

  const [unfilteredData, filteredData, onFilterChange, filters] =
    useCheckupsSelfValidationListFilters(configMaps || []);

  const { handleFilterChange, handlePerPageSelect, handleSetPage, pagination } =
    usePaginationWithFilters(filteredData?.length ?? 0, onFilterChange);

  const columns = useMemo(
    () => getCheckupsSelfValidationColumns(t, isACMPage, jobs ?? []),
    [t, isACMPage, jobs],
  );

  const { activeColumnKeys, loaded: loadedColumns } = useKubevirtTableColumns({
    columnManagementID: 'checkups-self-validation',
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
        .filter((col) => col.key !== 'actions')
        .map(({ additional, key, label }) => ({ additional, id: key, title: label })),
      id: 'checkups-self-validation',
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
        ariaLabel={t('Self validation checkups table')}
        callbacks={callbacks}
        columns={columns}
        data={filteredData ?? []}
        dataTest="checkups-self-validation-table"
        fixedLayout
        getRowId={getCheckupsSelfValidationRowId}
        initialSortDirection="desc"
        initialSortKey="startTime"
        loaded={isLoaded}
        loadError={error}
        noDataMsg={t('No self validation checkups found')}
        pagination={pagination}
        unfilteredData={unfilteredData}
      />
    </ListPageBody>
  );
};

export default CheckupsSelfValidationList;
