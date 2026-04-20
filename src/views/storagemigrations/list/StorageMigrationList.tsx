import React, { FCC, useMemo } from 'react';

import KubevirtTable from '@kubevirt-utils/components/KubevirtTable/KubevirtTable';
import { buildColumnLayout } from '@kubevirt-utils/components/KubevirtTable/utils';
import ListPageFilter from '@kubevirt-utils/components/ListPageFilter/ListPageFilter';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import useKubevirtTableColumns from '@kubevirt-utils/hooks/useKubevirtUserSettings/useKubevirtTableColumns';
import usePaginationWithFilters from '@kubevirt-utils/hooks/usePagination/usePaginationWithFilters';
import { paginationDefaultValues } from '@kubevirt-utils/hooks/usePagination/utils/constants';
import { MultiNamespaceVirtualMachineStorageMigrationPlan } from '@kubevirt-utils/resources/migrations/constants';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import {
  ListPageBody,
  ListPageHeader,
  useListPageFilter,
} from '@openshift-console/dynamic-plugin-sdk';
import { Pagination } from '@patternfly/react-core';

import useStorageMigrationResources from './hooks/useStorageMigrationResources';
import { COLUMN_MANAGEMENT_ID_STORAGE_MIGRATIONS } from './constants';
import { getStorageMigrationColumns, getStorageMigrationRowId } from './storageMigrationDefinition';
import { getStorageMigrationStatusFilters } from './StorageMigrationListFilters';

import '@kubevirt-utils/styles/list-managment-group.scss';

const StorageMigrationList: FCC = () => {
  const { t } = useKubevirtTranslation();

  const { loaded, loadError, storageMigPlans } = useStorageMigrationResources();

  const columns = useMemo(() => getStorageMigrationColumns(t), [t]);
  const statusFilters = useMemo(() => getStorageMigrationStatusFilters(t), [t]);

  const { activeColumnKeys, loaded: loadedColumns } = useKubevirtTableColumns({
    columnManagementID: COLUMN_MANAGEMENT_ID_STORAGE_MIGRATIONS,
    columns,
  });

  const [unfilteredData, data, onFilterChange] = useListPageFilter<
    MultiNamespaceVirtualMachineStorageMigrationPlan,
    MultiNamespaceVirtualMachineStorageMigrationPlan
  >(storageMigPlans, statusFilters);

  const { handleFilterChange, handlePerPageSelect, handleSetPage, pagination } =
    usePaginationWithFilters(data?.length ?? 0, onFilterChange);

  const columnLayout = useMemo(
    () =>
      buildColumnLayout(
        columns,
        activeColumnKeys,
        COLUMN_MANAGEMENT_ID_STORAGE_MIGRATIONS,
        t('Storage migration'),
      ),
    [columns, activeColumnKeys, t],
  );

  const isLoaded = loaded && loadedColumns;

  return (
    <>
      <ListPageHeader title={t('Storage MigrationPlans')} />

      <ListPageBody>
        <div className="list-managment-group">
          <ListPageFilter
            columnLayout={columnLayout}
            data={unfilteredData}
            loaded={isLoaded}
            onFilterChange={handleFilterChange}
            rowFilters={statusFilters}
          />
          {!isEmpty(data) && isLoaded && (
            <Pagination
              className="list-managment-group__pagination"
              isLastFullPageShown
              itemCount={data?.length ?? 0}
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
          ariaLabel={t('Storage migrations table')}
          columns={columns}
          data={data ?? []}
          dataTest="storage-migrations-list"
          getRowId={getStorageMigrationRowId}
          loaded={isLoaded}
          loadError={loadError}
          noDataMsg={t('No storage migration found')}
          pagination={pagination}
          unfilteredData={unfilteredData}
        />
      </ListPageBody>
    </>
  );
};

export default StorageMigrationList;
