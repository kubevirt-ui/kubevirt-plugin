import React, { FC, useMemo } from 'react';

import { VirtualMachineInstancetypeModelRef } from '@kubevirt-ui-ext/kubevirt-api/console';
import KubevirtFilterToolbar from '@kubevirt-utils/components/KubevirtFilterToolbar/KubevirtFilterToolbar';
import KubevirtTable from '@kubevirt-utils/components/KubevirtTable/KubevirtTable';
import { buildColumnLayout } from '@kubevirt-utils/components/KubevirtTable/utils';
import useActiveNamespace from '@kubevirt-utils/hooks/useActiveNamespace';
import useClusterFilter from '@kubevirt-utils/hooks/useKubevirtDataViewFilters/filters/useClusterFilter';
import useProjectFilter from '@kubevirt-utils/hooks/useKubevirtDataViewFilters/filters/useProjectFilter';
import useKubevirtDataViewFilters from '@kubevirt-utils/hooks/useKubevirtDataViewFilters/useKubevirtDataViewFilters';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import useKubevirtTableColumns from '@kubevirt-utils/hooks/useKubevirtUserSettings/useKubevirtTableColumns';
import usePaginationWithFilters from '@kubevirt-utils/hooks/usePagination/usePaginationWithFilters';
import { paginationDefaultValues } from '@kubevirt-utils/hooks/usePagination/utils/constants';
import useSelectedRowFilterClusters from '@kubevirt-utils/hooks/useSelectedRowFilterClusters';
import useSelectedRowFilterProjects from '@kubevirt-utils/hooks/useSelectedRowFilterProjects';
import { EXPORT_TABLE_KEYS, KubevirtTableExport } from '@kubevirt-utils/hooks/useTableExport';
import { isAllNamespaces, isEmpty } from '@kubevirt-utils/utils/utils';
import useIsAllClustersPage from '@multicluster/hooks/useIsAllClustersPage';
import useIsACMPage from '@multicluster/useIsACMPage';
import { ListPageBody } from '@openshift-console/dynamic-plugin-sdk';
import { Pagination } from '@patternfly/react-core';

import UserInstancetypeEmptyState from './components/UserInstancetypeEmptyState/UserInstancetypeEmptyState';
import { getUserInstancetypeColumns, getUserInstancetypeRowId } from './userInstancetypeDefinition';
import { UserInstancetypeListProps } from './utils/types';

import '@kubevirt-utils/styles/list-managment-group.scss';

const UserInstancetypeList: FC<UserInstancetypeListProps> = ({
  hideColumnManagement,
  instanceTypes,
  loaded,
  loadError,
  namespace,
}) => {
  const { t } = useKubevirtTranslation();
  const filteredClusters = useSelectedRowFilterClusters();
  const namespaceFilterParams = useSelectedRowFilterProjects();
  const activeNamespace = useActiveNamespace();
  const effectiveNamespace = namespace ?? activeNamespace;

  const clusterFilter = useClusterFilter();
  const projectFilter = useProjectFilter();
  const isACMPage = useIsACMPage();
  const showClusterColumn = useIsAllClustersPage();
  const showNamespaceColumn = isAllNamespaces(effectiveNamespace);

  const filterDefinitions = useMemo(
    () => (isACMPage ? [clusterFilter, projectFilter] : []),
    [clusterFilter, projectFilter, isACMPage],
  );

  const { clearAllFilters, filteredData, filters, onSetFilters } = useKubevirtDataViewFilters({
    data: instanceTypes ?? [],
    filterDefinitions,
  });

  const {
    handleFilterChange: handleSetFilters,
    handlePerPageSelect,
    handleSetPage,
    pagination,
  } = usePaginationWithFilters(filteredData?.length ?? 0, onSetFilters);

  const columns = useMemo(
    () => getUserInstancetypeColumns(t, showClusterColumn, showNamespaceColumn),
    [t, showClusterColumn, showNamespaceColumn],
  );

  const { activeColumnKeys, loaded: loadedColumns } = useKubevirtTableColumns({
    columnManagementID: VirtualMachineInstancetypeModelRef,
    columns,
  });

  const columnLayout = useMemo(
    () => buildColumnLayout(columns, activeColumnKeys, VirtualMachineInstancetypeModelRef),
    [columns, activeColumnKeys],
  );

  const isLoaded = loaded && loadedColumns;

  if (
    isLoaded &&
    !loadError &&
    isEmpty(instanceTypes) &&
    isEmpty(filteredClusters) &&
    isEmpty(namespaceFilterParams)
  ) {
    return <UserInstancetypeEmptyState namespace={effectiveNamespace} />;
  }

  return (
    <ListPageBody>
      <div className="list-managment-group">
        <KubevirtFilterToolbar
          clearAllFilters={clearAllFilters}
          columnLayout={columnLayout}
          data={instanceTypes}
          filterDefinitions={filterDefinitions}
          filters={filters}
          hideColumnManagement={hideColumnManagement}
          loaded={isLoaded}
          onSetFilters={handleSetFilters}
          toolbarEndContent={
            <KubevirtTableExport
              activeColumnKeys={activeColumnKeys}
              columns={columns}
              data={filteredData ?? []}
              exportKey={EXPORT_TABLE_KEYS.USER_INSTANCETYPES}
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
        ariaLabel={t('User instance types table')}
        columns={columns}
        data={filteredData ?? []}
        dataTest="user-instancetype-list"
        getRowId={getUserInstancetypeRowId}
        loaded={isLoaded}
        loadError={loadError}
        noDataMsg={t("You don't have any VirtualMachineInstanceTypes yet")}
        pagination={pagination}
        unfilteredData={instanceTypes}
      />
    </ListPageBody>
  );
};

export default UserInstancetypeList;
