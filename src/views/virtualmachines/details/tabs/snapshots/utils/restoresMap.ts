import { type V1beta1VirtualMachineRestore } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';

import { getVmRestoreSnapshotName, getVmRestoreTime } from './selectors';

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

export const buildRestoresMap = (
  restores: V1beta1VirtualMachineRestore[] | undefined,
): Record<string, V1beta1VirtualMachineRestore> =>
  (restores ?? []).reduce<Record<string, V1beta1VirtualMachineRestore>>(
    (restoreMap, currentRestore) => {
      const snapshotName = getVmRestoreSnapshotName(currentRestore);
      if (!snapshotName) {
        return restoreMap;
      }

      const existingRestore = restoreMap[snapshotName];
      if (isNewerRestore(currentRestore, existingRestore)) {
        restoreMap[snapshotName] = currentRestore;
      }

      return restoreMap;
    },
    {},
  );
