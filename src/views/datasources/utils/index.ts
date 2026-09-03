import {
  type V1beta1DataImportCron,
  type V1beta1DataSource,
} from '@kubevirt-ui-ext/kubevirt-api/containerized-data-importer';
import { getLabel } from '@kubevirt-utils/resources/shared';

const DATA_SOURCE_CRONJOB_LABEL = 'cdi.kubevirt.io/dataImportCron';
const DATA_SOURCE_PRIMARY_RESOURCE_LABEL = 'operator-sdk/primary-resource';
const DATA_SOURCE_SSP_OWNER_VALUE = 'openshift-cnv/ssp-kubevirt-hyperconverged';

export const isDataSourceReady = (dataSource: V1beta1DataSource): boolean | undefined =>
  dataSource?.status?.conditions?.some(
    (condition) => condition.type === 'Ready' && condition.status === 'True',
  );

export const getDataSourceCronJob = (dataSource: V1beta1DataSource): string | undefined =>
  getLabel(dataSource, DATA_SOURCE_CRONJOB_LABEL);

export const getDataSourceLastUpdated = (dataSource: V1beta1DataSource): string | undefined =>
  dataSource?.status?.conditions?.find((condition) => condition.type === 'Ready')
    ?.lastTransitionTime;

export const isDataImportCronAutoUpdated = (
  dataSource: V1beta1DataSource,
  dataImportCron: V1beta1DataImportCron,
): boolean => {
  const cronJob = getDataSourceCronJob(dataSource);
  return cronJob === dataImportCron?.metadata?.name;
};

export const isDataResourceOwnedBySSP = (
  dataResource: V1beta1DataImportCron | V1beta1DataSource,
): boolean => {
  return (
    dataResource?.metadata?.annotations?.[DATA_SOURCE_PRIMARY_RESOURCE_LABEL] ===
    DATA_SOURCE_SSP_OWNER_VALUE
  );
};
