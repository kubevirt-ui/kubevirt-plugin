import produce from 'immer';
import { adjectives, uniqueNamesGenerator } from 'unique-names-generator';

import DataImportCronModel from '@kubevirt-ui/kubevirt-api/console/models/DataImportCronModel';
import DataSourceModel from '@kubevirt-ui/kubevirt-api/console/models/DataSourceModel';
import {
  V1beta1DataImportCron,
  V1beta1DataSource,
} from '@kubevirt-ui/kubevirt-api/containerized-data-importer/models';
import { CDI_BIND_REQUESTED_ANNOTATION } from '@kubevirt-utils/hooks/useCDIUpload/consts';
import { buildOwnerReference } from '@kubevirt-utils/resources/shared';
import { DATA_SOURCE_CRONJOB_LABEL } from '@kubevirt-utils/resources/template';
import { k8sCreate } from '@openshift-console/dynamic-plugin-sdk';

export const generateDataSourceName = (): string => {
  return `datasource-${uniqueNamesGenerator({
    dictionaries: [adjectives],
    separator: '-',
  })}`;
};

const initialDataSource: V1beta1DataSource = {
  apiVersion: 'cdi.kubevirt.io/v1beta1',
  kind: DataSourceModel.kind,
  metadata: {
    name: '',
    namespace: '',
    labels: {
      [DATA_SOURCE_CRONJOB_LABEL]: '',
    },
  },
  spec: {
    source: {},
  },
};

const initialDataImportCron: V1beta1DataImportCron = {
  apiVersion: 'cdi.kubevirt.io/v1beta1',
  kind: DataImportCronModel.kind,
  metadata: {
    name: '',
    namespace: '',
    annotations: {
      [CDI_BIND_REQUESTED_ANNOTATION]: 'true',
    },
  },
  spec: {
    managedDataSource: '',
    schedule: '',
    template: {
      spec: {},
    },
  },
};

export const createDataSourceWithImportCron = async ({
  name: dataSourceName,
  namespace,
  size,
  url,
  importsToKeep,
  schedule,
}: {
  name: string;
  namespace: string;
  url: string;
  size: string;
  importsToKeep: number;
  schedule: string;
}) => {
  const dataImportCronName = `${dataSourceName}-import-cron`;

  const createdDataSource = await k8sCreate<V1beta1DataSource>({
    model: DataSourceModel,
    data: produce(initialDataSource, (draft) => {
      draft.metadata.name = dataSourceName;
      draft.metadata.namespace = namespace;

      draft.metadata.labels = {
        [DATA_SOURCE_CRONJOB_LABEL]: dataImportCronName,
      };
    }),
  });

  const dataImportCron = produce(initialDataImportCron, (draft) => {
    draft.metadata.name = dataImportCronName;
    draft.metadata.namespace = namespace;
    draft.metadata.ownerReferences = [
      buildOwnerReference(createdDataSource, { blockOwnerDeletion: false }),
    ];

    draft.spec = {
      garbageCollect: 'Outdated',
      managedDataSource: dataSourceName,
      schedule,
      importsToKeep,
      template: {
        spec: {
          source: {
            registry: {
              url,
            },
          },
          storage: {
            resources: {
              requests: {
                storage: size,
              },
            },
          },
        },
      },
    };
  });

  await k8sCreate<V1beta1DataImportCron>({
    model: DataImportCronModel,
    data: dataImportCron,
  });
};
