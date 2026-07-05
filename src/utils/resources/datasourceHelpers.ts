import {
  V1beta1DataImportCron,
  V1beta1DataSource,
} from '@kubevirt-ui-ext/kubevirt-api/containerized-data-importer';

import { isDataSourceReady } from '../../views/datasources/utils';

import { getDataImportCronFromDataSource } from './bootableresources/helpers';
import { getStatusConditionReason } from './shared';
import {
  isDataSourceCloning,
  isDataSourceUploading,
} from './template/hooks/useVmTemplateSource/utils';

/**
 * function to get all V1beta1DataSource objects with condition type 'Ready' and status 'True'
 * @param dataSources list of DataSources to be filtered
 * @returns list of available/ready DataSources
 */
export const getAvailableDataSources = (dataSources: V1beta1DataSource[]): V1beta1DataSource[] =>
  dataSources?.filter((dataSource) => isDataSourceReady(dataSource));

export const isDataImportCronProgressing = (dataImportCron: V1beta1DataImportCron): boolean =>
  getStatusConditionReason(dataImportCron, 'UpToDate') === 'ImportProgressing';

/**
 * function to get all V1beta1DataSource objects with condition type 'Ready' and status 'True'
 * and/or also those with 'False' status but only 'CloneScheduled' or 'CloneInProgress' reason
 * @param dataSources list of DataSources to be filtered
 * @param dataImportCrons list of DataImportCrons related to DataSources
 * @returns list of available/ready/cloning DataSources
 */
export const getReadyOrCloningOrUploadingDataSources = (
  dataSources: V1beta1DataSource[],
  dataImportCrons: V1beta1DataImportCron[],
): V1beta1DataSource[] =>
  dataSources?.filter((dataSource) => {
    const dataImportCron = getDataImportCronFromDataSource(dataImportCrons, dataSource);

    return (
      isDataSourceReady(dataSource) ||
      isDataSourceCloning(dataSource) ||
      isDataSourceUploading(dataSource) ||
      isDataImportCronProgressing(dataImportCron)
    );
  });
