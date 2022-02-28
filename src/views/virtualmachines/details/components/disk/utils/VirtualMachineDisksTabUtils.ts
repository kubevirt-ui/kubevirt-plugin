import {
  V1alpha1PersistentVolumeClaim,
  V1Disk,
  V1Volume,
} from '@kubevirt-ui/kubevirt-api/kubevirt';
import { RowFilter } from '@openshift-console/dynamic-plugin-sdk';

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
  disk: 'Disk',
  cdrom: 'CD-ROM',
  floppy: 'Floppy',
  lun: 'LUN',
};

export const filters: RowFilter[] = [
  {
    filterGroupName: 'Disk Type',
    type: 'disk-type',
    reducer: (obj) => obj?.drive,
    filter: (drives, obj) => {
      const drive = obj?.drive;
      return (
        drives.selected?.length === 0 ||
        drives.selected?.includes(drive) ||
        !drives?.all?.find((item) => item === drive)
      );
    },
    items: Object.keys(diskTypes).map((type) => ({
      id: diskTypes[type],
      title: diskTypes[type],
    })),
  },
];

export const getDiskDrive = (disk: V1Disk): string => {
  const drive = Object.keys(diskTypes).find((driveType: string) => disk[driveType] ?? 'disk');
  return drive;
};

export const getPrintableDiskDrive = (disk: V1Disk): string => diskTypes[getDiskDrive(disk)];

export const getDiskInterface = (disk: V1Disk): string => disk[getDiskDrive(disk)]?.bus;

export const getPrintableDiskInterface = (disk: V1Disk): string => {
  const diskInterface = getDiskInterface(disk);
  return diskInterface === 'virtio'
    ? diskInterface
    : diskInterface === 'scsi' || diskInterface === 'sata'
    ? diskInterface.toUpperCase()
    : '';
};

export const hasNumber = (rawSize: string): number => {
  const number = rawSize.match(/\d+/g);
  return Number(number);
};

export const hasSizeUnit = (rawSize: string): string => {
  const unit = rawSize.match(/[a-zA-Z]+/g);
  return unit?.[0];
};

export const formatBytes = (rawSize: string, unit?: string): string => {
  const size = hasNumber(rawSize);
  const sizeUnit = hasSizeUnit(rawSize) || unit;
  const sizeUnits = ['B', 'Ki', 'Mi', 'Gi', 'Ti'];
  let unitIndex = (sizeUnit && sizeUnits.findIndex((sUnit) => sUnit === sizeUnit)) || 0;
  let convertedSize = size;
  while (convertedSize >= 1024) {
    convertedSize = convertedSize / 1024;
    ++unitIndex;
  }

  const formattedSize = convertedSize.toFixed(2).concat(' ', sizeUnits[unitIndex]);
  return formattedSize;
};

export const getDiskRowDataLayout = (disks: DiskRawData[]): DiskRowDataLayout[] => {
  return disks?.map((device) => {
    const source = device?.pvc
      ? device?.pvc?.metadata?.name
      : device?.volume?.containerDisk
      ? 'Container (Ephemeral)'
      : 'Other';

    const size = device?.pvc
      ? formatBytes(device?.pvc?.spec?.resources?.requests?.storage)
      : device?.volume?.containerDisk
      ? 'Dynamic'
      : '-';

    const storageClass = device?.pvc?.spec?.storageClassName || '-';

    return {
      name: device?.disk?.name,
      source,
      size,
      storageClass,
      interface: getPrintableDiskInterface(device?.disk),
      drive: getPrintableDiskDrive(device?.disk),
      metadata: { name: device?.disk?.name },
      namespace: device?.pvc?.metadata?.namespace,
    };
  });
};
