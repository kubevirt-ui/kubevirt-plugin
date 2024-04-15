import { V1beta1DataVolume } from '@kubevirt-ui/kubevirt-api/containerized-data-importer/models';
import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';

export enum SourceTypes {
  BLANK = 'blank',
  CLONE_PVC = 'pvc',
  EPHEMERAL = 'containerDisk',
  HTTP = 'http',
  OTHER = 'Other',
  PVC = 'persistentVolumeClaim', // Existing PVC
  REGISTRY = 'registry',
  UPLOAD = 'upload',
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

export type DiskFormState = {
  [SourceTypes.CLONE_PVC]?: {
    pvcName: string;
    pvcNamespace: string;
  };
  [SourceTypes.EPHEMERAL]?: {
    url: string;
  };
  [SourceTypes.HTTP]?: {
    url: string;
  };
  [SourceTypes.PVC]?: {
    pvcName: string;
  };
  [SourceTypes.REGISTRY]?: {
    url: string;
  };
  [SourceTypes.UPLOAD]?: {
    uploadFile: File | string;
    uploadFilename?: string;
  };
  accessMode: string;
  diskInterface: string;
  diskName: string;
  diskSize: string;
  diskSource: SourceTypes;
  diskType: string;
  enablePreallocation: boolean;
  isBootSource: boolean;
  lunReservation?: boolean;
  sharable?: boolean;
  storageClass: string;
  storageClassProvisioner: string;
  storageProfileSettingsApplied: boolean;
  volumeMode: string;
};

export type DiskModalProps = {
  createOwnerReference?: boolean;
  headerText: string;
  initialFormData?: DiskFormState;
  isOpen: boolean;
  isTemplate?: boolean;
  onClose: () => void;
  onSubmit: (updatedVM: V1VirtualMachine) => Promise<V1VirtualMachine | void>;
  onUploadedDataVolume?: (dataVolume: V1beta1DataVolume) => void;
  vm: V1VirtualMachine;
};
