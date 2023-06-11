import produce from 'immer';

import { DEFAULT_INSTANCETYPE_LABEL } from '@catalog/CreateFromInstanceTypes/utils/constants';
import DataSourceModel from '@kubevirt-ui/kubevirt-api/console/models/DataSourceModel';
import DataVolumeModel from '@kubevirt-ui/kubevirt-api/console/models/DataVolumeModel';
import { V1beta1DataSource } from '@kubevirt-ui/kubevirt-api/containerized-data-importer/models';
import { UploadDataProps } from '@kubevirt-utils/hooks/useCDIUpload/useCDIUpload';
import { BootableVolume } from '@kubevirt-utils/resources/bootableresources/types';
import { k8sCreate } from '@openshift-console/dynamic-plugin-sdk';

import { AddBootableVolumeState, emptySourceDataVolume } from './constants';

export const createBootableVolume =
  (
    bootableVolume: AddBootableVolumeState,
    uploadData: ({ dataVolume, file }: UploadDataProps) => Promise<void>,
    isUploadForm: boolean,
    cloneExistingPVC: boolean,
    onCreateVolume: (createdVolume: BootableVolume) => void,
  ) =>
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
      draftDS.metadata.annotations = annotations;
      draftDS.metadata.labels = labels;
    });

    if (!cloneExistingPVC && !isUploadForm) {
      const dataSourceToCreate = produce(draftDataSource, (draftDS) => {
        draftDS.spec.source = { pvc: { name: pvcName, namespace: pvcNamespace } };
      });
      return k8sCreate({ data: dataSourceToCreate, model: DataSourceModel });
    }

    const bootableVolumeToCreate = produce(emptySourceDataVolume, (draftBootableVolume) => {
      draftBootableVolume.metadata.name = bootableVolumeName;
      draftBootableVolume.spec.storage.resources.requests.storage = size;
      draftBootableVolume.metadata.labels = labels;
      if (storageClassName) {
        draftBootableVolume.spec.storage.storageClassName = storageClassName;
      }

      draftBootableVolume.spec.source = isUploadForm
        ? { upload: {} }
        : { pvc: { name: pvcName, namespace: pvcNamespace } };
    });

    isUploadForm
      ? await uploadData({
          dataVolume: bootableVolumeToCreate,
          file: uploadFile as File,
        })
      : await k8sCreate({ data: bootableVolumeToCreate, model: DataVolumeModel });

    const dataSourceToCreate = produce(draftDataSource, (draftDS) => {
      draftDS.spec.source = {
        pvc: {
          name: bootableVolumeToCreate.metadata.name,
          namespace: bootableVolumeToCreate.metadata.namespace,
        },
      };
    });

    const newDataSource = await k8sCreate({ data: dataSourceToCreate, model: DataSourceModel });

    onCreateVolume?.(newDataSource);
  };

export const getInstanceTypeFromVolume = (bootableVolume: BootableVolume): string =>
  bootableVolume?.metadata?.labels?.[DEFAULT_INSTANCETYPE_LABEL] ?? '';
