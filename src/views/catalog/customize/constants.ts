import {
  K8sIoApiCoreV1PersistentVolumeClaimSpec,
  V1beta1DataVolumeSpec,
  V1Disk,
  V1Volume,
} from '@kubevirt-ui/kubevirt-api/kubevirt';

export const DEFAULT_NAMESPACE = 'default';
export const NAME_INPUT_FIELD = 'NAME';

export const INSTALLATION_CDROM_NAME = 'installation-cdrom';
export const INSTALLATION_CDROM_VOLUME_NAME = 'installation-cdrom-volume';
export const INSTALLATION_CDROM_CAPACITY = '15Gi';

export const INSTALLATION_CDROM_DISK: V1Disk = {
  name: INSTALLATION_CDROM_NAME,
  cdrom: {
    bus: 'sata',
  },
};

export const INSTALLATION_CDROM_VOLUME: V1Volume = {
  name: INSTALLATION_CDROM_NAME,
  dataVolume: {
    name: INSTALLATION_CDROM_VOLUME_NAME,
  },
};

export const BLANK_SOURCE_FOR_INSTALLATION: V1beta1DataVolumeSpec = {
  source: {
    blank: {},
  },
};

export const INSTALLATION_CDROM_PVC: K8sIoApiCoreV1PersistentVolumeClaimSpec = {
  resources: {
    requests: {
      storage: INSTALLATION_CDROM_CAPACITY,
    },
  },
};

export const WINDOWS_DRIVERS_DISK = 'windows-drivers-disk';
export const VIRTIO_WIN_IMAGE = 'virtio-win-image';

export const VIRTIO_WIN_CONFIG_MAP_NAME = 'virtio-win';
// Different releases, different locations. Respect the order when resolving. Otherwise the configMap name/namespace is considered as well-known.
export const VIRTIO_WIN_CONFIG_MAP_NAMESPACES = ['openshift-cnv', 'kubevirt-hyperconverged'];

export const DEFAULT_WINDOWS_DRIVERS_DISK_IMAGE =
  'registry.redhat.io/container-native-virtualization/virtio-win';
