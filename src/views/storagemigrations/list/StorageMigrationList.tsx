import React, { FC, useMemo } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { modelToRef } from '@kubevirt-utils/models';
import {
  DEFAULT_MIGRATION_NAMESPACE,
  DirectVolumeMigration,
  DirectVolumeMigrationModel,
  MigMigration,
  MigMigrationModel,
  MigPlan,
  MigPlanModel,
} from '@kubevirt-utils/resources/migrations/constants';
import {
  getGroupVersionKindForModel,
  K8sResourceCommon,
  ListPageBody,
  ListPageFilter,
  ListPageHeader,
  useK8sWatchResource,
  useListPageFilter,
  VirtualizedTable,
} from '@openshift-console/dynamic-plugin-sdk';

import StorageMigrationRow from './components/StorageMigrationRow';
import useStorageMigrationColumns from './hooks/useStorageMigrationColumns';
import useStorageMigrationFilters from './hooks/useStorageMigrationFilters';
import { createMigPlanMap } from './utils';

const StorageMigrationList: FC = () => {
  const { t } = useKubevirtTranslation();

  const [migplans, loaded, loadError] = useK8sWatchResource<MigPlan[]>({
    groupVersionKind: getGroupVersionKindForModel(MigPlanModel),
    isList: true,
    namespace: DEFAULT_MIGRATION_NAMESPACE,
    namespaced: true,
  });

  const [migMigrations] = useK8sWatchResource<MigMigration[]>({
    groupVersionKind: getGroupVersionKindForModel(MigMigrationModel),
    isList: true,
    namespace: DEFAULT_MIGRATION_NAMESPACE,
    namespaced: true,
  });

  const [directVolumeMigrations] = useK8sWatchResource<DirectVolumeMigration[]>({
    groupVersionKind: getGroupVersionKindForModel(DirectVolumeMigrationModel),
    isList: true,
    namespace: DEFAULT_MIGRATION_NAMESPACE,
    namespaced: true,
  });

  const migPlanMap = useMemo(
    () => createMigPlanMap(migplans, migMigrations, directVolumeMigrations),
    [migplans, migMigrations, directVolumeMigrations],
  );

  const filters = useStorageMigrationFilters();
  const [data, filteredData, onFilterChange] = useListPageFilter(migplans, filters);
  const [columns, activeColumns] = useStorageMigrationColumns(migPlanMap);

  return (
    <>
      <ListPageHeader title={t('Storage MigrationPlans')}></ListPageHeader>
      <ListPageBody>
        <ListPageFilter
          columnLayout={{
            columns: columns?.map(({ additional, id, title }) => ({
              additional,
              id,
              title,
            })),
            id: modelToRef(MigPlanModel),
            selectedColumns: new Set(activeColumns?.map((col) => col?.id)),
            type: t('Storage Migration'),
          }}
          data={data}
          loaded={loaded}
          onFilterChange={onFilterChange}
          rowFilters={filters}
        />
        <VirtualizedTable<K8sResourceCommon>
          EmptyMsg={() => (
            <div className="pf-v6-u-text-align-center" id="no-storagemigration-msg">
              {t('No storage migration found')}
            </div>
          )}
          columns={activeColumns}
          data={filteredData}
          loaded={loaded}
          loadError={loadError}
          Row={StorageMigrationRow}
          rowData={{ migPlanMap }}
          unfilteredData={data}
        />
      </ListPageBody>
    </>
  );
};

export default StorageMigrationList;
