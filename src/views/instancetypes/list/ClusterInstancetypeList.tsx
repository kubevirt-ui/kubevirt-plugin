import React, { FC, useMemo } from 'react';

import { VirtualMachineClusterInstancetypeModelRef } from '@kubevirt-ui-ext/kubevirt-api/console';
import KubevirtFilterToolbar from '@kubevirt-utils/components/KubevirtFilterToolbar/KubevirtFilterToolbar';
import KubevirtTable from '@kubevirt-utils/components/KubevirtTable/KubevirtTable';
import { buildColumnLayout } from '@kubevirt-utils/components/KubevirtTable/utils';
import useClusterInstanceTypes from '@kubevirt-utils/hooks/useClusterInstanceTypes';
import useClusterFilter from '@kubevirt-utils/hooks/useKubevirtDataViewFilters/filters/useClusterFilter';
import useKubevirtDataViewFilters from '@kubevirt-utils/hooks/useKubevirtDataViewFilters/useKubevirtDataViewFilters';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import useKubevirtTableColumns from '@kubevirt-utils/hooks/useKubevirtUserSettings/useKubevirtTableColumns';
import usePaginationWithFilters from '@kubevirt-utils/hooks/usePagination/usePaginationWithFilters';
import { paginationDefaultValues } from '@kubevirt-utils/hooks/usePagination/utils/constants';
import { EXPORT_TABLE_KEYS, KubevirtTableExport } from '@kubevirt-utils/hooks/useTableExport';
import { ListPageProps } from '@kubevirt-utils/utils/types';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import useIsAllClustersPage from '@multicluster/hooks/useIsAllClustersPage';
import useIsACMPage from '@multicluster/useIsACMPage';
import { ListPageBody } from '@openshift-console/dynamic-plugin-sdk';
import { Pagination } from '@patternfly/react-core';

import {
  getClusterInstancetypeColumns,
  getClusterInstancetypeRowId,
} from './clusterInstancetypeDefinition';

import '@kubevirt-utils/styles/list-managment-group.scss';

const ClusterInstancetypeList: FC<ListPageProps> = ({
  fieldSelector,
  hideColumnManagement,
  selector,
}) => {
  const { t } = useKubevirtTranslation();
  const [instanceTypes, loaded, loadError] = useClusterInstanceTypes(fieldSelector, selector);

  const clusterFilter = useClusterFilter();
  const isACMPage = useIsACMPage();
  const showClusterColumn = useIsAllClustersPage();

  const filterDefinitions = useMemo(
    () => (isACMPage ? [clusterFilter] : []),
    [clusterFilter, isACMPage],
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
    () => getClusterInstancetypeColumns(t, showClusterColumn),
    [t, showClusterColumn],
  );

  const { activeColumnKeys, loaded: loadedColumns } = useKubevirtTableColumns({
    columnManagementID: VirtualMachineClusterInstancetypeModelRef,
    columns,
  });

  const columnLayout = useMemo(
    () => buildColumnLayout(columns, activeColumnKeys, VirtualMachineClusterInstancetypeModelRef),
    [columns, activeColumnKeys],
  );

  const isLoaded = loaded && loadedColumns;

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
              exportKey={EXPORT_TABLE_KEYS.CLUSTER_INSTANCETYPES}
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
        ariaLabel={t('Cluster instance types table')}
        columns={columns}
        data={filteredData ?? []}
        dataTest="cluster-instancetype-list"
        getRowId={getClusterInstancetypeRowId}
        loaded={isLoaded}
        loadError={loadError}
        noDataMsg={t("You don't have any VirtualMachineClusterInstanceTypes yet")}
        pagination={pagination}
        unfilteredData={instanceTypes}
      />
    </ListPageBody>
  );
};

export default ClusterInstancetypeList;
