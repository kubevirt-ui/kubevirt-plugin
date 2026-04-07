import {
  V1beta1DataVolumeSourcePVC,
  V1Disk,
  V1VirtualMachine,
  V1VirtualMachineInstance,
  V1Volume,
} from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import {
  DataVolumeModelGroupVersionKind,
  modelToGroupVersionKind,
  PersistentVolumeClaimModel,
} from '@kubevirt-utils/models';
import { getName, getNamespace } from '@kubevirt-utils/resources/shared';
import { DiskRawData } from '@kubevirt-utils/resources/vm/utils/disk/constants';
import { getDiskDrive } from '@kubevirt-utils/resources/vm/utils/disk/selectors';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { getCluster } from '@multicluster/helpers/selectors';

import { getDataVolumeTemplates, getVolumes } from '../../utils';

const PersistentVolumeClaimGroupVersionKind = modelToGroupVersionKind(PersistentVolumeClaimModel);

export const getPVCAndDVWatches = (vm: V1VirtualMachine) => {
  const cluster = getCluster(vm);

  const pvcSources = getDataVolumeTemplates(vm)?.map((dataVolume) => ({
    name: getName(dataVolume),
    namespace: getNamespace(vm),
  }));

  pvcSources.push(
    ...(getVolumes(vm) || [])
      .map((volume) => volume?.persistentVolumeClaim?.claimName || volume?.dataVolume?.name)
      .filter((claimName) => Boolean(claimName))
      .map(
        (claimName) =>
          ({ name: claimName, namespace: getNamespace(vm) } as V1beta1DataVolumeSourcePVC),
      ),
  );

  const pvcWatches = pvcSources
    .filter((pvcSource) => !isEmpty(pvcSource))
    .reduce((acc, pvcSource) => {
      acc[`${pvcSource.name}-${pvcSource.namespace}`] = {
        cluster,
        groupVersionKind: PersistentVolumeClaimGroupVersionKind,
        name: pvcSource.name,
        namespace: pvcSource.namespace,
      };

      return acc;
    }, {});

  const dvWatches = pvcSources
    .filter((pvcSource) => !isEmpty(pvcSource))
    .reduce((acc, pvcSource) => {
      acc[`${pvcSource.name}-${pvcSource.namespace}`] = {
        cluster,
        groupVersionKind: DataVolumeModelGroupVersionKind,
        name: pvcSource.name,
        namespace: pvcSource.namespace,
      };

      return acc;
    }, {});

  return { dvWatches, pvcWatches };
};

export const getEjectedCDROMDrives = (diskDevices: DiskRawData[], vmDisks: V1Disk[]) => {
  const diskDevicesSet = new Set(diskDevices.map((obj) => obj.disk?.name).filter(Boolean));
  const ejectedCDROMDrives = (vmDisks || []).filter((obj) => !diskDevicesSet.has(obj.name));
  const mappedEjectedCDROMDrives = ejectedCDROMDrives.map((disk) => ({
    disk,
    volume: disk,
  }));
  return mappedEjectedCDROMDrives;
};

export const isStorageVolume = (volume: V1Volume) => {
  return Boolean(
    volume.dataVolume ||
      volume.persistentVolumeClaim ||
      volume.containerDisk ||
      volume.emptyDisk ||
      volume.cloudInitNoCloud ||
      volume.cloudInitConfigDrive,
  );
};

/**
 * KubeVirt may set the disk bus via admission webhooks or preferences,
 * meaning the VMI has bus info that the VM template spec does not.
 * This merges VMI bus info into VM disks that are missing it.
 * @param vmDiskList
 * @param vmi
 */
export const enrichDisksWithVMIBusInfo = (
  vmDiskList: V1Disk[],
  vmi: V1VirtualMachineInstance,
): V1Disk[] => {
  const vmiDisks = vmi?.spec?.domain?.devices?.disks || [];

  return vmDiskList.map((vmDisk) => {
    const driveType = getDiskDrive(vmDisk);
    if (vmDisk[driveType]?.bus) return vmDisk;

    const vmiDisk = vmiDisks.find(({ name }) => name === vmDisk.name);
    if (!vmiDisk) return vmDisk;

    const vmiDriveType = getDiskDrive(vmiDisk);
    const vmiBus = vmiDisk[vmiDriveType]?.bus;
    if (!vmiBus) return vmDisk;

    return {
      ...vmDisk,
      [driveType]: { ...vmDisk[driveType], bus: vmiBus },
    };
  });
};
