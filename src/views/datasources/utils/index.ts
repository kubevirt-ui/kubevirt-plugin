import { V1beta1DataSource } from '@kubevirt-ui/kubevirt-api/containerized-data-importer/models';

export const isDataSourceReady = (dataSource: V1beta1DataSource) =>
  dataSource?.status?.conditions?.some(
    (condition) => condition.type === 'Ready' && condition.status === 'True',
  );
