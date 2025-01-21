import { V1beta1DataVolume } from '@kubevirt-ui/kubevirt-api/containerized-data-importer/models';

export const getStorageClassName = (dataVolume: V1beta1DataVolume): string =>
  dataVolume?.spec?.storage?.storageClassName;
