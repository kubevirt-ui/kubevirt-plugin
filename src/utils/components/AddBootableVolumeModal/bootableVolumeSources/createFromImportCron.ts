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
import { type CreateDataSourceWithImportCronType } from '../types';

export const createDataSourceWithImportCron: CreateDataSourceWithImportCronType = async (
  bootableVolume,
  initialDataSource,
) => {
  const {
    bootableVolumeCluster,
    cronExpression,
    registryCredentials,
    registryURL,
    retainRevisions,
    size,
    storageClassName,
  } = bootableVolume;

  const dataSourceName = getName(initialDataSource);
  const targetNamespace = getNamespace(initialDataSource);
  const { password, username } = registryCredentials ?? {};
  const addRegistrySecret = !!(username && password);
  const imageSecretName = addRegistrySecret
    ? truncateToK8sName(dataSourceName, `registry-secret-${getRandomChars()}`)
    : null;

  if (addRegistrySecret) {
    await createUserPasswordSecret({
      namespace: OPENSHIFT_CNV,
      password,
      secretName: imageSecretName,
      username,
    });

    await createUserPasswordSecret({
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
    cluster: bootableVolumeCluster,
    data: dataImportCron,
    model: DataImportCronModel,
    queryParams: {
      dryRun: 'All',
      fieldManager: 'kubectl-create',
    },
  });

  const createdDataSource = await kubevirtK8sCreate<V1beta1DataSource>({
    cluster: bootableVolumeCluster,
    data: produce(initialDataSource, (draftDataSource) => {
      draftDataSource.metadata.labels[DATA_SOURCE_CRONJOB_LABEL] = dataImportCronName;
    }),
    model: DataSourceModel,
  });

  await kubevirtK8sCreate<V1beta1DataImportCron>({
    cluster: bootableVolumeCluster,
    data: produce(dataImportCron, (draft) => {
      draft.metadata.ownerReferences = [
        buildOwnerReference(createdDataSource, { blockOwnerDeletion: false }),
      ];
    }),
    model: DataImportCronModel,
  });

  return createdDataSource;
};
