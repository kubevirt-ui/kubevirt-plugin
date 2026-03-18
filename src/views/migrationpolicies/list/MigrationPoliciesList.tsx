import React, { FC, useMemo } from 'react';

import { V1alpha1MigrationPolicy } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import KubevirtTable from '@kubevirt-utils/components/KubevirtTable/KubevirtTable';
import { buildColumnLayout } from '@kubevirt-utils/components/KubevirtTable/utils';
import ListPageFilter from '@kubevirt-utils/components/ListPageFilter/ListPageFilter';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import useKubevirtTableColumns from '@kubevirt-utils/hooks/useKubevirtUserSettings/useKubevirtTableColumns';
import useMigrationPolicies from '@kubevirt-utils/hooks/useMigrationPolicies';
import useSelectedRowFilterClusters from '@kubevirt-utils/hooks/useSelectedRowFilterClusters';
import { ListPageProps } from '@kubevirt-utils/utils/types';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import useIsAllClustersPage from '@multicluster/hooks/useIsAllClustersPage';
import useIsACMPage from '@multicluster/useIsACMPage';
import {
  ListPageBody,
  ListPageHeader,
  useListPageFilter,
} from '@openshift-console/dynamic-plugin-sdk';

import { COLUMN_MANAGEMENT_ID_MIGRATION_POLICIES } from '../utils/constants';

import MigrationPoliciesCreateButton from './components/MigrationPoliciesCreateButton/MigrationPoliciesCreateButton';
import MigrationPoliciesEmptyState from './components/MigrationPoliciesEmptyState/MigrationPoliciesEmptyState';
import useMigrationPoliciesFilters from './hooks/useMigrationPoliciesFilters';
import {
  getMigrationPoliciesColumns,
  getMigrationPoliciesRowId,
} from './migrationPoliciesDefinition';

const MigrationPoliciesList: FC<ListPageProps> = ({
  fieldSelector,
  hideColumnManagement,
  hideNameLabelFilters,
  hideTextFilter,
  nameFilter,
  selector,
  showTitle = true,
}) => {
  const { t } = useKubevirtTranslation();
  const filteredClusters = useSelectedRowFilterClusters();
  const isACMPage = useIsACMPage();
  const isAllClustersPage = useIsAllClustersPage();

  const [mps, loaded, loadError] = useMigrationPolicies(fieldSelector, selector);

  const showClusterColumn = isACMPage && isAllClustersPage;

  const columns = useMemo(
    () => getMigrationPoliciesColumns(t, showClusterColumn),
    [t, showClusterColumn],
  );

  const { activeColumnKeys, loaded: loadedColumns } = useKubevirtTableColumns({
    columnManagementID: COLUMN_MANAGEMENT_ID_MIGRATION_POLICIES,
    columns,
  });

  const filters = useMigrationPoliciesFilters();

  const [unfilteredData, data, onFilterChange] = useListPageFilter<
    V1alpha1MigrationPolicy,
    V1alpha1MigrationPolicy
  >(mps, filters, {
    name: { selected: [nameFilter] },
  });

  const columnLayout = useMemo(
    () =>
      buildColumnLayout(
        columns,
        activeColumnKeys,
        COLUMN_MANAGEMENT_ID_MIGRATION_POLICIES,
        t('MigrationPolicy'),
      ),
    [columns, activeColumnKeys, t],
  );

  const isLoaded = loaded && loadedColumns;

  if (isLoaded && !loadError && isEmpty(unfilteredData) && isEmpty(filteredClusters)) {
    return <MigrationPoliciesEmptyState />;
  }

  return (
    <>
      <ListPageHeader title={showTitle && t('MigrationPolicies')}>
        <MigrationPoliciesCreateButton />
      </ListPageHeader>

      <ListPageBody>
        <ListPageFilter
          columnLayout={columnLayout}
          data={unfilteredData}
          filtersWithSelect={filters}
          hideColumnManagement={hideColumnManagement}
          hideLabelFilter={hideTextFilter}
          hideNameLabelFilters={hideNameLabelFilters}
          loaded={isLoaded}
          onFilterChange={onFilterChange}
        />
        <KubevirtTable
          activeColumnKeys={activeColumnKeys}
          ariaLabel={t('MigrationPolicies table')}
          columns={columns}
          data={data ?? []}
          dataTest="migration-policies-list"
          getRowId={getMigrationPoliciesRowId}
          loaded={isLoaded}
          loadError={loadError}
          noDataMsg={t('No MigrationPolicies found')}
          unfilteredData={unfilteredData}
        />
      </ListPageBody>
    </>
  );
};

export default MigrationPoliciesList;
