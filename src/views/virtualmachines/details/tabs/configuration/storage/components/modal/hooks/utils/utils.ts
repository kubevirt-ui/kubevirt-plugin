import { V1beta1CDIConfig } from '@kubevirt-ui/kubevirt-api/containerized-data-importer/models';
import { V1Volume } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { VolumeTypes } from '@kubevirt-utils/components/DiskModal/utils/types';

export const convertDataVolumeToPVC = (volume: V1Volume, cdiConfig: V1beta1CDIConfig): V1Volume => {
  const isDataVolumeGarbageCollector = cdiConfig?.spec?.dataVolumeTTLSeconds !== -1;
  const transformedDataVolumeToPVC: V1Volume = {
    name: volume.name,
    [VolumeTypes.PERSISTENT_VOLUME_CLAIM]: {
      claimName: volume.dataVolume.name,
      hotpluggable: volume.dataVolume.hotpluggable,
    },
  };
  return isDataVolumeGarbageCollector ? transformedDataVolumeToPVC : volume;
};

export const getVolumeType = (volume: V1Volume): string => {
  const volumeType = Object.keys(volume)?.find((key: VolumeTypes) =>
    Object.values(VolumeTypes).includes(key),
  );
  return volumeType;
};

export const getVolumeResourceName = (volume: V1Volume): string => {
  const volumeType = getVolumeType(volume);
  switch (volumeType) {
    case VolumeTypes.PERSISTENT_VOLUME_CLAIM:
      return volume?.persistentVolumeClaim?.claimName;
    case VolumeTypes.DATA_VOLUME:
    case VolumeTypes.CONFIG_MAP:
      return volume?.[volumeType]?.name;
    case VolumeTypes.SECRET:
      return volume?.[volumeType]?.secretName;
    case VolumeTypes.SERVICE_ACCOUNT:
      return volume?.[volumeType]?.serviceAccountName;
    default:
      return null;
  }
};
