import produce from 'immer';

import { DEFAULT_INSTANCETYPE_LABEL } from '@catalog/CreateFromInstanceTypes/utils/constants';
import DataImportCronModel from '@kubevirt-ui/kubevirt-api/console/models/DataImportCronModel';
import DataSourceModel from '@kubevirt-ui/kubevirt-api/console/models/DataSourceModel';
import DataVolumeModel from '@kubevirt-ui/kubevirt-api/console/models/DataVolumeModel';
import {
  V1beta1DataImportCron,
  V1beta1DataSource,
} from '@kubevirt-ui/kubevirt-api/containerized-data-importer/models';
import {
  V1beta1DataVolumeSource,
  V1beta1StorageSpecVolumeModeEnum,
} from '@kubevirt-ui/kubevirt-api/kubevirt';
import { UploadDataProps } from '@kubevirt-utils/hooks/useCDIUpload/useCDIUpload';
import { BootableVolume } from '@kubevirt-utils/resources/bootableresources/types';
import { buildOwnerReference } from '@kubevirt-utils/resources/shared';
import { DATA_SOURCE_CRONJOB_LABEL } from '@kubevirt-utils/resources/template';
import { ClaimPropertySets } from '@kubevirt-utils/types/storage';
import { appendDockerPrefix, getRandomChars } from '@kubevirt-utils/utils/utils';
import { k8sCreate } from '@openshift-console/dynamic-plugin-sdk';

import {
  AddBootableVolumeState,
  DROPDOWN_FORM_SELECTION,
  emptySourceDataVolume,
  initialDataImportCron,
} from './constants';

type createBootableVolumeType = (input: {
  applyStorageProfileSettings: boolean;
  bootableVolume: AddBootableVolumeState;
  claimPropertySets: ClaimPropertySets;
  namespace: string;
  onCreateVolume: (createdVolume: BootableVolume) => void;
  sourceType: DROPDOWN_FORM_SELECTION;
  uploadData: ({ dataVolume, file }: UploadDataProps) => Promise<void>;
}) => (dataSource: V1beta1DataSource) => Promise<V1beta1DataSource>;

export const createBootableVolume: createBootableVolumeType =
  ({
    applyStorageProfileSettings,
    bootableVolume,
    claimPropertySets,
    namespace,
    onCreateVolume,
    sourceType,
    uploadData,
  }) =>
  async (dataSource: V1beta1DataSource) => {
    const draftDataSource = setDataSourceMetadata(bootableVolume, namespace, dataSource);

    const actionBySourceType: Record<string, () => Promise<V1beta1DataSource>> = {
      [DROPDOWN_FORM_SELECTION.UPLOAD_IMAGE]: () =>
        createBootableVolumeFromUpload(
          bootableVolume,
          namespace,
          applyStorageProfileSettings,
          claimPropertySets,
          draftDataSource,
          uploadData,
        ),
      [DROPDOWN_FORM_SELECTION.USE_EXISTING_PVC]: () =>
        createPVCBootableVolume(
          bootableVolume,
          namespace,
          applyStorageProfileSettings,
          claimPropertySets,
          draftDataSource,
        ),
      [DROPDOWN_FORM_SELECTION.USE_REGISTRY]: () =>
        createDataSourceWithImportCron(bootableVolume, draftDataSource),
      [DROPDOWN_FORM_SELECTION.USE_SNAPSHOT]: () =>
        createSnapshotDataSource(bootableVolume, draftDataSource),
    };

    const newDataSource = await actionBySourceType[sourceType]();

    onCreateVolume?.(newDataSource);

    return newDataSource;
  };

export const getInstanceTypeFromVolume = (bootableVolume: BootableVolume): string =>
  bootableVolume?.metadata?.labels?.[DEFAULT_INSTANCETYPE_LABEL] ?? '';

