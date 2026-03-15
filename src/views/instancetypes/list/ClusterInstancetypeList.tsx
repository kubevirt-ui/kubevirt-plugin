import React, { FC, useMemo } from 'react';

import useClusterInstanceTypes from '@catalog/CreateFromInstanceTypes/state/hooks/useClusterInstanceTypes';
import { VirtualMachineClusterInstancetypeModelRef } from '@kubevirt-ui-ext/kubevirt-api/console';
import KubevirtTable from '@kubevirt-utils/components/KubevirtTable/KubevirtTable';
import { buildColumnLayout } from '@kubevirt-utils/components/KubevirtTable/utils';
import ListPageFilter from '@kubevirt-utils/components/ListPageFilter/ListPageFilter';
import { useClusterFilter } from '@kubevirt-utils/hooks/useClusterFilter';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import useKubevirtTableColumns from '@kubevirt-utils/hooks/useKubevirtUserSettings/useKubevirtTableColumns';
import usePaginationWithFilters from '@kubevirt-utils/hooks/usePagination/usePaginationWithFilters';
import { paginationDefaultValues } from '@kubevirt-utils/hooks/usePagination/utils/constants';
import { ListPageProps } from '@kubevirt-utils/utils/types';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import useClusterParam from '@multicluster/hooks/useClusterParam';
import useIsACMPage from '@multicluster/useIsACMPage';
import { ListPageBody, useListPageFilter } from '@openshift-console/dynamic-plugin-sdk';
import { Pagination } from '@patternfly/react-core';

import {
  getClusterInstancetypeColumns,
  getClusterInstancetypeRowId,
} from './clusterInstancetypeDefinition';

import '@kubevirt-utils/styles/list-managment-group.scss';

const ClusterInstancetypeList: FC<ListPageProps> = ({
  fieldSelector,
  hideColumnManagement,
  hideNameLabelFilters,
  hideTextFilter,
  nameFilter,
  selector,
}) => {
  const { t } = useKubevirtTranslation();
  const [instanceTypes, loaded, loadError] = useClusterInstanceTypes(fieldSelector, selector);

  const clusterFilter = useClusterFilter();
  const isACMPage = useIsACMPage();
  const cluster = useClusterParam();

  const showClusterColumn = isACMPage && !cluster;

  const filtersWithSelect = useMemo(
    () => (isACMPage ? [clusterFilter] : []),
    [clusterFilter, isACMPage],
  );

  const [unfilteredData, filteredData, onFilterChange] = useListPageFilter(
    instanceTypes,
    filtersWithSelect,
    {
      name: { selected: [nameFilter] },
    },
  );

  const { handleFilterChange, handlePerPageSelect, handleSetPage, pagination } =
    usePaginationWithFilters(filteredData?.length ?? 0, onFilterChange);

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
        ariaLabel={t('Cluster instance types table')}
        columns={columns}
        data={filteredData ?? []}
        dataTest="cluster-instancetype-list"
        getRowId={getClusterInstancetypeRowId}
        loaded={isLoaded}
        loadError={loadError}
        noDataMsg={t('No VirtualMachineClusterInstanceType found')}
        pagination={pagination}
        unfilteredData={unfilteredData}
      />
    </ListPageBody>
  );
};

export default ClusterInstancetypeList;
