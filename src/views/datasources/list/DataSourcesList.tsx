import React from 'react';
import { useHistory } from 'react-router-dom';

import { DataSourceModelRef } from '@kubevirt-ui/kubevirt-api/console';
import { V1beta1DataSource } from '@kubevirt-ui/kubevirt-api/containerized-data-importer/models';
import { useModal } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import {
  ListPageBody,
  ListPageCreateDropdown,
  ListPageFilter,
  ListPageHeader,
  useK8sWatchResource,
  useListPageFilter,
  VirtualizedTable,
} from '@openshift-console/dynamic-plugin-sdk';

import { CreateDataSourceModal } from './CreateDataSourceModal/CreateDataSourceModal';
import { useDataSourcesColumns } from './hooks/useDataSourcesColumns';
import { getDataImportCronFilter } from './DataSourcesListFilters';
import { DataSourcesListRow } from './DataSourcesListRow';

import './DataSourcesList.scss';

type DataSourcesListProps = {
  kind: string;
  namespace: string;
};

const DataSourcesList: React.FC<DataSourcesListProps> = ({ kind, namespace }) => {
  const { t } = useKubevirtTranslation();
  const { createModal } = useModal();
  const history = useHistory();

  const [dataSources, loaded, loadError] = useK8sWatchResource<V1beta1DataSource[]>({
    kind,
    isList: true,
    namespaced: true,
    namespace,
  });
  const [columns, activeColumns] = useDataSourcesColumns(namespace);
  const filters = getDataImportCronFilter(t);
  const [unfilteredData, data, onFilterChange] = useListPageFilter(dataSources, filters);

  const createItems = {
    form: t('With form'),
    yaml: t('With YAML'),
  };

  const onCreate = (type: string) =>
    type === 'form'
      ? createModal((props) => <CreateDataSourceModal namespace={namespace} {...props} />)
      : history.push(`/k8s/ns/${namespace || 'default'}/${DataSourceModelRef}/~new`);

  return (
    <>
      <ListPageHeader title={t('DataSources')}>
        <ListPageCreateDropdown items={createItems} onClick={onCreate}>
          {t('Create DataSource')}
        </ListPageCreateDropdown>
      </ListPageHeader>
      <ListPageBody>
        <ListPageFilter
          data={unfilteredData}
          loaded={loaded}
          rowFilters={filters}
          onFilterChange={onFilterChange}
          columnLayout={{
            columns: columns?.map(({ id, title, additional }) => ({
              id,
              title,
              additional,
            })),
            id: DataSourceModelRef,
            selectedColumns: new Set(activeColumns?.map((col) => col?.id)),
            type: t('DataSource'),
          }}
        />
        <VirtualizedTable<V1beta1DataSource>
          data={data}
          unfilteredData={unfilteredData}
          loaded={loaded}
          loadError={loadError}
          columns={activeColumns}
          Row={DataSourcesListRow}
        />
      </ListPageBody>
    </>
  );
};

export default DataSourcesList;
