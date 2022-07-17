import produce from 'immer';

import { ensurePath } from '@catalog/utils/WizardVMContext';
import DataImportCronModel from '@kubevirt-ui/kubevirt-api/console/models/DataImportCronModel';
import DataSourceModel from '@kubevirt-ui/kubevirt-api/console/models/DataSourceModel';
import {
  V1beta1DataImportCron,
  V1beta1DataSource,
} from '@kubevirt-ui/kubevirt-api/containerized-data-importer/models';
import { DATA_SOURCE_CRONJOB_LABEL } from '@kubevirt-utils/resources/template';
import { k8sCreate, k8sDelete, k8sPatch } from '@openshift-console/dynamic-plugin-sdk';

export const CRON_DOC_URL = 'https://www.redhat.com/sysadmin/automate-linux-tasks-cron';

export const onDataImportCronManageSubmit = async ({
  data: { url, importsToKeep, schedule, allowAutoUpdate },
  resources: { dataImportCron, dataSource },
}: {
  resources: {
    dataSource: V1beta1DataSource;
    dataImportCron: V1beta1DataImportCron;
  };
  data: {
    url: string;
    importsToKeep: number;
    schedule: string;
    allowAutoUpdate: boolean;
  };
}) => {
  const updateDataSourceLabel = async (
    dataSourceToUpdate: V1beta1DataSource,
    dataImportCronName: string,
  ) => {
    const updatedLabels = produce(dataSourceToUpdate.metadata.labels, (labels) => {
      if (dataImportCronName) {
        labels[DATA_SOURCE_CRONJOB_LABEL] = dataImportCronName;
      } else {
        delete labels[DATA_SOURCE_CRONJOB_LABEL];
      }
    });
    await k8sPatch({
      model: DataSourceModel,
      resource: dataSourceToUpdate,
      data: [
        {
          op: 'replace',
          path: '/metadata/labels',
          value: updatedLabels,
        },
      ],
    });
  };

  // remove DIC label from DS if allow automatic update is disabled
  try {
    if (!allowAutoUpdate && dataSource?.metadata?.labels?.[DATA_SOURCE_CRONJOB_LABEL]) {
      await updateDataSourceLabel(dataSource, null);
    }

    // update DIC label on DS if allow automatic update is enabled and DIC is not already set
    if (allowAutoUpdate && !dataSource?.metadata?.labels?.[DATA_SOURCE_CRONJOB_LABEL]) {
      await updateDataSourceLabel(dataSource, dataImportCron?.metadata?.name);
    }
  } catch (e) {
    return Promise.reject(e);
  }

  // now we can update the DIC. it is immutable, so we have to delete it if it exists and create a new one
  const updatedDataImportCron = produce(dataImportCron, (dic) => {
    ensurePath(dic, 'spec.template.spec.source.registry.url');

    // delete specific metadata fields from the DIC
    delete dic.metadata.resourceVersion;
    delete dic.metadata.creationTimestamp;
    delete dic.metadata.generation;
    delete dic.metadata.uid;

    dic.spec.template.spec.source.registry.url = url;
    dic.spec.importsToKeep = importsToKeep;
    dic.spec.schedule = schedule;
  });

  // first we need to validate the changes with a dry run
  try {
    await k8sCreate<V1beta1DataImportCron>({
      model: DataImportCronModel,
      queryParams: {
        dryRun: 'All',
        fieldManager: 'kubectl-create',
      },
      data: produce(updatedDataImportCron, (dic) => {
        dic.metadata.name = `${dataImportCron?.metadata?.name}-dry-run`;
      }),
    });
  } catch (e) {
    return Promise.reject(e);
  }
  try {
    await k8sDelete({
      model: DataImportCronModel,
      resource: dataImportCron,
      name: dataImportCron?.metadata?.name,
      ns: dataImportCron?.metadata?.namespace,
    });
    // we should not reject the promise if we failed to delete the DIC (it may not exist)
  } catch (e) {}

  try {
    return await k8sCreate<V1beta1DataImportCron>({
      model: DataImportCronModel,
      data: updatedDataImportCron,
    });
  } catch (e) {
    return Promise.reject(e);
  }
};
