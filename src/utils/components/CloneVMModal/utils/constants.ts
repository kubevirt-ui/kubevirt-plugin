import { ProgressStepVariant } from '@patternfly/react-core';

export const TEMPLATE_VM_NAME_LABEL = 'vm.kubevirt.io/name';

export enum CLONING_STATUSES {
  CREATING_TARGET_VM = 'CreatingTargetVM',
  FAILED = 'Failed',
  RESTORE_IN_PROGRESS = 'RestoreInProgress',
  SNAPSHOT_IN_PROGRESS = 'SnapshotInProgress',
  SUCCEEDED = 'Succeeded',
  UNKNOWN = 'Unknown',
}

export const CLONE_IN_PROGRESS_PHASES: ReadonlySet<CLONING_STATUSES> = new Set([
  CLONING_STATUSES.SNAPSHOT_IN_PROGRESS,
  CLONING_STATUSES.CREATING_TARGET_VM,
  CLONING_STATUSES.RESTORE_IN_PROGRESS,
]);

export const isClonePhaseFailed = (phase?: string): boolean =>
  phase === CLONING_STATUSES.FAILED || phase === CLONING_STATUSES.UNKNOWN;

export const isClonePhaseInProgress = (phase?: string): boolean =>
  !phase || CLONE_IN_PROGRESS_PHASES.has(phase as CLONING_STATUSES);

export enum VolumeNamePolicy {
  PrefixTargetName = 'PrefixTargetName',
  RandomizeNames = 'RandomizeNames',
}

export const STATUS_TO_PROGRESS_VARIANT = {
  CreatingTargetVM: ProgressStepVariant.info,
  Failed: ProgressStepVariant.danger,
  RestoreInProgress: ProgressStepVariant.info,
  SnapshotInProgress: ProgressStepVariant.info,
  Succeeded: ProgressStepVariant.success,
  Unknown: ProgressStepVariant.danger,
};
