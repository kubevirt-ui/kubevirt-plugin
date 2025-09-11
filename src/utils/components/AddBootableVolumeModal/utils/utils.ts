import produce from 'immer';

import { DEFAULT_INSTANCETYPE_LABEL } from '@catalog/CreateFromInstanceTypes/utils/constants';
import DataImportCronModel from '@kubevirt-ui/kubevirt-api/console/models/DataImportCronModel';
import DataSourceModel from '@kubevirt-ui/kubevirt-api/console/models/DataSourceModel';
import DataVolumeModel from '@kubevirt-ui/kubevirt-api/console/models/DataVolumeModel';
import {
  V1beta1DataImportCron,
  V1beta1DataSource,
} from '@kubevirt-ui/kubevirt-api/containerized-data-importer/models';
import { V1beta1DataVolumeSource } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { OPENSHIFT_CNV } from '@kubevirt-utils/constants/constants';
import { UploadDataProps } from '@kubevirt-utils/hooks/useCDIUpload/useCDIUpload';
import { KUBEVIRT_ISO_LABEL } from '@kubevirt-utils/resources/bootableresources/constants';
import { BootableVolume } from '@kubevirt-utils/resources/bootableresources/types';
import { createUserPasswordSecret } from '@kubevirt-utils/resources/secret/utils';
import { buildOwnerReference, getName, getNamespace } from '@kubevirt-utils/resources/shared';
import { DATA_SOURCE_CRONJOB_LABEL } from '@kubevirt-utils/resources/template';
import { ARCHITECTURE_LABEL } from '@kubevirt-utils/utils/architecture';
import { MAX_K8S_NAME_LENGTH } from '@kubevirt-utils/utils/constants';
import { appendDockerPrefix, getRandomChars, isEmpty } from '@kubevirt-utils/utils/utils';
import { kubevirtK8sCreate, kubevirtK8sDelete } from '@multicluster/k8sRequests';

import {
  AddBootableVolumeState,
  DROPDOWN_FORM_SELECTION,
  emptySourceDataVolume,
  initialDataImportCron,
} from './constants';

export const formatRegistryURL = (registryURL: string) =>
  registryURL?.replace(/^(https?:\/\/)/i, '');

type CreateBootableVolumeType = (input: {
  bootableVolume: AddBootableVolumeState;
  onCreateVolume: (createdVolume: BootableVolume) => void;
  sourceType: DROPDOWN_FORM_SELECTION;
  uploadData: ({ dataVolume, file }: UploadDataProps) => Promise<void>;
}) => (dataSource: V1beta1DataSource) => Promise<V1beta1DataSource[]>;

const getBootableVolumePromise = ({
  arch,
  bootableVolume,
  dataSource,
  sourceType,
  uploadData,
}: {
  arch?: string;
  bootableVolume: AddBootableVolumeState;
  dataSource: V1beta1DataSource;
  sourceType: DROPDOWN_FORM_SELECTION;
  uploadData: ({ dataVolume, file }: UploadDataProps) => Promise<void>;
}) => {
  const { bootableVolumeNamespace } = bootableVolume;

  const draftDataSource = setDataSourceMetadata(
    bootableVolume,
    bootableVolumeNamespace,
    dataSource,
    arch,
  );

  const actionBySourceType: Record<string, () => Promise<V1beta1DataSource>> = {
    [DROPDOWN_FORM_SELECTION.UPLOAD_VOLUME]: () =>
      createBootableVolumeFromUpload(
        bootableVolume,
        bootableVolumeNamespace,
        draftDataSource,
        uploadData,
      ),
    [DROPDOWN_FORM_SELECTION.USE_EXISTING_PVC]: () =>
      createPVCBootableVolume(bootableVolume, bootableVolumeNamespace, draftDataSource),
    [DROPDOWN_FORM_SELECTION.USE_HTTP]: () =>
      createHTTPDataSource(bootableVolume, draftDataSource, bootableVolumeNamespace),
    [DROPDOWN_FORM_SELECTION.USE_REGISTRY]: () =>
      createDataSourceWithImportCron(bootableVolume, draftDataSource),
    [DROPDOWN_FORM_SELECTION.USE_SNAPSHOT]: () =>
      createSnapshotDataSource(bootableVolume, draftDataSource),
  };

  return actionBySourceType[sourceType]();
};

export const createBootableVolume: CreateBootableVolumeType =
  ({ bootableVolume, onCreateVolume, sourceType, uploadData }) =>
  async (dataSource: V1beta1DataSource) => {
    const architectures = bootableVolume?.architectures;

    if (!isEmpty(architectures)) {
      const dataSourcePromises = architectures?.map((arch) =>
        getBootableVolumePromise({ arch, bootableVolume, dataSource, sourceType, uploadData }),
      );

      const newDataSources = await Promise.all(dataSourcePromises);

      onCreateVolume?.(newDataSources?.[0]);

      return newDataSources;
    }

    const dataSourceWithoutArch = await getBootableVolumePromise({
      bootableVolume,
      dataSource,
      sourceType,
      uploadData,
    });

    onCreateVolume?.(dataSourceWithoutArch);

    return [dataSourceWithoutArch];
  };

export const getInstanceTypeFromVolume = (bootableVolume: BootableVolume): string =>
  bootableVolume?.metadata?.labels?.[DEFAULT_INSTANCETYPE_LABEL] ?? '';

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

type CreateDataSourceWithImportCronType = (
  bootableVolume: AddBootableVolumeState,
  initialDataSource: V1beta1DataSource,
) => Promise<V1beta1DataSource>;

const setDataSourceMetadata = (
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

const createBootableVolumeFromUpload = async (
  bootableVolume: AddBootableVolumeState,
  namespace: string,
  draftDataSource: V1beta1DataSource,
  uploadData: ({ dataVolume, file }: UploadDataProps) => Promise<void>,
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

  await uploadData({
    dataVolume: bootableVolumeToCreate,
    file: uploadFile as File,
  });

  return await kubevirtK8sCreate({
    cluster: bootableVolume.bootableVolumeCluster,
    data: dataSourceToCreate,
    model: DataSourceModel,
  });
};

const createHTTPDataSource = async (
  bootableVolume: AddBootableVolumeState,
  draftDataSource: V1beta1DataSource,
  namespace: string,
) => {
  const updatedNameBootableVolume = produce(bootableVolume, (draft) => {
    draft.bootableVolumeName = draftDataSource.metadata.name;
  });

  const bootableVolumeToCreate = getDataVolumeWithSource(updatedNameBootableVolume, namespace, {
    http: { url: bootableVolume.url },
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

const createSnapshotDataSource = async (
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
    ? `${bootableVolumeName}-registry-secret-${getRandomChars()}`.substring(0, MAX_K8S_NAME_LENGTH)
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

  const dataImportCronName = `${bootableVolumeName}-import-cron-${getRandomChars()}`;
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
