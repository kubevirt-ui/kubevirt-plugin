import React, { type FC, useMemo } from 'react';

import KubevirtFilterToolbar from '@kubevirt-utils/components/KubevirtFilterToolbar/KubevirtFilterToolbar';
import KubevirtTable from '@kubevirt-utils/components/KubevirtTable/KubevirtTable';
import { buildColumnLayout } from '@kubevirt-utils/components/KubevirtTable/utils';
import useKubevirtDataViewFilters from '@kubevirt-utils/hooks/useKubevirtDataViewFilters/useKubevirtDataViewFilters';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import useKubevirtTableColumns from '@kubevirt-utils/hooks/useKubevirtUserSettings/useKubevirtTableColumns';
import useMigrationPolicies from '@kubevirt-utils/hooks/useMigrationPolicies';
import useSelectedRowFilterClusters from '@kubevirt-utils/hooks/useSelectedRowFilterClusters';
import { EXPORT_TABLE_KEYS, KubevirtTableExport } from '@kubevirt-utils/hooks/useTableExport';
import { type ListPageProps } from '@kubevirt-utils/utils/types';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import useIsAllClustersPage from '@multicluster/hooks/useIsAllClustersPage';
import useIsACMPage from '@multicluster/useIsACMPage';
import { ListPageBody, ListPageHeader } from '@openshift-console/dynamic-plugin-sdk';

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

  const filterDefinitions = useMigrationPoliciesFilters();
  const { clearAllFilters, filteredData, filters, onSetFilters } = useKubevirtDataViewFilters({
    data: mps ?? [],
    filterDefinitions,
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

  if (isLoaded && !loadError && isEmpty(mps) && isEmpty(filteredClusters)) {
    return <MigrationPoliciesEmptyState />;
  }

  return (
    <>
      <ListPageHeader title={showTitle && t('MigrationPolicies')}>
        <MigrationPoliciesCreateButton />
      </ListPageHeader>

      <ListPageBody>
        <KubevirtFilterToolbar
          clearAllFilters={clearAllFilters}
          columnLayout={columnLayout}
          data={mps}
          filterDefinitions={filterDefinitions}
          filters={filters}
          hideColumnManagement={hideColumnManagement}
          loaded={isLoaded}
          onSetFilters={onSetFilters}
          toolbarEndContent={
            <KubevirtTableExport
              activeColumnKeys={activeColumnKeys}
              columns={columns}
              data={filteredData ?? []}
              exportKey={EXPORT_TABLE_KEYS.MIGRATION_POLICIES}
              loaded={isLoaded}
            />
          }
        />
        <KubevirtTable
          activeColumnKeys={activeColumnKeys}
          ariaLabel={t('MigrationPolicies table')}
          columns={columns}
          data={filteredData ?? []}
          dataTest="migration-policies-list"
          getRowId={getMigrationPoliciesRowId}
          loaded={isLoaded}
          loadError={loadError}
          noDataMsg={t("You don't have any MigrationPolicies yet")}
          unfilteredData={mps}
        />
      </ListPageBody>
    </>
  );
};

export default MigrationPoliciesList;
