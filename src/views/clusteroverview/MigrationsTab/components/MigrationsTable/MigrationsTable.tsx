import * as React from 'react';

import { VirtualMachineInstanceMigrationModelRef } from '@kubevirt-ui/kubevirt-api/console';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import {
  ListPageBody,
  ListPageFilter,
  VirtualizedTable,
} from '@openshift-console/dynamic-plugin-sdk';
import { Bullseye } from '@patternfly/react-core';

import { UseMigrationCardDataAndFiltersValues } from '../../hooks/useMigrationCardData';

import useVirtualMachineInstanceMigrationsColumns from './hooks/useVirtualMachineInstanceMigrationsColumns';
import { MigrationTableDataLayout } from './utils/utils';
import MigrationsRow from './MigrationsRow';

type MigrationTableProps = {
  tableData: UseMigrationCardDataAndFiltersValues;
};

const MigrationTable: React.FC<MigrationTableProps> = ({ tableData }) => {
  const { t } = useKubevirtTranslation();

  const {
    loaded,
    loadErrors,
    filters,
    migrationsTableUnfilteredData,
    migrationsTableFilteredData,
    onFilterChange,
  } = tableData || {};
  const [columns, activeColumns] = useVirtualMachineInstanceMigrationsColumns();
  return (
    <>
      <ListPageBody>
        <ListPageFilter
          data={migrationsTableUnfilteredData}
          loaded={loaded}
          rowFilters={filters}
          onFilterChange={onFilterChange}
          columnLayout={{
            columns: columns?.map(({ id, title, additional }) => ({
              id,
              title,
              additional,
            })),
            id: VirtualMachineInstanceMigrationModelRef,
            selectedColumns: new Set(activeColumns?.map((col) => col?.id)),
            type: t('VirtualMachineInstanceMigration'),
          }}
        />
        <VirtualizedTable<MigrationTableDataLayout>
          data={migrationsTableFilteredData}
          unfilteredData={migrationsTableUnfilteredData}
          loaded={loaded}
          loadError={loadErrors}
          columns={activeColumns}
          Row={MigrationsRow}
          EmptyMsg={() => (
            <Bullseye>
              <ListPageBody>{t('No migrations found')}</ListPageBody>
            </Bullseye>
          )}
        />
      </ListPageBody>
    </>
  );
};

export default MigrationTable;
