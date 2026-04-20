import React, { FCC, useMemo } from 'react';
import { useNavigate } from 'react-router';

import { DataSourceModelRef } from '@kubevirt-ui-ext/kubevirt-api/console';
import { V1beta1DataSource } from '@kubevirt-ui-ext/kubevirt-api/containerized-data-importer';
import KubevirtTable from '@kubevirt-utils/components/KubevirtTable/KubevirtTable';
import { buildColumnLayout } from '@kubevirt-utils/components/KubevirtTable/utils';
import ListPageFilter from '@kubevirt-utils/components/ListPageFilter/ListPageFilter';
import { useModal } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import { DEFAULT_NAMESPACE } from '@kubevirt-utils/constants/constants';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import useKubevirtTableColumns from '@kubevirt-utils/hooks/useKubevirtUserSettings/useKubevirtTableColumns';
import usePaginationWithFilters from '@kubevirt-utils/hooks/usePagination/usePaginationWithFilters';
import { paginationDefaultValues } from '@kubevirt-utils/hooks/usePagination/utils/constants';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import {
  ListPageBody,
  ListPageCreateDropdown,
  ListPageHeader,
  useK8sWatchResource,
  useListPageFilter,
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

const DataSourcesList: FCC<DataSourcesListProps> = ({ kind, namespace }) => {
  const { t } = useKubevirtTranslation();
  const { createModal } = useModal();
  const navigate = useNavigate();

  const [dataSources, loaded, loadError] = useK8sWatchResource<V1beta1DataSource[]>({
    isList: true,
    kind,
    namespace,
    namespaced: true,
  });

  const filters = getDataImportCronFilter(t);
  const [unfilteredData, filteredData, onFilterChange] = useListPageFilter(dataSources, filters);

  const { handleFilterChange, handlePerPageSelect, handleSetPage, pagination } =
    usePaginationWithFilters(filteredData?.length ?? 0, onFilterChange);

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
          <ListPageFilter
            columnLayout={columnLayout}
            data={unfilteredData}
            loaded={isLoaded}
            onFilterChange={handleFilterChange}
            rowFilters={filters}
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
          noDataMsg={t('No DataSources found')}
          pagination={pagination}
          unfilteredData={unfilteredData}
        />
      </ListPageBody>
    </>
  );
};

export default DataSourcesList;
