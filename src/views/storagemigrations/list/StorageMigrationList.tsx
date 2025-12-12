import React, { FC } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import {
  modelToRef,
  MultiNamespaceVirtualMachineStorageMigrationPlanModel,
} from '@kubevirt-utils/models';
import { MultiNamespaceVirtualMachineStorageMigrationPlan } from '@kubevirt-utils/resources/migrations/constants';
import {
  ListPageBody,
  ListPageFilter,
  ListPageHeader,
  useListPageFilter,
  VirtualizedTable,
} from '@openshift-console/dynamic-plugin-sdk';

import StorageMigrationRow from './components/StorageMigrationRow';
import useStorageMigrationColumns from './hooks/useStorageMigrationColumns';
import useStorageMigrationResources from './hooks/useStorageMigrationResources';

const StorageMigrationList: FC = () => {
  const { t } = useKubevirtTranslation();

  const { loaded, loadError, storageMigPlans } = useStorageMigrationResources();

  const [data, filteredData, onFilterChange] = useListPageFilter(storageMigPlans);
  const [columns, activeColumns] = useStorageMigrationColumns();

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
            id: modelToRef(MultiNamespaceVirtualMachineStorageMigrationPlanModel),
            selectedColumns: new Set(activeColumns?.map((col) => col?.id)),
            type: t('Storage Migration'),
          }}
          data={data}
          loaded={loaded}
          onFilterChange={onFilterChange}
        />
        <VirtualizedTable<MultiNamespaceVirtualMachineStorageMigrationPlan>
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
          unfilteredData={data}
        />
      </ListPageBody>
    </>
  );
};

export default StorageMigrationList;
