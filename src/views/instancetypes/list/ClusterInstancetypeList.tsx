import React, { type FC, useMemo } from 'react';

import { VirtualMachineClusterInstancetypeModelRef } from '@kubevirt-ui-ext/kubevirt-api/console';
import KubevirtTable from '@kubevirt-utils/components/KubevirtTable/KubevirtTable';
import { buildColumnLayout } from '@kubevirt-utils/components/KubevirtTable/utils';
import ListPageFilter from '@kubevirt-utils/components/ListPageFilter/ListPageFilter';
import useCanPatchFeaturesConfigMap from '@kubevirt-utils/hooks/useCanPatchFeaturesConfigMap';
import { useClusterFilter } from '@kubevirt-utils/hooks/useClusterFilter';
import useClusterInstanceTypes from '@kubevirt-utils/hooks/useClusterInstanceTypes';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import useKubevirtTableColumns from '@kubevirt-utils/hooks/useKubevirtUserSettings/useKubevirtTableColumns';
import usePaginationWithFilters from '@kubevirt-utils/hooks/usePagination/usePaginationWithFilters';
import { paginationDefaultValues } from '@kubevirt-utils/hooks/usePagination/utils/constants';
import { ListPageProps } from '@kubevirt-utils/utils/types';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import useIsAllClustersPage from '@multicluster/hooks/useIsAllClustersPage';
import useIsACMPage from '@multicluster/useIsACMPage';
import { ListPageBody, useListPageFilter } from '@openshift-console/dynamic-plugin-sdk';
import { Pagination } from '@patternfly/react-core';

import FamilyAvailabilitySection from './components/FamilyAvailabilitySection/FamilyAvailabilitySection';
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
  const showClusterColumn = useIsAllClustersPage();

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

  // Family status reveals family availability, so the whole column (header and column
  // management included) exists only for users who can patch the features ConfigMap. Fails
  // closed while the access review is loading. Rows from other clusters are gated per cell.
  const [canPatchFeaturesConfigMap, canPatchLoading] = useCanPatchFeaturesConfigMap();
  const showFamilyStatusColumn = canPatchFeaturesConfigMap && !canPatchLoading;

  const columns = useMemo(
    () => getClusterInstancetypeColumns(t, showClusterColumn, showFamilyStatusColumn),
    [t, showClusterColumn, showFamilyStatusColumn],
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
      <FamilyAvailabilitySection />
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
