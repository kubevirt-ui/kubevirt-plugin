import { IoK8sApiCoreV1PersistentVolumeClaim } from '@kubevirt-ui/kubevirt-api/kubernetes';
import { V1DataVolumeTemplateSpec, V1Disk, V1Volume } from '@kubevirt-ui/kubevirt-api/kubevirt';

export type DiskRawData = {
  dataVolumeTemplate?: V1DataVolumeTemplateSpec;
  disk: V1Disk;
  pvc?: IoK8sApiCoreV1PersistentVolumeClaim;
  volume: V1Volume;
};

export type DiskRowDataLayout = {
  drive: string;
  interface: string;
  isBootDisk: boolean;
  isEnvDisk: boolean;
  metadata: { name: string };
  name: string;
  namespace?: string;
  size: string;
  source: string;
  sourceStatus?: string;
  storageClass: string;
};

export const diskTypes = {
  cdrom: 'cdrom',
  disk: 'disk',
  lun: 'lun',
};

export const diskTypesLabels = {
  cdrom: 'CD-ROM',
  disk: 'Disk',
  lun: 'LUN',
};

export const WINDOWS_DRIVERS_DISK = 'windows-drivers-disk';
export const VIRTIO_WIN_IMAGE = 'virtio-win-image';

export const VIRTIO_WIN_CONFIG_MAP_NAME = 'virtio-win';
// Different releases, different locations. Respect the order when resolving. Otherwise the configMap name/namespace is considered as well-known.
export const VIRTIO_WIN_CONFIG_MAP_NAMESPACES = ['openshift-cnv', 'kubevirt-hyperconverged'];

export const DEFAULT_WINDOWS_DRIVERS_DISK_IMAGE =
  'registry.redhat.io/container-native-virtualization/virtio-win';
