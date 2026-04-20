import React, { FCC, useMemo } from 'react';

import { NodeModel } from '@kubevirt-ui-ext/kubevirt-api/console';
import KubevirtTable from '@kubevirt-utils/components/KubevirtTable/KubevirtTable';
import { buildColumnLayout } from '@kubevirt-utils/components/KubevirtTable/utils';
import ListPageFilter from '@kubevirt-utils/components/ListPageFilter/ListPageFilter';
import useActiveNamespace from '@kubevirt-utils/hooks/useActiveNamespace';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import useKubevirtTableColumns from '@kubevirt-utils/hooks/useKubevirtUserSettings/useKubevirtTableColumns';
import usePaginationWithFilters from '@kubevirt-utils/hooks/usePagination/usePaginationWithFilters';
import { paginationDefaultValues } from '@kubevirt-utils/hooks/usePagination/utils/constants';
import { isAllNamespaces, isEmpty } from '@kubevirt-utils/utils/utils';
import { K8sVerb, ListPageBody, useAccessReview } from '@openshift-console/dynamic-plugin-sdk';
import { Pagination } from '@patternfly/react-core';

import { UseMigrationCardDataAndFiltersValues } from '../../hooks/useMigrationCardData';

import { COLUMN_MANAGEMENT_ID_MIGRATIONS, MIGRATION_COLUMN_KEYS } from './utils/constants';
import { getMigrationsTableColumns, getMigrationsTableRowId } from './migrationsTableDefinition';

import '@kubevirt-utils/styles/list-managment-group.scss';

type MigrationTableProps = {
  tableData: UseMigrationCardDataAndFiltersValues;
};

const MigrationTable: FCC<MigrationTableProps> = ({ tableData }) => {
  const { t } = useKubevirtTranslation();
  const activeNamespace = useActiveNamespace();

  const {
    filters,
    loaded,
    loadErrors,
    migrationsTableFilteredData,
    migrationsTableUnfilteredData,
    onFilterChange,
  } = tableData || {};

  const [canGetNode] = useAccessReview({
    resource: NodeModel.plural,
    verb: 'get' as K8sVerb,
  });

  const showNamespaceColumn = isAllNamespaces(activeNamespace);

  const columns = useMemo(
    () => getMigrationsTableColumns(t, showNamespaceColumn, canGetNode),
    [t, showNamespaceColumn, canGetNode],
  );

  const { activeColumnKeys, loaded: loadedColumns } = useKubevirtTableColumns({
    columnManagementID: COLUMN_MANAGEMENT_ID_MIGRATIONS,
    columns,
  });

  const { handleFilterChange, handlePerPageSelect, handleSetPage, pagination } =
    usePaginationWithFilters(migrationsTableFilteredData?.length ?? 0, onFilterChange);

  const columnLayout = useMemo(
    () =>
      buildColumnLayout(
        columns,
        activeColumnKeys,
        COLUMN_MANAGEMENT_ID_MIGRATIONS,
        t('VirtualMachineInstanceMigration'),
      ),
    [columns, activeColumnKeys, t],
  );

  const isLoaded = loaded && loadedColumns;

  return (
    <ListPageBody>
      <div className="list-managment-group">
        <ListPageFilter
          columnLayout={columnLayout}
          data={migrationsTableUnfilteredData}
          loaded={isLoaded}
          onFilterChange={handleFilterChange}
          rowFilters={filters ?? []}
        />
        {!isEmpty(migrationsTableFilteredData) && isLoaded && (
          <Pagination
            className="list-managment-group__pagination"
            isLastFullPageShown
            itemCount={migrationsTableFilteredData?.length ?? 0}
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
        ariaLabel={t('Migrations table')}
        columns={columns}
        data={migrationsTableFilteredData ?? []}
        dataTest="migrations-table"
        getRowId={getMigrationsTableRowId}
        initialSortDirection="desc"
        initialSortKey={MIGRATION_COLUMN_KEYS.CREATED}
        loaded={isLoaded}
        loadError={loadErrors}
        noDataMsg={t('No migrations found')}
        pagination={pagination}
        unfilteredData={migrationsTableUnfilteredData}
      />
    </ListPageBody>
  );
};

export default MigrationTable;
