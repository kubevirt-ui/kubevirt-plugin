import { V1beta1DataVolume } from '@kubevirt-ui-ext/kubevirt-api/containerized-data-importer';
import { V1DataVolumeTemplateSpec } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';

export const getStorageClassName = (
  dataVolume: V1beta1DataVolume | V1DataVolumeTemplateSpec,
): string => dataVolume?.spec?.storage?.storageClassName;
