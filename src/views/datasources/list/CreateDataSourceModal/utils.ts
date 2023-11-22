import produce from 'immer';

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

const initialDataSource: V1beta1DataSource = {
  apiVersion: 'cdi.kubevirt.io/v1beta1',
  kind: DataSourceModel.kind,
  metadata: {
    labels: {
      [DATA_SOURCE_CRONJOB_LABEL]: '',
    },
    name: '',
    namespace: '',
  },
  spec: {
    source: {},
  },
};

const initialDataImportCron: V1beta1DataImportCron = {
  apiVersion: 'cdi.kubevirt.io/v1beta1',
  kind: DataImportCronModel.kind,
  metadata: {
    annotations: {
      [CDI_BIND_REQUESTED_ANNOTATION]: 'true',
    },
    name: '',
    namespace: '',
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
  importsToKeep,
  name: dataSourceName,
  namespace,
  schedule,
  size,
  url,
}: {
  importsToKeep: number;
  name: string;
  namespace: string;
  schedule: string;
  size: string;
  url: string;
}) => {
  const dataImportCronName = `${dataSourceName}-import-cron`;
  const dataImportCron = produce(initialDataImportCron, (draft) => {
    draft.metadata.name = dataImportCronName;
    draft.metadata.namespace = namespace;
    draft.spec = {
      garbageCollect: 'Outdated',
      importsToKeep,
      managedDataSource: dataSourceName,
      schedule,
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
  // dry run to validate the DataImportCron
  await k8sCreate<V1beta1DataImportCron>({
    data: dataImportCron,
    model: DataImportCronModel,
    queryParams: {
      dryRun: 'All',
      fieldManager: 'kubectl-create',
    },
  });

  const createdDataSource = await k8sCreate<V1beta1DataSource>({
    data: produce(initialDataSource, (draft) => {
      draft.metadata.name = dataSourceName;
      draft.metadata.namespace = namespace;

      draft.metadata.labels = {
        [DATA_SOURCE_CRONJOB_LABEL]: dataImportCronName,
      };
    }),
    model: DataSourceModel,
  });

  await k8sCreate<V1beta1DataImportCron>({
    data: produce(dataImportCron, (draft) => {
      draft.metadata.ownerReferences = [
        buildOwnerReference(createdDataSource, { blockOwnerDeletion: false }),
      ];
    }),
    model: DataImportCronModel,
  });
};
