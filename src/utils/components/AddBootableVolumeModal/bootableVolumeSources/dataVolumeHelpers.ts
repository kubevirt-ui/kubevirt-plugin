import produce from 'immer';

import {
  type V1beta1DataSource,
  type V1beta1DataVolume,
  type V1beta1StorageSpecAccessModesEnum,
  type V1beta1StorageSpecVolumeModeEnum,
} from '@kubevirt-ui-ext/kubevirt-api/containerized-data-importer';
import { type V1beta1DataVolumeSource } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { KUBEVIRT_ISO_LABEL } from '@kubevirt-utils/resources/bootableresources/constants';
import { getLabels } from '@kubevirt-utils/resources/shared';
import { ARCHITECTURE_LABEL } from '@kubevirt-utils/utils/architecture';
import { isEmpty } from '@kubevirt-utils/utils/utils';

import {
  type DROPDOWN_FORM_SELECTION,
  emptySourceDataVolume,
  ISO_SUPPORTED_SOURCE_TYPES,
} from '../consts';

export type DataVolumeSpecFields = {
  accessMode?: V1beta1StorageSpecAccessModesEnum;
  labels?: { [key: string]: string };
  name: string;
  size?: string;
  storageClassName?: string;
  volumeMode?: V1beta1StorageSpecVolumeModeEnum;
};

export type DataSourceMetadataFields = {
  annotations?: { [key: string]: string };
  isIso?: boolean;
  labels?: { [key: string]: string };
  name: string;
};

export const getDataVolumeWithSource = (
  fields: DataVolumeSpecFields,
  namespace: string,
  dataVolumeSource: V1beta1DataVolumeSource,
): V1beta1DataVolume => {
  const { accessMode, labels, name, size, storageClassName, volumeMode } = fields;

  return produce(emptySourceDataVolume, (draftBootableVolume) => {
    draftBootableVolume.metadata.name = name;
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
  fields: DataSourceMetadataFields,
  namespace: string,
  dataSource: V1beta1DataSource,
  architecture: string,
  sourceType: DROPDOWN_FORM_SELECTION,
): V1beta1DataSource => {
  const { annotations, isIso, labels, name } = fields;
  const hasSelectedArchitecture = !isEmpty(architecture);

  return produce(dataSource, (draftDS) => {
    draftDS.metadata.name = hasSelectedArchitecture ? `${name}-${architecture}` : name;
    draftDS.metadata.namespace = namespace;
    draftDS.metadata.annotations = annotations;
    draftDS.metadata.labels = hasSelectedArchitecture
      ? { ...labels, [ARCHITECTURE_LABEL]: architecture }
      : labels;

    if (isIso && ISO_SUPPORTED_SOURCE_TYPES.includes(sourceType)) {
      draftDS.metadata.labels = {
        ...getLabels(draftDS, {}),
        [KUBEVIRT_ISO_LABEL]: 'true',
      };
    }
  });
};
