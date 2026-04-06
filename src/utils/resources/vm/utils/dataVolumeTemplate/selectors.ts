import { V1beta1DataVolume } from '@kubevirt-ui-ext/kubevirt-api/containerized-data-importer';
import {
  V1beta1DataVolumeSourceHTTP,
  V1beta1DataVolumeSourceRef,
  V1DataVolumeTemplateSpec,
} from '@kubevirt-ui-ext/kubevirt-api/kubevirt';

export const getDataVolumeStorageClassName = (
  dataVolume: V1beta1DataVolume | V1DataVolumeTemplateSpec,
): string => dataVolume?.spec?.storage?.storageClassName;

export const getDataVolumePVCStorageClassName = (
  dataVolume: V1beta1DataVolume | V1DataVolumeTemplateSpec,
): string => dataVolume?.spec?.pvc?.storageClassName;

export const getDataVolumeStorageRequest = (
  dataVolume: V1beta1DataVolume | V1DataVolumeTemplateSpec,
): string => dataVolume?.spec?.storage?.resources?.requests?.storage;

export const getDataVolumePVCStorageRequest = (
  dataVolume: V1beta1DataVolume | V1DataVolumeTemplateSpec,
): string => dataVolume?.spec?.pvc?.resources?.requests?.storage;

export const getDataVolumeSourceRef = (
  dataVolume: V1beta1DataVolume | V1DataVolumeTemplateSpec,
): V1beta1DataVolumeSourceRef => dataVolume?.spec?.sourceRef;

export const getDataVolumeSourceHTTP = (
  dataVolume: V1beta1DataVolume | V1DataVolumeTemplateSpec,
): V1beta1DataVolumeSourceHTTP => dataVolume?.spec?.source?.http;

export const getDataVolumeSourceURL = (
  dataVolume: V1beta1DataVolume | V1DataVolumeTemplateSpec,
): string => dataVolume?.spec?.source?.http?.url;
