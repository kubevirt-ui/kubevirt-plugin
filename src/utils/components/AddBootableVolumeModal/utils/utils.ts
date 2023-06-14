import produce from 'immer';

import { DEFAULT_INSTANCETYPE_LABEL } from '@catalog/CreateFromInstanceTypes/utils/constants';
import { appendDockerPrefix } from '@catalog/customize/components/CustomizeSource/utils';
import DataImportCronModel from '@kubevirt-ui/kubevirt-api/console/models/DataImportCronModel';
import DataSourceModel from '@kubevirt-ui/kubevirt-api/console/models/DataSourceModel';
import DataVolumeModel from '@kubevirt-ui/kubevirt-api/console/models/DataVolumeModel';
import {
  V1beta1DataImportCron,
  V1beta1DataSource,
} from '@kubevirt-ui/kubevirt-api/containerized-data-importer/models';
import { UploadDataProps } from '@kubevirt-utils/hooks/useCDIUpload/useCDIUpload';
import { BootableVolume } from '@kubevirt-utils/resources/bootableresources/types';
import { buildOwnerReference } from '@kubevirt-utils/resources/shared';
import { DATA_SOURCE_CRONJOB_LABEL } from '@kubevirt-utils/resources/template';
import { getRandomChars } from '@kubevirt-utils/utils/utils';
import { k8sCreate } from '@openshift-console/dynamic-plugin-sdk';

import {
  AddBootableVolumeState,
  DROPDOWN_FORM_SELECTION,
  emptySourceDataVolume,
  initialDataImportCron,
} from './constants';

type createBootableVolumeType = (input: {
  bootableVolume: AddBootableVolumeState;
  namespace: string;
  onCreateVolume: (createdVolume: BootableVolume) => void;
  sourceType: DROPDOWN_FORM_SELECTION;
  uploadData: ({ dataVolume, file }: UploadDataProps) => Promise<void>;
}) => (dataSource: V1beta1DataSource) => Promise<V1beta1DataSource>;

export const createBootableVolume: createBootableVolumeType =
  ({ bootableVolume, namespace, onCreateVolume, sourceType, uploadData }) =>
  async (dataSource: V1beta1DataSource) => {
    const {
      annotations,
      bootableVolumeName,
      labels,
      pvcName,
      pvcNamespace,
      size,
      storageClassName,
      uploadFile,
    } = bootableVolume || {};

    const draftDataSource = produce(dataSource, (draftDS) => {
      draftDS.metadata.name = bootableVolumeName;
      draftDS.metadata.namespace = namespace;
      draftDS.metadata.annotations = annotations;
      draftDS.metadata.labels = labels;
    });

    if (sourceType === DROPDOWN_FORM_SELECTION.USE_REGISTRY) {
      const newDataSource = await createDataSourceWithImportCron(bootableVolume, draftDataSource);

      onCreateVolume?.(newDataSource);

      return newDataSource;
    }

    const isUploadForm = sourceType === DROPDOWN_FORM_SELECTION.UPLOAD_IMAGE;

    const bootableVolumeToCreate = produce(emptySourceDataVolume, (draftBootableVolume) => {
      draftBootableVolume.metadata.name = bootableVolumeName;
      draftBootableVolume.metadata.namespace = namespace;
      draftBootableVolume.spec.storage.resources.requests.storage = size;
      draftBootableVolume.metadata.labels = labels;

      if (storageClassName) {
        draftBootableVolume.spec.storage.storageClassName = storageClassName;
      }

      draftBootableVolume.spec.source = isUploadForm
        ? { upload: {} }
        : { pvc: { name: pvcName, namespace: pvcNamespace } };
    });

    const dataSourceToCreate = produce(draftDataSource, (draftDS) => {
      draftDS.spec.source = {
        pvc: {
          name: bootableVolumeToCreate.metadata.name,
          namespace: bootableVolumeToCreate.metadata.namespace,
        },
      };
    });

    isUploadForm
      ? await uploadData({
          dataVolume: bootableVolumeToCreate,
          file: uploadFile as File,
        })
      : await k8sCreate({ data: bootableVolumeToCreate, model: DataVolumeModel });

    const newDataSource = await k8sCreate({ data: dataSourceToCreate, model: DataSourceModel });

    onCreateVolume?.(newDataSource);

    return newDataSource;
  };

export const getInstanceTypeFromVolume = (bootableVolume: BootableVolume): string =>
  bootableVolume?.metadata?.labels?.[DEFAULT_INSTANCETYPE_LABEL] ?? '';

type CreateDataSourceWithImportCronType = (
  bootableVolume: AddBootableVolumeState,
  initialDataSource: V1beta1DataSource,
) => Promise<V1beta1DataSource>;

export const createDataSourceWithImportCron: CreateDataSourceWithImportCronType = async (
  bootableVolume,
  initialDataSource,
) => {
  const { bootableVolumeName, cronExpression, registryURL, retainRevisions, size } = bootableVolume;

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
