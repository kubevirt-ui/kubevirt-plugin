import { V1beta1DataSource } from '@kubevirt-ui/kubevirt-api/containerized-data-importer/models';
import { getLabel } from '@kubevirt-utils/resources/shared';

const DATA_SOURCE_CRONJOB_LABEL = 'cdi.kubevirt.io/dataImportCron';

export const isDataSourceReady = (dataSource: V1beta1DataSource) =>
  dataSource?.status?.conditions?.some(
    (condition) => condition.type === 'Ready' && condition.status === 'True',
  );

export const getDataSourceCronJob = (dataSource: V1beta1DataSource) =>
  getLabel(dataSource, DATA_SOURCE_CRONJOB_LABEL);

export const getDataSourceLastUpdated = (dataSource: V1beta1DataSource) =>
  dataSource?.status?.conditions?.find((c) => c.type === 'Ready')?.lastTransitionTime;
