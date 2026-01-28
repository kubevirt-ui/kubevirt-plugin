import React, { FC, useEffect, useMemo, useState } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import {
  paginationDefaultValues,
  paginationInitialState,
} from '@kubevirt-utils/hooks/usePagination/utils/constants';
import { PaginationState } from '@kubevirt-utils/hooks/usePagination/utils/types';
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
import { Flex, FlexItem, Pagination } from '@patternfly/react-core';

import { getClampedPagination } from '../../clusteroverview/MigrationsTab/components/MigrationsTable/utils/utils';

import StorageMigrationRow from './components/StorageMigrationRow';
import useStorageMigrationColumns from './hooks/useStorageMigrationColumns';
import useStorageMigrationResources from './hooks/useStorageMigrationResources';

const StorageMigrationList: FC = () => {
  const { t } = useKubevirtTranslation();

  const { loaded, loadError, storageMigPlans } = useStorageMigrationResources();

  const [data, filteredData, onFilterChange] = useListPageFilter(storageMigPlans);
  const [columns, activeColumns] = useStorageMigrationColumns();
  const [pagination, setPagination] = useState<PaginationState>(paginationInitialState);

  const paginatedData = useMemo(
    () => filteredData?.slice(pagination.startIndex, pagination.endIndex),
    [filteredData, pagination.startIndex, pagination.endIndex],
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
    const length = filteredData?.length || 0;
    setPagination((prev) => getClampedPagination(prev, length));
  }, [filteredData?.length]);

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
          onFilterChange={handleFilterChange}
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
              itemCount={filteredData?.length || 0}
              page={pagination.page}
              perPage={pagination.perPage}
              perPageOptions={paginationDefaultValues}
            />
          </FlexItem>
        </Flex>
        <VirtualizedTable<MultiNamespaceVirtualMachineStorageMigrationPlan>
          EmptyMsg={() => (
            <div className="pf-v6-u-text-align-center" id="no-storagemigration-msg">
              {t('No storage migration found')}
            </div>
          )}
          columns={activeColumns}
          data={paginatedData}
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
