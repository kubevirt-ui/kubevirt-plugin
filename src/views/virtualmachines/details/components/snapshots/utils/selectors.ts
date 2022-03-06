import { V1alpha1VirtualMachineRestore } from '@kubevirt-ui/kubevirt-api/kubevirt';

export const getVmRestoreTime = (restore: V1alpha1VirtualMachineRestore) =>
  restore?.status?.restoreTime;

export const getVmRestoreSnapshotName = (restore: V1alpha1VirtualMachineRestore) =>
  restore?.spec?.virtualMachineSnapshotName;
