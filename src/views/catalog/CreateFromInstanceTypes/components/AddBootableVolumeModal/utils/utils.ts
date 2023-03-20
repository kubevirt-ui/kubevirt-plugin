import produce from 'immer';

import DataSourceModel from '@kubevirt-ui/kubevirt-api/console/models/DataSourceModel';
import DataVolumeModel from '@kubevirt-ui/kubevirt-api/console/models/DataVolumeModel';
import { V1beta1DataSource } from '@kubevirt-ui/kubevirt-api/containerized-data-importer/models';
import { UploadDataProps } from '@kubevirt-utils/hooks/useCDIUpload/useCDIUpload';
import { k8sCreate } from '@openshift-console/dynamic-plugin-sdk';

import { AddBootableVolumeState, emptySourceDataVolume } from './constants';

export const createDataSource =
  (
    bootableVolume: AddBootableVolumeState,
    uploadData: ({ file, dataVolume }: UploadDataProps) => Promise<void>,
    isUploadForm: boolean,
    cloneExistingPVC: boolean,
  ) =>
  (dataSource: V1beta1DataSource) => {
    const {
      bootableVolumeName,
      size,
      annotations,
      labels,
      pvcName,
      pvcNamespace,
      uploadFile,
      storageClassName,
    } = bootableVolume || {};
    const updatedDataSource = produce(dataSource, (draftDataSource) => {
      draftDataSource.metadata.name = bootableVolumeName;
      draftDataSource.metadata.annotations = annotations;
      draftDataSource.metadata.labels = labels;
    });

    if (!cloneExistingPVC && !isUploadForm) {
      const dataSourceToCreate = produce(updatedDataSource, (draftDS) => {
        draftDS.spec.source = { pvc: { name: pvcName, namespace: pvcNamespace } };
      });
      return k8sCreate({ model: DataSourceModel, data: dataSourceToCreate });
    }

    const bootableVolumeToCreate = produce(emptySourceDataVolume, (draftBootableVolume) => {
      draftBootableVolume.metadata.name = bootableVolumeName;
      draftBootableVolume.spec.storage.resources.requests.storage = size;
      if (storageClassName && isUploadForm) {
        draftBootableVolume.spec.storage.storageClassName = storageClassName;
      }

      draftBootableVolume.spec.source = isUploadForm
        ? { upload: {} }
        : { pvc: { name: pvcName, namespace: pvcNamespace } };
    });

    const promise = isUploadForm
      ? uploadData({
          file: uploadFile as File,
          dataVolume: bootableVolumeToCreate,
        })
      : k8sCreate({ model: DataVolumeModel, data: bootableVolumeToCreate });

    const dataSourceToCreate = produce(updatedDataSource, (draftDS) => {
      draftDS.spec.source = {
        pvc: {
          name: bootableVolumeToCreate.metadata.name,
          namespace: bootableVolumeToCreate.metadata.namespace,
        },
      };
    });

    return promise.then(() => k8sCreate({ model: DataSourceModel, data: dataSourceToCreate }));
  };
