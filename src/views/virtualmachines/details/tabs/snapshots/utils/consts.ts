export const snapshotStatuses = {
  InProgress: 'In Progress',
  Failed: 'Failed',
  Succeeded: 'Succeeded',
};

// https://kubevirt.io/user-guide/operations/snapshot_restore_api/#snapshot-a-virtualmachine
export enum deadlineUnits {
  Miliseconds = 'ms',
  Seconds = 's',
  Minutes = 'm',
  Hours = 'h',
}
