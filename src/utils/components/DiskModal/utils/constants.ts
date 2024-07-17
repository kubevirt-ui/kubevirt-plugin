/* eslint-disable require-jsdoc */
import { diskTypes } from '@kubevirt-utils/resources/vm/utils/disk/constants';

import BlankDiskModal from '../BlankDiskModal';
import ClonePVCDiskModal from '../ClonePVCDiskModal';
import ContainerDiskModal from '../ContainerDiskModal';
import HTTPDiskModal from '../HTTPDiskModal';
import OtherDiskModal from '../OtherDiskModal';
import PVCDiskModal from '../PVCDiskModal';
import RegistryDiskModal from '../RegistryDiskModal';
import UploadDiskModal from '../UploadDiskModal';
import { DiskFormState, InterfaceTypes, SourceTypes, VolumeTypes } from '../utils/types';

export const DEFAULT_DISK_SIZE = '30Gi';
export const DEFAULT_CDROM_DISK_SIZE = '10Gi';

export const getInitialStateDiskForm = (isRunning = false): Omit<DiskFormState, 'diskName'> => {
  return {
    accessMode: null,
    diskInterface: isRunning ? InterfaceTypes.SCSI : InterfaceTypes.VIRTIO,
    diskSize: DEFAULT_DISK_SIZE,
    diskSource: SourceTypes.BLANK,
    diskType: diskTypes.disk,
    enablePreallocation: false,
    isBootSource: false,
    lunReservation: false,
    sharable: false,
    storageClass: null,
    storageClassProvisioner: null,
    storageProfileSettingsApplied: true,
    volumeMode: null,
  };
};

export const mapSourceTypeToVolumeType = {
  [SourceTypes.BLANK]: VolumeTypes.DATA_VOLUME,
  [SourceTypes.CLONE_PVC]: VolumeTypes.DATA_VOLUME,
  [SourceTypes.EPHEMERAL]: VolumeTypes.CONTAINER_DISK,
  [SourceTypes.HTTP]: VolumeTypes.DATA_VOLUME,
  [SourceTypes.OTHER]: SourceTypes.OTHER,
  [SourceTypes.PVC]: VolumeTypes.PERSISTENT_VOLUME_CLAIM,
  [SourceTypes.REGISTRY]: VolumeTypes.DATA_VOLUME,
  [SourceTypes.UPLOAD]: VolumeTypes.PERSISTENT_VOLUME_CLAIM,
  [VolumeTypes.CLOUD_INIT_NO_CLOUD]: SourceTypes.OTHER,
  [VolumeTypes.CONFIG_MAP]: SourceTypes.OTHER,
  [VolumeTypes.DATA_VOLUME]: VolumeTypes.DATA_VOLUME,
  [VolumeTypes.SECRET]: SourceTypes.OTHER,
  [VolumeTypes.SERVICE_ACCOUNT]: SourceTypes.OTHER,
};

export const DiskModalBySource = {
  [SourceTypes.BLANK]: BlankDiskModal,
  [SourceTypes.CLONE_PVC]: ClonePVCDiskModal,
  [SourceTypes.EPHEMERAL]: ContainerDiskModal,
  [SourceTypes.HTTP]: HTTPDiskModal,
  [SourceTypes.PVC]: PVCDiskModal,
  [SourceTypes.REGISTRY]: RegistryDiskModal,
  [SourceTypes.UPLOAD]: UploadDiskModal,
};

export const modalsBySource = new Proxy(DiskModalBySource, {
  get(target, prop) {
    return target[prop] ?? OtherDiskModal;
  },
});
