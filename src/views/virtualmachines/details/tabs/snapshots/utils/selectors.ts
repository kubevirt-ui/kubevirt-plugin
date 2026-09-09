import { type V1beta1VirtualMachineRestore } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';

export const getVmRestoreTime = (restore: V1beta1VirtualMachineRestore): string | undefined =>
  restore?.status?.restoreTime;

export const getVmRestoreSnapshotName = (
  restore: V1beta1VirtualMachineRestore,
): string | undefined => restore?.spec?.virtualMachineSnapshotName;
