import { TFunction } from 'i18next';
import produce from 'immer';

import { ConfigMapModel } from '@kubevirt-ui-ext/kubevirt-api/console';
import { DataImportCronModel } from '@kubevirt-ui-ext/kubevirt-api/console';
import { DataSourceModel } from '@kubevirt-ui-ext/kubevirt-api/console';
import { DataVolumeModel } from '@kubevirt-ui-ext/kubevirt-api/console';
import {
  V1beta1DataImportCron,
  V1beta1DataSource,
} from '@kubevirt-ui-ext/kubevirt-api/containerized-data-importer';
import { V1beta1DataVolumeSource } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { getOrCreateTLSCertConfigMapName } from '@kubevirt-utils/components/TLSCertificateSection';
import { OPENSHIFT_CNV } from '@kubevirt-utils/constants/constants';
import { UploadDataProps } from '@kubevirt-utils/hooks/useCDIUpload/types';
import {
  completeBootableVolumeUpload,
  failBootableVolumeUpload,
} from '@kubevirt-utils/hooks/useUploadProgressToast/completion/uploadCompletion';
import { getBootableVolumeUploadKey } from '@kubevirt-utils/hooks/useUploadProgressToast/keys/uploadKeys';
import { KUBEVIRT_ISO_LABEL } from '@kubevirt-utils/resources/bootableresources/constants';
import { createUserPasswordSecret } from '@kubevirt-utils/resources/secret/utils';
import { buildOwnerReference, getName, getNamespace } from '@kubevirt-utils/resources/shared';
import { DATA_SOURCE_CRONJOB_LABEL } from '@kubevirt-utils/resources/template';
import { ARCHITECTURE_LABEL } from '@kubevirt-utils/utils/architecture';
import {
  appendDockerPrefix,
  getRandomChars,
  isEmpty,
  truncateToK8sName,
} from '@kubevirt-utils/utils/utils';
import { kubevirtK8sCreate, kubevirtK8sDelete } from '@multicluster/k8sRequests';

import { emptySourceDataVolume, initialDataImportCron } from './consts';
import { AddBootableVolumeState, CreateDataSourceWithImportCronType } from './types';

const getDataVolumeWithSource = (
  bootableVolume: AddBootableVolumeState,
  namespace: string,
  dataVolumeSource: V1beta1DataVolumeSource,
) => {
  const { accessMode, bootableVolumeName, labels, size, storageClassName, volumeMode } =
    bootableVolume || {};

  return produce(emptySourceDataVolume, (draftBootableVolume) => {
    draftBootableVolume.metadata.name = bootableVolumeName;
    draftBootableVolume.metadata.namespace = namespace;
    draftBootableVolume.spec.storage.resources.requests.storage = size;
    draftBootableVolume.metadata.labels = labels;

    if (storageClassName) {
      draftBootableVolume.spec.storage.storageClassName = storageClassName;
    }

    draftBootableVolume.spec.storage.accessModes = accessMode ? [accessMode] : undefined;
    draftBootableVolume.spec.storage.volumeMode = volumeMode;

    draftBootableVolume.spec.source = dataVolumeSource;
  });
};

export const setDataSourceMetadata = (
  bootableVolume: AddBootableVolumeState,
  namespace: string,
  dataSource: V1beta1DataSource,
  architecture: string,
): V1beta1DataSource => {
  const { annotations, bootableVolumeName, labels } = bootableVolume || {};

  const hasSelectedArchitecture = !isEmpty(architecture);

  return produce(dataSource, (draftDS) => {
    draftDS.metadata.name = hasSelectedArchitecture
      ? `${bootableVolumeName}-${architecture}`
      : bootableVolumeName;
    draftDS.metadata.namespace = namespace;
    draftDS.metadata.annotations = annotations;
    draftDS.metadata.labels = hasSelectedArchitecture
      ? { ...labels, [ARCHITECTURE_LABEL]: architecture }
      : labels;
  });
};

export const createBootableVolumeFromUpload = async (
  bootableVolume: AddBootableVolumeState,
  namespace: string,
  draftDataSource: V1beta1DataSource,
  uploadData: ({ dataVolume, file }: UploadDataProps) => Promise<void>,
  t: TFunction,
) => {
  const { isIso, uploadFile } = bootableVolume || {};
  const updatedNameBootableVolume = produce(bootableVolume, (draft) => {
    draft.bootableVolumeName = draftDataSource.metadata.name;
  });
  const bootableVolumeToCreate = getDataVolumeWithSource(updatedNameBootableVolume, namespace, {
    upload: {},
  });

  const dataSourceToCreate = produce(draftDataSource, (draftDS) => {
    if (isIso) {
      draftDS.metadata.labels = {
        ...(draftDS.metadata.labels || {}),
        [KUBEVIRT_ISO_LABEL]: 'true',
      };
    }
    draftDS.spec.source = {
      pvc: {
        name: getName(bootableVolumeToCreate),
        namespace: getNamespace(bootableVolumeToCreate),
      },
    };
  });

  const volumeName = getName(dataSourceToCreate);
  const volumeNamespace = getNamespace(dataSourceToCreate);
  const uploadKey = getBootableVolumeUploadKey(volumeNamespace, volumeName);

  await uploadData({
    dataVolume: bootableVolumeToCreate,
    file: uploadFile as File,
    uploadKey,
    uploadTrackMetadata: {
      dvCluster: bootableVolume.bootableVolumeCluster,
      dvName: getName(bootableVolumeToCreate),
      dvNamespace: getNamespace(bootableVolumeToCreate),
      resourceName: volumeName,
    },
  });

  try {
    const createdDataSource = await kubevirtK8sCreate({
      cluster: bootableVolume.bootableVolumeCluster,
      data: dataSourceToCreate,
      model: DataSourceModel,
    });

    completeBootableVolumeUpload({ dataSource: createdDataSource, t, uploadKey });

    return createdDataSource;
  } catch (error) {
    failBootableVolumeUpload(uploadKey, error);
    throw error;
  }
};

