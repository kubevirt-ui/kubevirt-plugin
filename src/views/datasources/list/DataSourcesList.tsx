import React from 'react';
import { useHistory } from 'react-router-dom';

import { DataSourceModelRef } from '@kubevirt-ui/kubevirt-api/console';
import { V1beta1DataSource } from '@kubevirt-ui/kubevirt-api/containerized-data-importer/models';
import { useModal } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import { DEFAULT_NAMESPACE } from '@kubevirt-utils/constants/constants';
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
    isList: true,
    kind,
    namespace,
    namespaced: true,
  });
  const [columns, activeColumns] = useDataSourcesColumns(namespace);
  const filters = getDataImportCronFilter();
  const [unfilteredData, data, onFilterChange] = useListPageFilter(dataSources, filters);

  const createItems = {
    form: t('With form'),
    yaml: t('With YAML'),
  };

  const onCreate = (type: string) => {
    return type === 'form'
      ? createModal((props) => <CreateDataSourceModal namespace={namespace} {...props} />)
      : history.push(`/k8s/ns/${namespace || DEFAULT_NAMESPACE}/${DataSourceModelRef}/~new`);
  };
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
        <ListPageFilter
          columnLayout={{
            columns: columns?.map(({ additional, id, title }) => ({
              additional,
              id,
              title,
            })),
            id: DataSourceModelRef,
            selectedColumns: new Set(activeColumns?.map((col) => col?.id)),
            type: t('DataSource'),
          }}
          data={unfilteredData}
          loaded={loaded}
          onFilterChange={onFilterChange}
          rowFilters={filters}
        />
        <VirtualizedTable<V1beta1DataSource>
          columns={activeColumns}
          data={data}
          loaded={loaded}
          loadError={loadError}
          Row={DataSourcesListRow}
          unfilteredData={unfilteredData}
        />
      </ListPageBody>
    </>
  );
};

export default DataSourcesList;
