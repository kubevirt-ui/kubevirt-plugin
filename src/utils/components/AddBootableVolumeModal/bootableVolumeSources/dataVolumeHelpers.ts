import produce from 'immer';

import {
  type V1beta1DataSource,
  type V1beta1DataVolume,
} from '@kubevirt-ui-ext/kubevirt-api/containerized-data-importer';
import { type V1beta1DataVolumeSource } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { ARCHITECTURE_LABEL } from '@kubevirt-utils/utils/architecture';
import { isEmpty } from '@kubevirt-utils/utils/utils';

import { emptySourceDataVolume } from '../consts';
import { type AddBootableVolumeState } from '../types';

export const getDataVolumeWithSource = (
  bootableVolume: AddBootableVolumeState,
  namespace: string,
  dataVolumeSource: V1beta1DataVolumeSource,
): V1beta1DataVolume => {
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
