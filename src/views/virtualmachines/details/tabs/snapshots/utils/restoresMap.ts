import {
  type V1beta1VirtualMachineRestore,
  type V1beta1VirtualMachineSnapshot,
} from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { getName, getUID } from '@kubevirt-utils/resources/shared';

import { getVmRestoreSnapshotName, getVmRestoreTime } from './selectors';

export const getVmRestoreTargetName = (restore: V1beta1VirtualMachineRestore): string | undefined =>
  restore?.spec?.target?.name;

const isNewerRestore = (
  currentRestore: V1beta1VirtualMachineRestore,
  existingRestore: V1beta1VirtualMachineRestore | undefined,
): boolean => {
  if (!existingRestore) {
    return true;
  }

  const currentRestoreTime = getVmRestoreTime(currentRestore);
  const existingRestoreTime = getVmRestoreTime(existingRestore);

  if (!existingRestoreTime && currentRestoreTime) {
    return true;
  }

  if (!currentRestoreTime || !existingRestoreTime) {
    return false;
  }

  return new Date(existingRestoreTime).getTime() < new Date(currentRestoreTime).getTime();
};

export const isRestoreForSnapshot = (
  restore: V1beta1VirtualMachineRestore,
  snapshot: V1beta1VirtualMachineSnapshot,
  vmName: string,
): boolean => {
  const restoreTime = getVmRestoreTime(restore);
  const snapshotCreated = snapshot?.metadata?.creationTimestamp;

  if (!restoreTime || !snapshotCreated) {
    return false;
  }

  if (getVmRestoreTargetName(restore) !== vmName) {
    return false;
  }

  if (getVmRestoreSnapshotName(restore) !== getName(snapshot)) {
    return false;
  }

  return new Date(restoreTime).getTime() >= new Date(snapshotCreated).getTime();
};

export const buildRestoresMap = (
  snapshots: V1beta1VirtualMachineSnapshot[],
  restores: V1beta1VirtualMachineRestore[] | undefined,
  vmName: string,
): Record<string, V1beta1VirtualMachineRestore> =>
  snapshots.reduce<Record<string, V1beta1VirtualMachineRestore>>((map, snapshot) => {
    const snapshotUID = getUID(snapshot);
    if (!snapshotUID) {
      return map;
    }

    const latestRestore = (restores ?? [])
      .filter((restore) => isRestoreForSnapshot(restore, snapshot, vmName))
      .reduce<V1beta1VirtualMachineRestore | undefined>((latest, current) => {
        if (isNewerRestore(current, latest)) {
          return current;
        }

        return latest;
      }, undefined);

    if (latestRestore) {
      map[snapshotUID] = latestRestore;
    }

    return map;
  }, {});
