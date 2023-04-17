import produce from 'immer';

import {
  DEFAULT_INSTANCETYPE_LABEL,
  initialInstanceTypeState,
  InstanceTypeState,
} from '@catalog/CreateFromInstanceTypes/utils/constants';
import { getInstanceTypeState } from '@catalog/CreateFromInstanceTypes/utils/utils';
import DataSourceModel from '@kubevirt-ui/kubevirt-api/console/models/DataSourceModel';
import DataVolumeModel from '@kubevirt-ui/kubevirt-api/console/models/DataVolumeModel';
import {
  V1beta1DataSource,
  V1beta1DataVolumeSourcePVC,
} from '@kubevirt-ui/kubevirt-api/containerized-data-importer/models';
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

    const { name, namespace }: V1beta1DataVolumeSourcePVC = {
      name: bootableVolumeToCreate.metadata.name,
      namespace: bootableVolumeToCreate.metadata.namespace,
    };
    const dataSourceToCreate = produce(updatedDataSource, (draftDS) => {
      draftDS.spec.source = {
        pvc: { name, namespace },
      };
    });

    const newDataSource = await k8sCreate({ model: DataSourceModel, data: dataSourceToCreate });

    onSelectVolume?.(newDataSource);
  };

export const getInstanceTypeFromVolume = (dataSource: V1beta1DataSource): InstanceTypeState => {
  const defaultInstanceTypeName = dataSource?.metadata?.labels?.[DEFAULT_INSTANCETYPE_LABEL];
  return defaultInstanceTypeName
    ? getInstanceTypeState(defaultInstanceTypeName)
    : initialInstanceTypeState;
};
