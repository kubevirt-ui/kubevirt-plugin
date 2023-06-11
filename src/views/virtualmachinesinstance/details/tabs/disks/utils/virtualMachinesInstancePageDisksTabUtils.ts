import byteSize from 'byte-size';

import { V1alpha1PersistentVolumeClaim, V1Disk } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { RowFilter } from '@openshift-console/dynamic-plugin-sdk';

export type DiskPresentation = {
  drive: string;
  interface: string;
  metadata: { [key: string]: any };
  name: string;
  namespace?: string;
  size?: string;
  source: string;
  storageClass?: string;
};

export type FileSystemPresentation = {
  diskName: string;
  fileSystemType: string;
  mountPoint: string;
  totalBytes: number;
  usedBytes: number;
};

export type DiskRaw = V1Disk & { pvc?: V1alpha1PersistentVolumeClaim };

export const diskTypes = {
  cdrom: 'CD-ROM',
  disk: 'Disk',
  floppy: 'Floppy',
  LUN: 'LUN',
};

const findDrive = (obj: DiskRaw) => {
  const type = Object.keys(diskTypes).find((driveType: string) =>
    Object.keys(obj).includes(driveType),
  );
  return type || 'disk';
};

export const convertBytes = (bytes: number) =>
  byteSize(bytes, {
    units: 'iec',
  });

export const diskStructureCreator = (disks: DiskRaw[]): DiskPresentation[] => {
  return disks?.map((device) => {
    return {
      drive: findDrive(device),
      interface: device?.[findDrive(device)]?.bus,
      metadata: { name: device?.name },
      name: device?.name,
      namespace: device?.pvc?.metadata?.namespace,
      size: device?.pvc?.spec?.resources?.requests?.storage,
      source: device?.pvc?.metadata?.name || 'Other',
      storageClass: device?.pvc?.spec?.storageClassName || '-',
    };
  });
};

export const filters: RowFilter[] = [
  {
    filter: (drives, obj) => {
      const status = obj?.drive;
      return (
        drives.selected?.length === 0 ||
        drives.selected?.includes(status) ||
        !drives?.all?.find((s) => s === status)
      );
    },
    filterGroupName: 'Disk Type',
    items: Object.keys(diskTypes).map((type) => ({
      id: type,
      title: diskTypes[type],
    })),
    reducer: (obj) => obj?.drive,
    type: 'disk-type',
  },
];
