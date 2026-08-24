import produce from 'immer';

import { DataImportCronModel, DataSourceModel } from '@kubevirt-ui-ext/kubevirt-api/console';
import {
  type V1beta1DataImportCron,
  type V1beta1DataSource,
} from '@kubevirt-ui-ext/kubevirt-api/containerized-data-importer';
import { DATA_SOURCE_CRONJOB_LABEL } from '@kubevirt-utils/resources/template';
import { ensurePath, kubevirtConsole } from '@kubevirt-utils/utils/utils';
import { kubevirtK8sCreate, kubevirtK8sDelete, kubevirtK8sPatch } from '@multicluster/k8sRequests';

const updateDataSourceLabel = async (
  dataSourceToUpdate: V1beta1DataSource,
  dataImportCronName?: null | string,
): Promise<void> => {
  const existingLabels = dataSourceToUpdate.metadata?.labels ?? {};
  const updatedLabels = produce(existingLabels, (labels) => {
    if (dataImportCronName) {
      labels[DATA_SOURCE_CRONJOB_LABEL] = dataImportCronName;
    } else {
      delete labels[DATA_SOURCE_CRONJOB_LABEL];
    }
  });
  const hasLabels = !!dataSourceToUpdate.metadata?.labels;
  await kubevirtK8sPatch({
    data: [
      {
        op: hasLabels ? 'replace' : 'add',
        path: '/metadata/labels',
        value: updatedLabels,
      },
    ],
    model: DataSourceModel,
    resource: dataSourceToUpdate,
  });
};

export const onDataImportCronManageSubmit = async ({
  data: { allowAutoUpdate, importsToKeep, schedule, url },
  resources: { dataImportCron, dataSource },
}: {
  data: {
    allowAutoUpdate: boolean;
    importsToKeep: number;
    schedule: string;
    url: string;
  };
  resources: {
    dataImportCron: V1beta1DataImportCron;
    dataSource: V1beta1DataSource;
  };
}): Promise<V1beta1DataImportCron> => {
  try {
    if (!allowAutoUpdate && dataSource?.metadata?.labels?.[DATA_SOURCE_CRONJOB_LABEL]) {
      await updateDataSourceLabel(dataSource, null);
    }

    if (allowAutoUpdate && !dataSource?.metadata?.labels?.[DATA_SOURCE_CRONJOB_LABEL]) {
      await updateDataSourceLabel(dataSource, dataImportCron?.metadata?.name);
    }
  } catch (err) {
    return Promise.reject(err);
  }

  const updatedDataImportCron = produce(dataImportCron, (dic) => {
    ensurePath(dic, 'spec.template.spec.source.registry.url');

    delete dic.metadata.resourceVersion;
    delete dic.metadata.creationTimestamp;
    delete dic.metadata.generation;
    delete dic.metadata.uid;

    dic.spec.template.spec.source.registry.url = url;
    dic.spec.importsToKeep = importsToKeep;
    dic.spec.schedule = schedule;
  });

  try {
    await kubevirtK8sCreate<V1beta1DataImportCron>({
      data: produce(updatedDataImportCron, (dic) => {
        dic.metadata.name = `${dataImportCron?.metadata?.name}-dry-run`;
      }),
      model: DataImportCronModel,
      queryParams: {
        dryRun: 'All',
        fieldManager: 'kubectl-create',
      },
    });
  } catch (err) {
    return Promise.reject(err);
  }
  try {
    await kubevirtK8sDelete({
      model: DataImportCronModel,
      name: dataImportCron?.metadata?.name,
      ns: dataImportCron?.metadata?.namespace,
      resource: dataImportCron,
    });
  } catch (error) {
    kubevirtConsole.log('DIC deletion skipped:', error);
  }

  try {
    return await kubevirtK8sCreate<V1beta1DataImportCron>({
      data: updatedDataImportCron,
      model: DataImportCronModel,
    });
  } catch (err) {
    return Promise.reject(err);
  }
};
