import {
  type V1beta1PersistentVolumeClaim,
  type V1Disk,
} from '@kubevirt-ui-ext/kubevirt-api/kubevirt';

export type DiskPresentation = {
  drive: string;
  interface: string;
  metadata: { name?: string };
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
  lun: 'LUN',
};

const findDrive = (obj: DiskRaw): string => {
  const type = Object.keys(diskTypes).find((driveType: string) =>
    Object.keys(obj).includes(driveType),
  );
  return type ?? 'disk';
};

const getDriveBus = (device: DiskRaw): string | undefined => {
  const drive = findDrive(device);
  if (drive === 'cdrom') {
    return device.cdrom?.bus;
  }
  if (drive === 'lun') {
    return device.lun?.bus;
  }
  return device.disk?.bus;
};

export const diskStructureCreator = (disks: DiskRaw[]): DiskPresentation[] => {
  return disks?.map((device) => {
    return {
      drive: findDrive(device),
      interface: getDriveBus(device),
      metadata: { name: device?.name },
      name: device?.name,
      namespace: device?.pvc?.metadata?.namespace,
      size: device?.pvc?.spec?.resources?.requests?.storage?.toString(),
      source: device?.pvc?.metadata?.name ?? 'Other',
      storageClass: device?.pvc?.spec?.storageClassName ?? '-',
    };
  });
};
