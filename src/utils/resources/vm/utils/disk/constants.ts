import { V1beta1DataVolume } from '@kubevirt-ui/kubevirt-api/containerized-data-importer/models';
import { IoK8sApiCoreV1PersistentVolumeClaim } from '@kubevirt-ui/kubevirt-api/kubernetes';
import { V1DataVolumeTemplateSpec, V1Disk, V1Volume } from '@kubevirt-ui/kubevirt-api/kubevirt';

export type DiskRawData = {
  dataVolume?: V1beta1DataVolume;
  dataVolumeTemplate?: V1DataVolumeTemplateSpec;
  disk: V1Disk;
  pvc?: IoK8sApiCoreV1PersistentVolumeClaim;
  volume: V1Volume;
};

export type DiskRowDataLayout = {
  drive: string;
  hasDataVolume?: boolean;
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

export type DiskType = 'cdrom' | 'disk' | 'lun';

export const diskTypes: Record<string, DiskType> = {
  cdrom: 'cdrom',
  disk: 'disk',
  lun: 'lun',
};

export const diskTypesLabels = {
  cdrom: 'CD-ROM',
  disk: 'Disk',
  lun: 'LUN',
};

export const CDROM_DEVICE_NAME = 'cd-rom';
export const DISK_DEVICE_NAME = 'disk';
export const WINDOWS_DRIVERS_DISK = 'windows-drivers-disk';
export const VIRTIO_WIN_IMAGE = 'virtio-win-image';

export const VIRTIO_WIN_CONFIG_MAP_NAME = 'virtio-win';
// Different releases, different locations. Respect the order when resolving. Otherwise the configMap name/namespace is considered as well-known.
export const VIRTIO_WIN_CONFIG_MAP_NAMESPACES = ['openshift-cnv', 'kubevirt-hyperconverged'];

export const DEFAULT_WINDOWS_DRIVERS_DISK_IMAGE =
  'registry.redhat.io/container-native-virtualization/virtio-win';

export const EMPTY_DISK_IMAGE_PATTERNS = {
  BLANK: '',
  EMPTY: 'empty',
  SCRATCH: 'scratch',
} as const;