const getDataVolumeWithSource = (
  bootableVolume: AddBootableVolumeState,
  applyStorageProfileSettings: boolean,
  claimPropertySets: ClaimPropertySets,
  namespace: string,
  dataVolumeSource: V1beta1DataVolumeSource,
) => {
  const { bootableVolumeName, labels, size, storageClassName } = bootableVolume || {};

  return produce(emptySourceDataVolume, (draftBootableVolume) => {
    draftBootableVolume.metadata.name = bootableVolumeName;
    draftBootableVolume.metadata.namespace = namespace;
    draftBootableVolume.spec.storage.resources.requests.storage = size;
    draftBootableVolume.metadata.labels = labels;

    if (storageClassName) {
      draftBootableVolume.spec.storage.storageClassName = storageClassName;
    }

    if (!applyStorageProfileSettings) {
      draftBootableVolume.spec.storage.accessModes = claimPropertySets?.[0]?.accessModes;
      draftBootableVolume.spec.storage.volumeMode = claimPropertySets?.[0]
        ?.volumeMode as V1beta1StorageSpecVolumeModeEnum;
    }

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
): V1beta1DataSource => {
  const { annotations, bootableVolumeName, labels } = bootableVolume || {};

  return produce(dataSource, (draftDS) => {
    draftDS.metadata.name = bootableVolumeName;
    draftDS.metadata.namespace = namespace;
    draftDS.metadata.annotations = annotations;
    draftDS.metadata.labels = labels;
  });
};

const createBootableVolumeFromUpload = async (
  bootableVolume: AddBootableVolumeState,
  namespace: string,
  applyStorageProfileSettings: boolean,
  claimPropertySets: ClaimPropertySets,
  draftDataSource: V1beta1DataSource,
  uploadData: ({ dataVolume, file }: UploadDataProps) => Promise<void>,
) => {
  const { uploadFile } = bootableVolume || {};

  const bootableVolumeToCreate = getDataVolumeWithSource(
    bootableVolume,
    applyStorageProfileSettings,
    claimPropertySets,
    namespace,
    { upload: {} },
  );

  const dataSourceToCreate = produce(draftDataSource, (draftDS) => {
    draftDS.spec.source = {
      pvc: {
        name: bootableVolumeToCreate.metadata.name,
        namespace: bootableVolumeToCreate.metadata.namespace,
      },
    };
  });
  await uploadData({
    dataVolume: bootableVolumeToCreate,
    file: uploadFile as File,
  });

  return await k8sCreate({ data: dataSourceToCreate, model: DataSourceModel });
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

  return await k8sCreate({ data: dataSourceToCreate, model: DataSourceModel });
};

const createPVCBootableVolume = async (
  bootableVolume: AddBootableVolumeState,
  namespace: string,
  applyStorageProfileSettings: boolean,
  claimPropertySets: ClaimPropertySets,
  draftDataSource: V1beta1DataSource,
) => {
  const { pvcName, pvcNamespace } = bootableVolume || {};

  const bootableVolumeToCreate = getDataVolumeWithSource(
    bootableVolume,
    applyStorageProfileSettings,
    claimPropertySets,
    namespace,
    { pvc: { name: pvcName, namespace: pvcNamespace } },
  );

  const dataSourceToCreate = produce(draftDataSource, (draftDS) => {
    draftDS.spec.source = {
      pvc: {
        name: bootableVolumeToCreate.metadata.name,
        namespace: bootableVolumeToCreate.metadata.namespace,
      },
    };
  });

  await k8sCreate({ data: bootableVolumeToCreate, model: DataVolumeModel });

  return await k8sCreate({ data: dataSourceToCreate, model: DataSourceModel });
};

export const createDataSourceWithImportCron: CreateDataSourceWithImportCronType = async (
  bootableVolume,
  initialDataSource,
) => {
  const {
    bootableVolumeName,
    cronExpression,
    registryURL,
    retainRevisions,
    size,
    storageClassName,
  } = bootableVolume;

  const dataImportCronName = `${bootableVolumeName}-import-cron-${getRandomChars()}`;
  const dataImportCron = produce(initialDataImportCron, (draft) => {
    draft.metadata.name = dataImportCronName;
    draft.metadata.namespace = initialDataSource?.metadata?.namespace;
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
  await k8sCreate<V1beta1DataImportCron>({
    data: dataImportCron,
    model: DataImportCronModel,
    queryParams: {
      dryRun: 'All',
      fieldManager: 'kubectl-create',
    },
  });

  const createdDataSource = await k8sCreate<V1beta1DataSource>({
    data: produce(initialDataSource, (draftDataSource) => {
      draftDataSource.metadata.labels[DATA_SOURCE_CRONJOB_LABEL] = dataImportCronName;
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

  return createdDataSource;
};
