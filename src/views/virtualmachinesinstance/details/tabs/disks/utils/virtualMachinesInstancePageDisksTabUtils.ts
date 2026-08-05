import { V1beta1PersistentVolumeClaim, V1Disk } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';

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

export type DiskRaw = V1Disk & { pvc?: V1beta1PersistentVolumeClaim };

export const diskTypes = {
  cdrom: 'CD-ROM',
  disk: 'Disk',
  LUN: 'LUN',
};

const findDrive = (obj: DiskRaw) => {
  const type = Object.keys(diskTypes).find((driveType: string) =>
    Object.keys(obj).includes(driveType),
  );
  return type || 'disk';
};

export const diskStructureCreator = (disks: DiskRaw[]): DiskPresentation[] => {
  return disks?.map((device) => {
    return {
      drive: findDrive(device),
      interface: device?.[findDrive(device)]?.bus,
      metadata: { name: device?.name },
      name: device?.name,
      namespace: device?.pvc?.metadata?.namespace,
      size: device?.pvc?.spec?.resources?.requests?.storage?.toString(),
      source: device?.pvc?.metadata?.name || 'Other',
      storageClass: device?.pvc?.spec?.storageClassName || '-',
    };
  });
};
