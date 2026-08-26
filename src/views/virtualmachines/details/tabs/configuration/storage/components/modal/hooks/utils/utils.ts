import { type V1Volume } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { VolumeTypes } from '@kubevirt-utils/components/DiskModal/utils/types';

export const getVolumeType = (volume: V1Volume): string => {
  if (!volume) return null;
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
