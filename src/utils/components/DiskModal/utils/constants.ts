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

export const DEFAULT_DISK_SIZE = '30Gi';
export const DEFAULT_CDROM_DISK_SIZE = '10Gi';

export const ISO_FILE_EXTENSION = '.iso';
export const ISO_FILTER_KEYWORDS = ['iso', 'cd', 'image'];
export const UPLOAD_SUFFIX = 'upload';

export const DiskModalBySource = {
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

export const modalsBySource = new Proxy(DiskModalBySource, {
  get(target, prop) {
    return target[prop] ?? OtherDiskModal;
  },
});

export const FORM_FIELD_UPLOAD_FILE = 'uploadFile';
export const UPLOAD_MODE_SELECT = 'select';
export const UPLOAD_MODE_UPLOAD = 'upload';
export const SELECT_ISO_FIELD_ID = 'select-iso';
export const FORM_FIELD_SELECTED_ISO = 'selectedISO';
export const FORM_FIELD_UPLOAD_MODE = 'uploadMode';
export const FORM_FIELD_UPLOAD_TYPE = 'uploadType';

export const HotPlugFeatures = {
  DeclarativeHotplugVolumes: 'DeclarativeHotplugVolumes',
  HotplugVolumes: 'HotplugVolumes',
};
