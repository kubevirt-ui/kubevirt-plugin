import React, { FC, useMemo } from 'react';
import { useNavigate } from 'react-router';

import { DataSourceModelRef } from '@kubevirt-ui-ext/kubevirt-api/console';
import { V1beta1DataSource } from '@kubevirt-ui-ext/kubevirt-api/containerized-data-importer';
import KubevirtFilterToolbar from '@kubevirt-utils/components/KubevirtFilterToolbar/KubevirtFilterToolbar';
import KubevirtTable from '@kubevirt-utils/components/KubevirtTable/KubevirtTable';
import { buildColumnLayout } from '@kubevirt-utils/components/KubevirtTable/utils';
import { useModal } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import { DEFAULT_NAMESPACE } from '@kubevirt-utils/constants/constants';
import useKubevirtDataViewFilters from '@kubevirt-utils/hooks/useKubevirtDataViewFilters/useKubevirtDataViewFilters';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import useKubevirtTableColumns from '@kubevirt-utils/hooks/useKubevirtUserSettings/useKubevirtTableColumns';
import usePaginationWithFilters from '@kubevirt-utils/hooks/usePagination/usePaginationWithFilters';
import { paginationDefaultValues } from '@kubevirt-utils/hooks/usePagination/utils/constants';
import { EXPORT_TABLE_KEYS, KubevirtTableExport } from '@kubevirt-utils/hooks/useTableExport';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import {
  ListPageBody,
  ListPageCreateDropdown,
  ListPageHeader,
  useK8sWatchResource,
} from '@openshift-console/dynamic-plugin-sdk';
import { Pagination } from '@patternfly/react-core';

import { CreateDataSourceModal } from './CreateDataSourceModal/CreateDataSourceModal';
import { getDataSourceColumns, getDataSourceRowId } from './dataSourcesDefinition';
import { getDataImportCronFilter } from './DataSourcesListFilters';

import '@kubevirt-utils/styles/list-managment-group.scss';
import './DataSourcesList.scss';

type DataSourcesListProps = {
  kind: string;
  namespace: string;
};

const DataSourcesList: FC<DataSourcesListProps> = ({ kind, namespace }) => {
  const { t } = useKubevirtTranslation();
  const { createModal } = useModal();
  const navigate = useNavigate();

  const [dataSources, loaded, loadError] = useK8sWatchResource<V1beta1DataSource[]>({
    isList: true,
    kind,
    namespace,
    namespaced: true,
  });

  const filterDefinitions = useMemo(() => getDataImportCronFilter(t), [t]);
  const { clearAllFilters, filteredData, filters, onSetFilters } = useKubevirtDataViewFilters({
    data: dataSources ?? [],
    filterDefinitions,
  });

  const {
    handlePerPageSelect,
    handleSetPage,
    pagination,
    handleFilterChange: handleSetFilters,
  } = usePaginationWithFilters(filteredData?.length ?? 0, onSetFilters);

  const columns = useMemo(() => getDataSourceColumns(t, namespace), [t, namespace]);

  const { activeColumnKeys, loaded: loadedColumns } = useKubevirtTableColumns({
    columnManagementID: DataSourceModelRef,
    columns,
  });

  const columnLayout = useMemo(
    () => buildColumnLayout(columns, activeColumnKeys, DataSourceModelRef, t('DataSource')),
    [columns, activeColumnKeys, t],
  );

  const createItems = {
    form: t('With form'),
    yaml: t('With YAML'),
  };

  const onCreate = (type: string) => {
    return type === 'form'
      ? createModal((props) => <CreateDataSourceModal namespace={namespace} {...props} />)
      : navigate(`/k8s/ns/${namespace || DEFAULT_NAMESPACE}/${DataSourceModelRef}/~new`);
  };

  const isLoaded = loaded && loadedColumns;

  return (
    <>
      <ListPageHeader title={t('DataSources')}>
        <ListPageCreateDropdown
          createAccessReview={{ groupVersionKind: DataSourceModelRef, namespace: namespace }}
          items={createItems}
          onClick={onCreate}
        >
          {t('Create DataSource')}
        </ListPageCreateDropdown>
      </ListPageHeader>
      <ListPageBody>
        <div className="list-managment-group">
          <KubevirtFilterToolbar
            clearAllFilters={clearAllFilters}
            columnLayout={columnLayout}
            data={dataSources}
            filterDefinitions={filterDefinitions}
            filters={filters}
            loaded={isLoaded}
            onSetFilters={handleSetFilters}
            toolbarEndContent={
              <KubevirtTableExport
                activeColumnKeys={activeColumnKeys}
                columns={columns}
                data={filteredData ?? []}
                exportKey={EXPORT_TABLE_KEYS.DATASOURCES}
                loaded={isLoaded}
              />
            }
          />
          {!isEmpty(filteredData) && isLoaded && (
            <Pagination
              className="list-managment-group__pagination"
              isLastFullPageShown
              itemCount={filteredData?.length}
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
          ariaLabel={t('DataSources table')}
          columns={columns}
          data={filteredData ?? []}
          dataTest="datasources-list"
          getRowId={getDataSourceRowId}
          loaded={isLoaded}
          loadError={loadError}
          noDataMsg={t("You don't have any DataSources yet")}
          pagination={pagination}
          persistSortInUrl
          unfilteredData={dataSources}
        />
      </ListPageBody>
    </>
  );
};

export default DataSourcesList;
