import byteSize from 'byte-size';

import { V1alpha1PersistentVolumeClaim, V1Disk } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { RowFilter } from '@openshift-console/dynamic-plugin-sdk';

export const ASC = 'asc';
export const DESC = 'desc';

export const columnsStringSorting =
  <T>(field: string) =>
  (data: Array<T>, direction: string) =>
    data?.sort((a, b) =>
      direction === ASC
        ? a?.[field]?.localeCompare(b?.[field])
        : b?.[field]?.localeCompare(a?.[field]),
    );

export const columnsNumberSorting =
  <T>(field: string) =>
  (data: Array<T>, direction: string) =>
    data?.sort((a, b) => {
      const valA = Number(a?.[field]) || 0;
      const valB = Number(b?.[field]) || 0;
      return direction === ASC ? valB - valA : valA - valB;
    });

export type DiskPresentation = {
  name: string;
  metadata: { [key: string]: any };
  interface: string;
  drive: string;
  source: string;
  storageClass?: string;
  size?: string;
  namespace?: string;
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
  disk: 'Disk',
  cdrom: 'CD-ROM',
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
      name: device?.name,
      metadata: { name: device?.name },
      interface: device?.[findDrive(device)]?.bus,
      drive: findDrive(device),
      source: device?.pvc?.metadata?.name || 'Other',
      storageClass: device?.pvc?.spec?.storageClassName || '-',
      size: device?.pvc?.spec?.resources?.requests?.storage,
      namespace: device?.pvc?.metadata?.namespace,
    };
  });
};

export const filters: RowFilter[] = [
  {
    filterGroupName: 'Disk Type',
    type: 'disk-type',
    reducer: (obj) => obj?.drive,
    filter: (drives, obj) => {
      const status = obj?.drive;
      return (
        drives.selected?.length === 0 ||
        drives.selected?.includes(status) ||
        !drives?.all?.find((s) => s === status)
      );
    },
    items: Object.keys(diskTypes).map((type) => ({
      id: type,
      title: diskTypes[type],
    })),
  },
];
