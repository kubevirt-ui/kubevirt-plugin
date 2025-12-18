import { V1VirtualMachine, V1VolumeSnapshotStatus } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';

import { getVolumeSnapshotStatuses } from './selectors';

export const getMigratableVolumeSnapshotStatuses = (
  vm: V1VirtualMachine,
): V1VolumeSnapshotStatus[] =>
  getVolumeSnapshotStatuses(vm)?.filter((status) => status.enabled) ?? [];

export const getNonMigratableVolumeSnapshotStatuses = (
  vm: V1VirtualMachine,
): V1VolumeSnapshotStatus[] =>
  getVolumeSnapshotStatuses(vm)?.filter((status) => !status.enabled) ?? [];