export const createHTTPDataSource = async (
  bootableVolume: AddBootableVolumeState,
  draftDataSource: V1beta1DataSource,
  namespace: string,
) => {
  const updatedNameBootableVolume = produce(bootableVolume, (draft) => {
    draft.bootableVolumeName = draftDataSource.metadata.name;
  });

  const certConfigMapName = await getOrCreateTLSCertConfigMapName(
    {
      cluster: bootableVolume.bootableVolumeCluster,
      tlsCertConfigMapName: bootableVolume.tlsCertConfigMapName,
      tlsCertificate: bootableVolume.tlsCertificate,
      tlsCertificateRequired: bootableVolume.tlsCertificateRequired,
      tlsCertProject: bootableVolume.tlsCertProject,
      tlsCertSource: bootableVolume.tlsCertSource,
    },
    namespace,
  );

  const httpSource: V1beta1DataVolumeSource['http'] = {
    url: bootableVolume.url,
    ...(certConfigMapName && { certConfigMap: certConfigMapName }),
  };

  const bootableVolumeToCreate = getDataVolumeWithSource(updatedNameBootableVolume, namespace, {
    http: httpSource,
  });

  const dataSourceToCreate = produce(draftDataSource, (draftDS) => {
    draftDS.spec.source = {
      pvc: {
        name: getName(bootableVolumeToCreate),
        namespace: getNamespace(bootableVolumeToCreate),
      },
    };
  });

  const createdDS = await kubevirtK8sCreate({
    cluster: bootableVolume.bootableVolumeCluster,
    data: dataSourceToCreate,
    model: DataSourceModel,
    ns: namespace,
  });

  try {
    await kubevirtK8sCreate({
      cluster: bootableVolume.bootableVolumeCluster,
      data: bootableVolumeToCreate,
      model: DataVolumeModel,
      ns: namespace,
    });
  } catch (error) {
    const cleanups: Promise<unknown>[] = [
      kubevirtK8sDelete({
        cluster: bootableVolume.bootableVolumeCluster,
        model: DataSourceModel,
        resource: createdDS,
      }),
    ];
    if (certConfigMapName) {
      cleanups.push(
        kubevirtK8sDelete({
          cluster: bootableVolume.bootableVolumeCluster,
          model: ConfigMapModel,
          resource: { metadata: { name: certConfigMapName, namespace } },
        }),
      );
    }
    await Promise.allSettled(cleanups);
    throw error;
  }
  return createdDS;
};

export const createSnapshotDataSource = async (
  bootableVolume: AddBootableVolumeState,
  draftDataSource: V1beta1DataSource,
) => {
  const dataSourceToCreate = produce(draftDataSource, (draftDS) => {
    draftDS.spec.source = {
      snapshot: {
        name: bootableVolume.snapshotName,
        namespace: bootableVolume.snapshotNamespace,
      },
    };
  });

  return await kubevirtK8sCreate({ data: dataSourceToCreate, model: DataSourceModel });
};

export const createPVCBootableVolume = async (
  bootableVolume: AddBootableVolumeState,
  namespace: string,
  draftDataSource: V1beta1DataSource,
) => {
  const { pvcName, pvcNamespace } = bootableVolume || {};

  const updatedNameBootableVolume = produce(bootableVolume, (draft) => {
    draft.bootableVolumeName = draftDataSource.metadata.name;
  });

  const bootableVolumeToCreate = getDataVolumeWithSource(updatedNameBootableVolume, namespace, {
    pvc: { name: pvcName, namespace: pvcNamespace },
  });

  const dataSourceToCreate = produce(draftDataSource, (draftDS) => {
    draftDS.spec.source = {
      pvc: {
        name: getName(bootableVolumeToCreate),
        namespace: getNamespace(bootableVolumeToCreate),
      },
    };
  });

  const createdDS = await kubevirtK8sCreate({
    cluster: bootableVolume.bootableVolumeCluster,
    data: dataSourceToCreate,
    model: DataSourceModel,
  });

  try {
    await kubevirtK8sCreate({
      cluster: bootableVolume.bootableVolumeCluster,
      data: bootableVolumeToCreate,
      model: DataVolumeModel,
    });
  } catch (error) {
    kubevirtK8sDelete({
      cluster: bootableVolume.bootableVolumeCluster,
      model: DataSourceModel,
      resource: createdDS,
    });
    throw error;
  }
  return createdDS;
};

export const createDataSourceWithImportCron: CreateDataSourceWithImportCronType = async (
  bootableVolume,
  initialDataSource,
) => {
  const {
    bootableVolumeCluster,
    bootableVolumeName,
    cronExpression,
    registryCredentials,
    registryURL,
    retainRevisions,
    size,
    storageClassName,
  } = bootableVolume;

  const targetNamespace = getNamespace(initialDataSource);
  const { password, username } = registryCredentials || {};
  const addRegistrySecret = !!(username && password);
  const imageSecretName = addRegistrySecret
    ? truncateToK8sName(bootableVolumeName, `registry-secret-${getRandomChars()}`)
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

  const dataImportCronName = truncateToK8sName(
    bootableVolumeName,
    `import-cron-${getRandomChars()}`,
  );

  const dataImportCron = produce(initialDataImportCron, (draft) => {
    draft.metadata.name = dataImportCronName;
    draft.metadata.namespace = targetNamespace;
    draft.spec = {
      garbageCollect: 'Outdated',
      importsToKeep: retainRevisions,
      managedDataSource: bootableVolumeName,
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

  // dry run to validate the DataImportCron
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
