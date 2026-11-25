import produce from 'immer';

import { DataImportCronModel, DataSourceModel } from '@kubevirt-ui-ext/kubevirt-api/console';
import {
  type V1beta1DataImportCron,
  type V1beta1DataSource,
} from '@kubevirt-ui-ext/kubevirt-api/containerized-data-importer';
import { OPENSHIFT_CNV } from '@kubevirt-utils/constants/constants';
import { createUserPasswordSecret } from '@kubevirt-utils/resources/secret/utils';
import { buildOwnerReference, getName, getNamespace } from '@kubevirt-utils/resources/shared';
import { DATA_SOURCE_CRONJOB_LABEL } from '@kubevirt-utils/resources/template';
import { appendDockerPrefix, getRandomChars, truncateToK8sName } from '@kubevirt-utils/utils/utils';
import { kubevirtK8sCreate } from '@multicluster/k8sRequests';

import { initialDataImportCron } from '../consts';

export type CreateRegistryBootableVolumeArgs = {
  cluster?: string;
  cronExpression?: string;
  draftDataSource: V1beta1DataSource;
  password?: string;
  registryURL?: string;
  retainRevisions?: number;
  size?: string;
  storageClassName?: string;
  username?: string;
};

export const createDataSourceWithImportCron = async ({
  cluster,
  cronExpression,
  draftDataSource,
  password,
  registryURL,
  retainRevisions,
  size,
  storageClassName,
  username,
}: CreateRegistryBootableVolumeArgs): Promise<V1beta1DataSource> => {
  const dataSourceName = getName(draftDataSource);
  const targetNamespace = getNamespace(draftDataSource);
  const addRegistrySecret = !!(username && password);
  const imageSecretName = addRegistrySecret
    ? truncateToK8sName(dataSourceName, `registry-secret-${getRandomChars()}`)
    : null;

  if (addRegistrySecret) {
    await createUserPasswordSecret({
      cluster,
      namespace: OPENSHIFT_CNV,
      password,
      secretName: imageSecretName,
      username,
    });

    await createUserPasswordSecret({
      cluster,
      namespace: targetNamespace,
      password,
      secretName: imageSecretName,
      username,
    });
  }

  const dataImportCronName = truncateToK8sName(dataSourceName, `import-cron-${getRandomChars()}`);

  const dataImportCron = produce(initialDataImportCron, (draft) => {
    draft.metadata.name = dataImportCronName;
    draft.metadata.namespace = targetNamespace;
    draft.spec = {
      garbageCollect: 'Outdated',
      importsToKeep: retainRevisions,
      managedDataSource: dataSourceName,
      schedule: cronExpression,
      template: {
        spec: {
          source: {
            registry: {
              url: appendDockerPrefix(registryURL),
              ...(addRegistrySecret && { secretRef: imageSecretName }),
            },
          },
          storage: {
            resources: {
              requests: {
                storage: size,
              },
            },
            storageClassName,
          },
        },
      },
    };
  });

  await kubevirtK8sCreate<V1beta1DataImportCron>({
    cluster,
    data: dataImportCron,
    model: DataImportCronModel,
    queryParams: {
      dryRun: 'All',
      fieldManager: 'kubectl-create',
    },
  });

  const createdDataSource = await kubevirtK8sCreate<V1beta1DataSource>({
    cluster,
    data: produce(draftDataSource, (draftDataSourceToCreate) => {
      draftDataSourceToCreate.metadata.labels[DATA_SOURCE_CRONJOB_LABEL] = dataImportCronName;
    }),
    model: DataSourceModel,
  });

  await kubevirtK8sCreate<V1beta1DataImportCron>({
    cluster,
    data: produce(dataImportCron, (draft) => {
      draft.metadata.ownerReferences = [
        buildOwnerReference(createdDataSource, { blockOwnerDeletion: false }),
      ];
    }),
    model: DataImportCronModel,
  });

  return createdDataSource;
};
