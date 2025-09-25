/* eslint-disable require-jsdoc */

import AddCDROMModal from '../AddCDROMModal';
import BlankDiskModal from '../BlankDiskModal';
import ClonePVCDiskModal from '../ClonePVCDiskModal';
import ContainerDiskModal from '../ContainerDiskModal';
import HTTPDiskModal from '../HTTPDiskModal';
import OtherDiskModal from '../OtherDiskModal';
import PVCDiskModal from '../PVCDiskModal';
import RegistryDiskModal from '../RegistryDiskModal';
import UploadDiskModal from '../UploadDiskModal';
import { SourceTypes } from '../utils/types';
import VolumeSnapshotDiskModal from '../VolumeSnapshotDiskModal';

const DiskModalBySource = {
  [SourceTypes.BLANK]: BlankDiskModal,
  [SourceTypes.CDROM]: AddCDROMModal,
  [SourceTypes.CLONE_PVC]: ClonePVCDiskModal,
  [SourceTypes.EPHEMERAL]: ContainerDiskModal,
  [SourceTypes.HTTP]: HTTPDiskModal,
  [SourceTypes.PVC]: PVCDiskModal,
  [SourceTypes.REGISTRY]: RegistryDiskModal,
  [SourceTypes.UPLOAD]: UploadDiskModal,
  [SourceTypes.VOLUME_SNAPSHOT]: VolumeSnapshotDiskModal,
};

export const getDiskModalBySource = new Proxy(DiskModalBySource, {
  get(target, prop) {
    return target[prop] ?? OtherDiskModal;
  },
});
