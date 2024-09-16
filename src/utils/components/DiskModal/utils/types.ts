import { V1beta1DataVolume } from '@kubevirt-ui/kubevirt-api/containerized-data-importer/models';
import { IoK8sApiCoreV1PersistentVolumeClaim } from '@kubevirt-ui/kubevirt-api/kubernetes';
import {
  V1DataVolumeTemplateSpec,
  V1Disk,
  V1VirtualMachine,
  V1Volume,
} from '@kubevirt-ui/kubevirt-api/kubevirt';

export enum SourceTypes {
  BLANK = 'blank',
  CLONE_PVC = 'pvc',
  DATA_SOURCE = 'dataSource',
  EPHEMERAL = 'containerDisk',
  HTTP = 'http',
  OTHER = 'Other',
  PVC = 'persistentVolumeClaim', // Existing PVC
  REGISTRY = 'registry',
  UPLOAD = 'upload',
  VOLUME_SNAPSHOT = 'snapshot',
}

export enum InterfaceTypes {
  SATA = 'sata',
  SCSI = 'scsi',
  VIRTIO = 'virtio',
}

export enum VolumeTypes {
  CLOUD_INIT_CONFIG_DRIVE = 'cloudInitConfigDrive',
  CLOUD_INIT_NO_CLOUD = 'cloudInitNoCloud',
  CONFIG_MAP = 'configMap',
  CONTAINER_DISK = 'containerDisk',
  DATA_VOLUME = 'dataVolume',
  PERSISTENT_VOLUME_CLAIM = 'persistentVolumeClaim',
  SECRET = 'secret',
  SERVICE_ACCOUNT = 'serviceAccount',
}

export type V1DiskModalProps = {
  createDiskSource?: SourceTypes;
  createdPVCName?: string;
  editDiskName?: string;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (updatedVM: V1VirtualMachine) => Promise<V1VirtualMachine | void>;
  onUploadedDataVolume?: (dataVolume: V1beta1DataVolume) => void;
  vm: V1VirtualMachine;
};

export type V1SubDiskModalProps = V1DiskModalProps & {
  isCreated: boolean;
  pvc: IoK8sApiCoreV1PersistentVolumeClaim;
};

export type V1DiskFormState = {
  dataVolumeTemplate?: V1DataVolumeTemplateSpec;
  disk: V1Disk;
  expandPVCSize?: string;
  isBootSource: boolean;
  storageClassProvisioner?: string;
  storageProfileSettingsApplied?: boolean;
  uploadFile?: { file: File; filename: string };
  volume: V1Volume;
};
