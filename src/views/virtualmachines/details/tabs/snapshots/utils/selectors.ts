import {
  V1alpha1VirtualMachineRestore,
  V1alpha1VirtualMachineSnapshot,
} from '@kubevirt-ui/kubevirt-api/kubevirt';

export const getVmRestoreTime = (restore: V1alpha1VirtualMachineRestore) =>
  restore?.status?.restoreTime;

export const getVmRestoreSnapshotName = (restore: V1alpha1VirtualMachineRestore) =>
  restore?.spec?.virtualMachineSnapshotName;

export const getUsedSnapshotNames = (snapshots: V1alpha1VirtualMachineSnapshot[]): string[] => {
  return snapshots?.map((snapshot) => snapshot?.metadata?.name);
};
