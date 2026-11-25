import { ANNOTATIONS } from '@kubevirt-utils/resources/template';

import type { AddBootableVolumeState } from '../types';

import type { DataSourceMetadataFields, DataVolumeSpecFields } from './dataVolumeHelpers';

export const dataVolumeSpecFromCreateParams = (
  createParams: AddBootableVolumeState,
  name: string,
): DataVolumeSpecFields => ({
  accessMode: createParams.accessMode,
  labels: createParams.labels,
  name,
  size: createParams.size,
  storageClassName: createParams.storageClassName,
  volumeMode: createParams.volumeMode,
});

export const dataSourceMetadataFromCreateParams = (
  createParams: AddBootableVolumeState,
): DataSourceMetadataFields => ({
  annotations: createParams.annotations,
  isIso: createParams.isIso,
  labels: createParams.labels,
  name: createParams.bootableVolumeName,
});

export const descriptionAnnotations = (
  description?: string,
): DataSourceMetadataFields['annotations'] => {
  const trimmed = description?.trim();
  return trimmed ? { [ANNOTATIONS.description]: trimmed } : {};
};
