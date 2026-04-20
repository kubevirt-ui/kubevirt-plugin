import React, { FCC, useMemo } from 'react';

import { VirtualMachineInstancetypeModelRef } from '@kubevirt-ui-ext/kubevirt-api/console';
import { V1beta1VirtualMachineInstancetype } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import KubevirtTable from '@kubevirt-utils/components/KubevirtTable/KubevirtTable';
import { buildColumnLayout } from '@kubevirt-utils/components/KubevirtTable/utils';
import ListPageFilter from '@kubevirt-utils/components/ListPageFilter/ListPageFilter';
import useActiveNamespace from '@kubevirt-utils/hooks/useActiveNamespace';
import { useClusterFilter } from '@kubevirt-utils/hooks/useClusterFilter';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import useKubevirtTableColumns from '@kubevirt-utils/hooks/useKubevirtUserSettings/useKubevirtTableColumns';
import usePaginationWithFilters from '@kubevirt-utils/hooks/usePagination/usePaginationWithFilters';
import { paginationDefaultValues } from '@kubevirt-utils/hooks/usePagination/utils/constants';
import { useProjectFilter } from '@kubevirt-utils/hooks/useProjectFilter';
import useSelectedRowFilterClusters from '@kubevirt-utils/hooks/useSelectedRowFilterClusters';
import useSelectedRowFilterProjects from '@kubevirt-utils/hooks/useSelectedRowFilterProjects';
import { isAllNamespaces, isEmpty } from '@kubevirt-utils/utils/utils';
import useIsAllClustersPage from '@multicluster/hooks/useIsAllClustersPage';
import useIsACMPage from '@multicluster/useIsACMPage';
import { ListPageBody, useListPageFilter } from '@openshift-console/dynamic-plugin-sdk';
import { Pagination } from '@patternfly/react-core';

import UserInstancetypeEmptyState from './components/UserInstancetypeEmptyState/UserInstancetypeEmptyState';
import { UserInstancetypeListProps } from './utils/types';
import { getUserInstancetypeColumns, getUserInstancetypeRowId } from './userInstancetypeDefinition';

import '@kubevirt-utils/styles/list-managment-group.scss';

const UserInstancetypeList: FCC<UserInstancetypeListProps> = ({
  hideColumnManagement,
  hideNameLabelFilters,
  hideTextFilter,
  instanceTypes,
  loaded,
  loadError,
  nameFilter,
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

  const filtersWithSelect = useMemo(
    () => (isACMPage ? [clusterFilter, projectFilter] : []),
    [clusterFilter, projectFilter, isACMPage],
  );

  const [unfilteredData, filteredData, onFilterChange] = useListPageFilter<
    V1beta1VirtualMachineInstancetype,
    V1beta1VirtualMachineInstancetype
  >(instanceTypes, filtersWithSelect, {
    name: { selected: [nameFilter] },
  });

  const { handleFilterChange, handlePerPageSelect, handleSetPage, pagination } =
    usePaginationWithFilters(filteredData?.length ?? 0, onFilterChange);

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
    isEmpty(unfilteredData) &&
    isEmpty(filteredClusters) &&
    isEmpty(namespaceFilterParams)
  ) {
    return <UserInstancetypeEmptyState namespace={effectiveNamespace} />;
  }

  return (
    <ListPageBody>
      <div className="list-managment-group">
        <ListPageFilter
          columnLayout={columnLayout}
          data={unfilteredData}
          filtersWithSelect={filtersWithSelect}
          hideColumnManagement={hideColumnManagement}
          hideLabelFilter={hideTextFilter}
          hideNameLabelFilters={hideNameLabelFilters}
          loaded={isLoaded}
          onFilterChange={handleFilterChange}
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
        noDataMsg={t('No VirtualMachineInstanceTypes found')}
        pagination={pagination}
        unfilteredData={unfilteredData}
      />
    </ListPageBody>
  );
};

export default UserInstancetypeList;
