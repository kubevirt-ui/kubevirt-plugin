import { IoK8sApiCoreV1PersistentVolumeClaim } from '@kubevirt-ui-ext/kubevirt-api/kubernetes';
import {
  V1DataVolumeTemplateSpec,
  V1Disk,
  V1VirtualMachine,
  V1Volume,
} from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import {
  getPVCSize,
  getPVCStorageClassName,
} from '@kubevirt-utils/resources/bootableresources/selectors';
import { getName } from '@kubevirt-utils/resources/shared';
import {
  getBootDisk,
  getDataVolumeTemplates,
  getDisks,
  getVolumes,
} from '@kubevirt-utils/resources/vm';
import { NO_DATA_DASH } from '@kubevirt-utils/resources/vm/utils/constants';
import {
  getDataVolumePVCStorageClassName,
  getDataVolumePVCStorageRequest,
  getDataVolumeSourceRef,
  getDataVolumeSourceURL,
  getDataVolumeStorageClassName,
  getDataVolumeStorageRequest,
} from '@kubevirt-utils/resources/vm/utils/dataVolumeTemplate/selectors';
import { DiskRowDataLayout } from '@kubevirt-utils/resources/vm/utils/disk/constants';
import {
  getCDRom,
  getContainerDisk,
  getDataVolumeName,
  getEmptyDisk,
  getPrintableDiskDrive,
  getPrintableDiskInterface,
  getPVCClaimName,
} from '@kubevirt-utils/resources/vm/utils/disk/selectors';
import { getHumanizedSize } from '@kubevirt-utils/utils/units';
import { TFunction } from 'i18next';
import { DiskDevice, SourceNameByPriority } from './types';

const findVolumeForDisk = (disk: V1Disk, volumes: V1Volume[]): undefined | V1Volume =>
  volumes?.find(({ name }) => name === disk?.name);

const findPVCForVolume = (
  volume: V1Volume,
  pvcs: IoK8sApiCoreV1PersistentVolumeClaim[],
): IoK8sApiCoreV1PersistentVolumeClaim | undefined => {
  const claimName = volume?.persistentVolumeClaim?.claimName || volume?.dataVolume?.name;
  return pvcs?.find(({ metadata }) => metadata?.name === claimName);
};

const findDataVolumeTemplateForVolume = (
  volume: V1Volume,
  dataVolumeTemplates: V1DataVolumeTemplateSpec[],
): undefined | V1DataVolumeTemplateSpec =>
  dataVolumeTemplates?.find(({ metadata }) => metadata?.name === volume?.dataVolume?.name);

export const resolveDiskDevices = (
  vm: V1VirtualMachine,
  pvcs: IoK8sApiCoreV1PersistentVolumeClaim[],
): DiskDevice[] => {
  const disks = getDisks(vm);
  const volumes = getVolumes(vm);
  const dataVolumeTemplates = getDataVolumeTemplates(vm);

  return (disks || []).map((disk) => {
    const volume = findVolumeForDisk(disk, volumes);
    const pvc = findPVCForVolume(volume, pvcs);
    const dataVolumeTemplate = findDataVolumeTemplateForVolume(volume, dataVolumeTemplates);

    return { dataVolumeTemplate, disk, pvc, volume };
  });
};

const getDiskSize = (device: DiskDevice): string => {
  const size =
    getDataVolumeStorageRequest(device?.dataVolumeTemplate) ||
    getDataVolumePVCStorageRequest(device?.dataVolumeTemplate) ||
    getPVCSize(device?.pvc);

  return size ? getHumanizedSize(size).string : NO_DATA_DASH;
};

const getDiskStorageClass = (device: DiskDevice): string =>
  getDataVolumeStorageClassName(device?.dataVolumeTemplate) ||
  getDataVolumePVCStorageClassName(device?.dataVolumeTemplate) ||
  getPVCStorageClassName(device?.pvc) ||
  NO_DATA_DASH;

const isEnvironmentDisk = (volume: V1Volume): boolean =>
  !!volume?.configMap || !!volume?.secret || !!volume?.serviceAccount;

const getSourceNameByPriority = (device: DiskDevice, t: TFunction): SourceNameByPriority[] => [
  {
    sourceNamePriority: 1,
    isDeviceElementExists: Boolean(getDataVolumeSourceRef(device?.dataVolumeTemplate)),
    source: () => t('PVC (auto import)'),
  },
  {
    sourceNamePriority: 2,
    isDeviceElementExists: Boolean(getDataVolumeSourceURL(device?.dataVolumeTemplate)),
    source: () => t('URL'),
  },
  {
    sourceNamePriority: 3,
    isDeviceElementExists: Boolean(getContainerDisk(device?.volume)),
    source: () => t('Container (Ephemeral)'),
  },
  {
    sourceNamePriority: 4,
    isDeviceElementExists: Boolean(getPVCClaimName(device?.volume)),
    source: () => getPVCClaimName(device.volume),
  },
  {
    sourceNamePriority: 5,
    isDeviceElementExists: Boolean(getDataVolumeName(device?.volume)),
    source: () => getDataVolumeName(device.volume),
  },
  {
    sourceNamePriority: 6,
    isDeviceElementExists: Boolean(getEmptyDisk(device?.volume)) && Boolean(getCDRom(device?.disk)),
    source: () => t('Empty'),
  },
];

export const getSource = (device: DiskDevice, t: TFunction): string => {
  const sourceNamesByPriority = getSourceNameByPriority(device, t).sort(
    (a, b) => a.sourceNamePriority - b.sourceNamePriority,
  );
  const sourceName = sourceNamesByPriority
    .find(({ isDeviceElementExists }) => isDeviceElementExists)
    ?.source();

  if (sourceName) {
    return sourceName;
  }

  return getName(device?.pvc) || t('Other');
};

export const mapDiskDevicesToRows = (
  devices: DiskDevice[],
  vm: V1VirtualMachine,
  t: TFunction,
): DiskRowDataLayout[] =>
  devices.map((device) => ({
    drive: getPrintableDiskDrive(device?.disk),
    interface: getPrintableDiskInterface(device?.disk),
    isBootDisk: device?.disk?.name === getBootDisk(vm)?.name,
    isEnvDisk: isEnvironmentDisk(device?.volume),
    metadata: { name: device?.disk?.name },
    name: device?.disk?.name,
    namespace: device?.pvc?.metadata?.namespace,
    size: getDiskSize(device),
    source: getSource(device, t),
    storageClass: getDiskStorageClass(device),
  }));
