import produce from 'immer';

import {
  DEFAULT_INSTANCETYPE_LABEL,
  initialInstanceTypeState,
  InstanceTypeState,
} from '@catalog/CreateFromInstanceTypes/utils/constants';
import { BootableVolume } from '@catalog/CreateFromInstanceTypes/utils/types';
import { getInstanceTypeState } from '@catalog/CreateFromInstanceTypes/utils/utils';
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
    onSelectVolume: (selectedVolume: V1beta1DataSource) => void,
  ) =>
  async (dataSource: V1beta1DataSource) => {
    const {
      bootableVolumeName,
      bootableVolumeNamespace,
      size,
      annotations,
      labels,
      pvcName,
      pvcNamespace,
      uploadFile,
      storageClassName,
    } = bootableVolume || {};
    const draftDataSource = produce(dataSource, (draftDS) => {
      draftDS.metadata.name = bootableVolumeName;
      draftDS.metadata.namespace = bootableVolumeNamespace;
      draftDS.metadata.annotations = annotations;
      draftDS.metadata.labels = labels;
    });

    if (!cloneExistingPVC && !isUploadForm) {
      const dataSourceToCreate = produce(draftDataSource, (draftDS) => {
        draftDS.spec.source = { pvc: { name: pvcName, namespace: pvcNamespace } };
      });
      return k8sCreate({ model: DataSourceModel, data: dataSourceToCreate });
    }

    const bootableVolumeToCreate = produce(emptySourceDataVolume, (draftBootableVolume) => {
      draftBootableVolume.metadata.name = bootableVolumeName;
      draftBootableVolume.metadata.namespace = bootableVolumeNamespace;
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
          file: uploadFile as File,
          dataVolume: bootableVolumeToCreate,
        })
      : await k8sCreate({ model: DataVolumeModel, data: bootableVolumeToCreate });

    const dataSourceToCreate = produce(draftDataSource, (draftDS) => {
      draftDS.spec.source = {
        pvc: {
          name: bootableVolumeToCreate.metadata.name,
          namespace: bootableVolumeToCreate.metadata.namespace,
        },
      };
    });

    const newDataSource = await k8sCreate({ model: DataSourceModel, data: dataSourceToCreate });

    onSelectVolume?.(newDataSource);
  };

export const getInstanceTypeFromVolume = (bootableVolume: BootableVolume): InstanceTypeState => {
  const defaultInstanceTypeName = bootableVolume?.metadata?.labels?.[DEFAULT_INSTANCETYPE_LABEL];
  return defaultInstanceTypeName
    ? getInstanceTypeState(defaultInstanceTypeName)
    : initialInstanceTypeState;
};
