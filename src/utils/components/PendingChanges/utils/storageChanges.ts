import differenceWith from 'lodash/differenceWith';
import isEqual from 'lodash/isEqual';

import {
  type V1VirtualMachine,
  type V1VirtualMachineInstance,
  type V1Volume,
} from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { getVolumes } from '@kubevirt-utils/resources/vm';
import { getVMIDisks, getVMIVolumes } from '@kubevirt-utils/resources/vmi/utils/selectors';
import { isEmpty } from '@kubevirt-utils/utils/utils';

import { getDisks } from '../../../resources/vm/utils/selectors';

export const getChangedEnvDisks = (
  vm: V1VirtualMachine,
  vmi: V1VirtualMachineInstance,
): string[] => {
  if (isEmpty(vm) || isEmpty(vmi)) {
    return [];
  }
  // to get env disks, we want to filter the volumes with configMap/ prop set
  const vmVolumes = getVolumes(vm)?.filter(
    (vol) => vol?.configMap ?? vol?.secret ?? vol?.serviceAccount,
  );
  const vmiVolumes = vmi?.spec?.volumes?.filter(
    (vol) => vol?.configMap ?? vol?.secret ?? vol?.serviceAccount,
  );

  const vmEnvDisksNames = vmVolumes?.map((vol) => vol?.name);
  const vmiEnvDisksNames = vmiVolumes?.map((vol) => vol?.name);
  // to get the changed disks, we want to intersect between the two name arrays
  // and get the disks that are NOT in the intersection
  const unchangedEnvDisks = vmEnvDisksNames?.filter((vmDiskName) =>
    vmiEnvDisksNames?.includes(vmDiskName),
  );
  const changedEnvDisks = [
    ...(vmEnvDisksNames?.filter((disk) => !unchangedEnvDisks?.includes(disk)) ?? []),
    ...(vmiEnvDisksNames?.filter((disk) => !unchangedEnvDisks?.includes(disk)) ?? []),
  ];

  return changedEnvDisks;
};

export const getChangedCDROMs = (vm: V1VirtualMachine, vmi: V1VirtualMachineInstance): string[] => {
  if (isEmpty(vm) || isEmpty(vmi)) {
    return [];
  }

  const vmDisks = getDisks(vm) ?? [];
  const vmiDisks = getVMIDisks(vmi) ?? [];
  const vmiDiskNames = vmiDisks?.map((disk) => disk.name);
  const vmChangedCDROMs = vmDisks.filter((disk) => disk.cdrom && !vmiDiskNames.includes(disk.name));

  return vmChangedCDROMs.map((disk) => `${disk.name}`);
};

export const getChangedVolumesHotplug = (
  vm: V1VirtualMachine,
  vmi: V1VirtualMachineInstance,
): V1Volume[] => {
  if (isEmpty(vm) || isEmpty(vmi)) {
    return [];
  }

  const differentVolumes = differenceWith(
    getVMIVolumes(vmi),
    getVolumes(vm),
    isEqual,
  ) as V1Volume[];

  if (!isEmpty(differentVolumes)) {
    const result = differentVolumes.filter((volume: V1Volume) => {
      const hasHotpluggableFlag =
        volume?.dataVolume?.hotpluggable || volume?.persistentVolumeClaim?.hotpluggable;

      if (volume?.dataVolume || volume?.persistentVolumeClaim) {
        return false;
      }

      return !!hasHotpluggableFlag;
    });
    return result;
  }
};
