import {
  type V1DataVolumeTemplateSpec,
  type V1Disk,
  type V1GPU,
  type V1HostDevice,
  type V1Interface,
  type V1Network,
  type V1VirtualMachine,
  type V1Volume,
  type V1VolumeSnapshotStatus,
} from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { ROOTDISK } from '@kubevirt-utils/constants/constants';

import { getInstanceTypeMatcher } from './domainSelectors';

export const getNetworks = (vm: V1VirtualMachine): V1Network[] | undefined =>
  vm?.spec?.template?.spec?.networks;

export const getInterfaces = (vm: V1VirtualMachine): V1Interface[] | undefined =>
  vm?.spec?.template?.spec?.domain?.devices?.interfaces;

export const getInterface = (vm: V1VirtualMachine, ifaceName: string): V1Interface | undefined =>
  getInterfaces(vm)?.find((iface) => iface?.name === ifaceName);

export const getDisks = (vm: V1VirtualMachine): V1Disk[] | undefined =>
  vm?.spec?.template?.spec?.domain?.devices?.disks;

export const getShareableDisks = (vm: V1VirtualMachine): V1Disk[] | undefined =>
  getDisks(vm)?.filter((disk) => disk.shareable);

export const getVolumes = (vm: V1VirtualMachine): V1Volume[] | undefined =>
  vm?.spec?.template?.spec?.volumes;

export const getShareableVolumes = (vm: V1VirtualMachine): V1Volume[] => {
  const shareableDiskNames = new Set((getShareableDisks(vm) ?? []).map((disk) => disk.name));
  return (getVolumes(vm) ?? []).filter((volume) => shareableDiskNames.has(volume.name));
};

export const getGPUDevices = (vm: V1VirtualMachine): V1GPU[] =>
  vm?.spec?.template?.spec?.domain?.devices?.gpus ?? [];

export const getHostDevices = (vm: V1VirtualMachine): V1HostDevice[] =>
  vm?.spec?.template?.spec?.domain?.devices?.hostDevices ?? [];

export const getVolumeSnapshotStatuses = (
  vm: V1VirtualMachine,
): V1VolumeSnapshotStatus[] | undefined => vm?.status?.volumeSnapshotStatuses;

export const getDataVolumeTemplates = (vm: V1VirtualMachine): V1DataVolumeTemplateSpec[] =>
  vm?.spec?.dataVolumeTemplates ?? [];

export const getRootDataVolume = (vm: V1VirtualMachine): V1Volume | undefined => {
  const bootDisk = getBootDisk(vm);
  return getVolumes(vm)?.find((volume) => volume.name === bootDisk?.name);
};

export const getRootDataVolumeTemplateSpec = (
  vm: V1VirtualMachine,
): V1DataVolumeTemplateSpec | undefined => {
  const volume = getRootDataVolume(vm);
  return vm?.spec?.dataVolumeTemplates?.find(
    (dataVolume) => dataVolume?.metadata?.name === volume?.dataVolume?.name,
  );
};

export const getRootDiskSecretRef = (vm: V1VirtualMachine): string | undefined => {
  const dataVolumeTemplateSpec = getRootDataVolumeTemplateSpec(vm);
  return dataVolumeTemplateSpec?.spec?.source?.registry?.secretRef;
};

export const getRootDiskStorageRequests = (vm: V1VirtualMachine): string | undefined => {
  const dataVolumeTemplateSpec = getRootDataVolumeTemplateSpec(vm);
  return dataVolumeTemplateSpec?.spec?.storage?.resources?.requests?.storage?.toString();
};

export const getConfigMaps = (vm: V1VirtualMachine): V1Volume[] =>
  (getVolumes(vm) ?? []).filter((volume) => volume.configMap);

export const getSecrets = (vm: V1VirtualMachine): V1Volume[] =>
  (getVolumes(vm) ?? []).filter((volume) => volume.secret);

export const getServiceAccounts = (vm: V1VirtualMachine): V1Volume[] =>
  (getVolumes(vm) ?? []).filter((volume) => volume.serviceAccount);

export const getBootDisk = (vm: V1VirtualMachine): V1Disk | undefined => {
  const disks = getDisks(vm);
  const isInstanceTypeVM = Boolean(getInstanceTypeMatcher(vm));
  const hasRootDiskVolume = (getVolumes(vm) ?? []).some((volume) => volume.name === ROOTDISK);

  const defaultRootDisk = isInstanceTypeVM && hasRootDiskVolume ? { name: ROOTDISK } : disks?.[0];

  return (disks ?? [])
    .filter((disk) => disk.bootOrder)
    .reduce((lowestBootDisk, disk) => {
      return lowestBootDisk.bootOrder < disk.bootOrder ? lowestBootDisk : disk;
    }, defaultRootDisk);
};

export const getMachineType = (vm: V1VirtualMachine): string | undefined =>
  vm?.spec?.template?.spec?.domain?.machine?.type;
