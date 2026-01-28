import React, { FC, useEffect, useMemo, useState } from 'react';

import { VirtualMachineInstanceMigrationModelRef } from '@kubevirt-ui-ext/kubevirt-api/console';
import ListPageFilter from '@kubevirt-utils/components/ListPageFilter/ListPageFilter';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import {
  paginationDefaultValues,
  paginationInitialState,
} from '@kubevirt-utils/hooks/usePagination/utils/constants';
import { PaginationState } from '@kubevirt-utils/hooks/usePagination/utils/types';
import { ListPageBody, VirtualizedTable } from '@openshift-console/dynamic-plugin-sdk';
import { Bullseye, Flex, FlexItem, Pagination } from '@patternfly/react-core';

import { UseMigrationCardDataAndFiltersValues } from '../../hooks/useMigrationCardData';

import useVirtualMachineInstanceMigrationsColumns from './hooks/useVirtualMachineInstanceMigrationsColumns';
import { getClampedPagination, MigrationTableDataLayout } from './utils/utils';
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
  const [pagination, setPagination] = useState<PaginationState>(paginationInitialState);

  const columnLayout = useMemo(
    () => ({
      columns: columns?.map(({ additional, id, title }) => ({
        additional,
        id,
        title,
      })),
      id: VirtualMachineInstanceMigrationModelRef,
      selectedColumns: new Set(activeColumns?.map((col) => col?.id)),
      type: t('VirtualMachineInstanceMigration'),
    }),
    [columns, activeColumns, t],
  );

  const paginatedData = useMemo(
    () => migrationsTableFilteredData?.slice(pagination.startIndex, pagination.endIndex),
    [migrationsTableFilteredData, pagination.startIndex, pagination.endIndex],
  );

  const onPageChange = ({
    endIndex,
    page,
    perPage,
    startIndex,
  }: {
    endIndex: number;
    page: number;
    perPage: number;
    startIndex: number;
  }) => {
    setPagination({ endIndex, page, perPage, startIndex });
  };

  // Reset to page 1 when filters change
  const handleFilterChange = (...args: Parameters<typeof onFilterChange>) => {
    onFilterChange?.(...args);
    setPagination((prev) => ({
      ...prev,
      endIndex: prev.perPage,
      page: 1,
      startIndex: 0,
    }));
  };

  useEffect(() => {
    const length = migrationsTableFilteredData?.length || 0;
    setPagination((prev) => getClampedPagination(prev, length));
  }, [migrationsTableFilteredData?.length]);

  return (
    <>
      <ListPageBody>
        <ListPageFilter
          columnLayout={columnLayout}
          data={migrationsTableUnfilteredData}
          loaded={loaded}
          onFilterChange={handleFilterChange}
          rowFilters={filters}
        />
        <Flex justifyContent={{ default: 'justifyContentFlexEnd' }}>
          <FlexItem>
            <Pagination
              onPerPageSelect={(_e, perPage, page, startIndex, endIndex) =>
                onPageChange({ endIndex, page, perPage, startIndex })
              }
              onSetPage={(_e, page, perPage, startIndex, endIndex) =>
                onPageChange({ endIndex, page, perPage, startIndex })
              }
              isCompact
              isLastFullPageShown
              itemCount={migrationsTableFilteredData?.length || 0}
              page={pagination.page}
              perPage={pagination.perPage}
              perPageOptions={paginationDefaultValues}
            />
          </FlexItem>
        </Flex>
        <VirtualizedTable<MigrationTableDataLayout>
          EmptyMsg={() => (
            <Bullseye>
              <ListPageBody>{t('No migrations found')}</ListPageBody>
            </Bullseye>
          )}
          columns={activeColumns}
          data={paginatedData}
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
