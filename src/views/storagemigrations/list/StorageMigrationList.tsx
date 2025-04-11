import React, { FC, useMemo } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { modelToRef } from '@kubevirt-utils/models';
import { MigPlanModel } from '@kubevirt-utils/resources/migrations/constants';
import {
  K8sResourceCommon,
  ListPageBody,
  ListPageFilter,
  ListPageHeader,
  useListPageFilter,
  VirtualizedTable,
} from '@openshift-console/dynamic-plugin-sdk';

import StorageMigrationRow from './components/StorageMigrationRow';
import useStorageMigrationColumns from './hooks/useStorageMigrationColumns';
import useStorageMigrationResources from './hooks/useStorageMigrationResources';
import { createMigPlanMap } from './utils';

const StorageMigrationList: FC = () => {
  const { t } = useKubevirtTranslation();

  const { directVolumeMigrations, loaded, loadError, migMigrations, migPlans } =
    useStorageMigrationResources();

  const migPlanMap = useMemo(
    () => createMigPlanMap(migPlans, migMigrations, directVolumeMigrations),
    [migPlans, migMigrations, directVolumeMigrations],
  );

  const [data, filteredData, onFilterChange] = useListPageFilter(migPlans);
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
