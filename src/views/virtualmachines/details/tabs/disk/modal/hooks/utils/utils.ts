import { V1beta1CDIConfig } from '@kubevirt-ui/kubevirt-api/containerized-data-importer/models';
import { V1Volume } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { volumeTypes } from '@kubevirt-utils/components/DiskModal/DiskFormFields/utils/constants';

export const convertDataVolumeToPVC = (volume: V1Volume, cdiConfig: V1beta1CDIConfig): V1Volume => {
  const isDataVolumeGarbageCollector = cdiConfig?.spec?.dataVolumeTTLSeconds >= 0;
  const transformedDataVolumeToPVC = {
    [volumeTypes.PERSISTENT_VOLUME_CLAIM]: volume.dataVolume,
    name: volume.name,
  };
  return isDataVolumeGarbageCollector ? transformedDataVolumeToPVC : volume;
};
