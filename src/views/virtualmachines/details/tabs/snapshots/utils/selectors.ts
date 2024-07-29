import { V1beta1VirtualMachineRestore } from '@kubevirt-ui/kubevirt-api/kubevirt';

export const getVmRestoreTime = (restore: V1beta1VirtualMachineRestore) =>
  restore?.status?.restoreTime;

export const getVmRestoreSnapshotName = (restore: V1beta1VirtualMachineRestore) =>
  restore?.spec?.virtualMachineSnapshotName;
