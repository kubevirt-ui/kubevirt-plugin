import {
  V1alpha1PersistentVolumeClaim,
  V1DataVolumeTemplateSpec,
  V1Disk,
  V1Volume,
} from '@kubevirt-ui/kubevirt-api/kubevirt';

export type DiskRawData = {
  disk: V1Disk;
  volume: V1Volume;
  pvc?: V1alpha1PersistentVolumeClaim;
  dataVolumeTemplate?: V1DataVolumeTemplateSpec;
};

export type DiskRowDataLayout = {
  name: string;
  source: string;
  size: string;
  drive: string;
  interface: string;
  storageClass: string;
  metadata: { name: string };
  namespace?: string;
  isBootDisk: boolean;
  isEnvDisk: boolean;
};

export const diskTypes = {
  disk: 'disk',
  cdrom: 'cdrom',
  floppy: 'floppy',
  lun: 'lun',
};

export const diskTypesLabels = {
  disk: 'Disk',
  cdrom: 'CD-ROM',
  floppy: 'Floppy',
  lun: 'LUN',
};

export const WINDOWS_DRIVERS_DISK = 'windows-drivers-disk';
export const VIRTIO_WIN_IMAGE = 'virtio-win-image';

export const VIRTIO_WIN_CONFIG_MAP_NAME = 'virtio-win';
// Different releases, different locations. Respect the order when resolving. Otherwise the configMap name/namespace is considered as well-known.
export const VIRTIO_WIN_CONFIG_MAP_NAMESPACES = ['openshift-cnv', 'kubevirt-hyperconverged'];

export const DEFAULT_WINDOWS_DRIVERS_DISK_IMAGE =
  'registry.redhat.io/container-native-virtualization/virtio-win';
