import React, { FC } from 'react';

import { VirtualMachineInstanceMigrationModelRef } from '@kubevirt-ui/kubevirt-api/console';
import ListPageFilter from '@kubevirt-utils/components/ListPageFilter/ListPageFilter';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { ListPageBody, VirtualizedTable } from '@openshift-console/dynamic-plugin-sdk';
import { Bullseye } from '@patternfly/react-core';

import { UseMigrationCardDataAndFiltersValues } from '../../hooks/useMigrationCardData';

import useVirtualMachineInstanceMigrationsColumns from './hooks/useVirtualMachineInstanceMigrationsColumns';
import { MigrationTableDataLayout } from './utils/utils';
import MigrationsRow from './MigrationsRow';

type MigrationTableProps = {
  tableData: UseMigrationCardDataAndFiltersValues;
};

const MigrationTable: FC<MigrationTableProps> = ({ tableData }) => {
  const { t } = useKubevirtTranslation();

  const {
    filters,
    loaded,
    loadErrors,
    migrationsTableFilteredData,
    migrationsTableUnfilteredData,
    onFilterChange,
  } = tableData || {};
  const [columns, activeColumns] = useVirtualMachineInstanceMigrationsColumns();
  return (
    <>
      <ListPageBody>
        <ListPageFilter
          columnLayout={{
            columns: columns?.map(({ additional, id, title }) => ({
              additional,
              id,
              title,
            })),
            id: VirtualMachineInstanceMigrationModelRef,
            selectedColumns: new Set(activeColumns?.map((col) => col?.id)),
            type: t('VirtualMachineInstanceMigration'),
          }}
          data={migrationsTableUnfilteredData}
          loaded={loaded}
          onFilterChange={onFilterChange}
          rowFilters={filters}
        />
        <VirtualizedTable<MigrationTableDataLayout>
          EmptyMsg={() => (
            <Bullseye>
              <ListPageBody>{t('No migrations found')}</ListPageBody>
            </Bullseye>
          )}
          columns={activeColumns}
          data={migrationsTableFilteredData}
          loaded={loaded}
          loadError={loadErrors}
          Row={MigrationsRow}
          unfilteredData={migrationsTableUnfilteredData}
        />
      </ListPageBody>
    </>
  );
};

export default MigrationTable;
