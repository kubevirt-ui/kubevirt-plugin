import React from 'react';

import { V1beta1DataSource } from '@kubevirt-ui/kubevirt-api/containerized-data-importer/models';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import {
  ListPageBody,
  ListPageFilter,
  ListPageHeader,
  useK8sWatchResource,
  useListPageFilter,
  VirtualizedTable,
} from '@openshift-console/dynamic-plugin-sdk';

import { useDataSourcesColumns } from './hooks/useDataSourcesColumns';
import { getDataImportCronFilter } from './DataSourcesListFilters';
import { DataSourcesListRow } from './DataSourcesListRow';

type DataSourcesListProps = {
  kind: string;
  namespace: string;
};

const DataSourcesList: React.FC<DataSourcesListProps> = ({ kind, namespace }) => {
  const { t } = useKubevirtTranslation();

  const [dataSources, loaded, loadError] = useK8sWatchResource<V1beta1DataSource[]>({
    kind,
    isList: true,
    namespaced: true,
    namespace,
  });
  const columns = useDataSourcesColumns();
  const filters = getDataImportCronFilter(t);
  const [unfilteredData, data, onFilterChange] = useListPageFilter(dataSources, filters);

  return (
    <>
      <ListPageHeader title={t('DataSources')} />
      <ListPageBody>
        <ListPageFilter
          data={unfilteredData}
          loaded={loaded}
          rowFilters={filters}
          onFilterChange={onFilterChange}
        />
        <VirtualizedTable<V1beta1DataSource>
          data={data}
          unfilteredData={unfilteredData}
          loaded={loaded}
          loadError={loadError}
          columns={columns}
          Row={DataSourcesListRow}
        />
      </ListPageBody>
    </>
  );
};

export default DataSourcesList;
