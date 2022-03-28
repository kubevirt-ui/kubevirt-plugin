import {
  V1alpha1PersistentVolumeClaim,
  V1Disk,
  V1Volume,
} from '@kubevirt-ui/kubevirt-api/kubevirt';

export type DiskRawData = {
  disk: V1Disk;
  volume: V1Volume;
  pvc?: V1alpha1PersistentVolumeClaim;
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
