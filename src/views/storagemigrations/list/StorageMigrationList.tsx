import React, { FC, useMemo } from 'react';

import KubevirtFilterToolbar from '@kubevirt-utils/components/KubevirtFilterToolbar/KubevirtFilterToolbar';
import KubevirtTable from '@kubevirt-utils/components/KubevirtTable/KubevirtTable';
import { buildColumnLayout } from '@kubevirt-utils/components/KubevirtTable/utils';
import useKubevirtDataViewFilters from '@kubevirt-utils/hooks/useKubevirtDataViewFilters/useKubevirtDataViewFilters';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import useKubevirtTableColumns from '@kubevirt-utils/hooks/useKubevirtUserSettings/useKubevirtTableColumns';
import usePaginationWithFilters from '@kubevirt-utils/hooks/usePagination/usePaginationWithFilters';
import { paginationDefaultValues } from '@kubevirt-utils/hooks/usePagination/utils/constants';
import { EXPORT_TABLE_KEYS, KubevirtTableExport } from '@kubevirt-utils/hooks/useTableExport';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { ListPageBody, ListPageHeader } from '@openshift-console/dynamic-plugin-sdk';
import { Pagination } from '@patternfly/react-core';

import useStorageMigrationResources from './hooks/useStorageMigrationResources';
import { COLUMN_MANAGEMENT_ID_STORAGE_MIGRATIONS } from './constants';
import { getStorageMigrationColumns, getStorageMigrationRowId } from './storageMigrationDefinition';
import { getStorageMigrationStatusFilters } from './StorageMigrationListFilters';

import '@kubevirt-utils/styles/list-managment-group.scss';

const StorageMigrationList: FC = () => {
  const { t } = useKubevirtTranslation();

  const { loaded, loadError, storageMigPlans } = useStorageMigrationResources();

  const columns = useMemo(() => getStorageMigrationColumns(t), [t]);
  const filterDefinitions = useMemo(() => getStorageMigrationStatusFilters(t), [t]);

  const { activeColumnKeys, loaded: loadedColumns } = useKubevirtTableColumns({
    columnManagementID: COLUMN_MANAGEMENT_ID_STORAGE_MIGRATIONS,
    columns,
  });

  const { clearAllFilters, filteredData, filters, onSetFilters } = useKubevirtDataViewFilters({
    data: storageMigPlans ?? [],
    filterDefinitions,
  });

  const {
    handlePerPageSelect,
    handleSetPage,
    pagination,
    handleFilterChange: handleSetFilters,
  } = usePaginationWithFilters(filteredData?.length ?? 0, onSetFilters);

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
      <ListPageHeader title={t('Storage migration plans')} />

      <ListPageBody>
        <div className="list-managment-group">
          <KubevirtFilterToolbar
            clearAllFilters={clearAllFilters}
            columnLayout={columnLayout}
            data={storageMigPlans}
            filterDefinitions={filterDefinitions}
            filters={filters}
            loaded={isLoaded}
            onSetFilters={handleSetFilters}
            toolbarEndContent={
              <KubevirtTableExport
                activeColumnKeys={activeColumnKeys}
                columns={columns}
                data={filteredData ?? []}
                exportKey={EXPORT_TABLE_KEYS.STORAGE_MIGRATIONS}
                loaded={isLoaded}
              />
            }
          />
          {!isEmpty(filteredData) && isLoaded && (
            <Pagination
              className="list-managment-group__pagination"
              isLastFullPageShown
              itemCount={filteredData?.length ?? 0}
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
          data={filteredData ?? []}
          dataTest="storage-migrations-list"
          getRowId={getStorageMigrationRowId}
          loaded={isLoaded}
          loadError={loadError}
          noDataMsg={t("You don't have any storage migrations yet")}
          pagination={pagination}
          persistSortInUrl
          unfilteredData={storageMigPlans}
        />
      </ListPageBody>
    </>
  );
};

export default StorageMigrationList;
