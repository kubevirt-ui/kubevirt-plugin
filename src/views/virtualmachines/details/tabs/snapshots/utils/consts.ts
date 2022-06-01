import {
  GreenCheckCircleIcon,
  RedExclamationCircleIcon,
  YellowExclamationTriangleIcon,
} from '@openshift-console/dynamic-plugin-sdk';

export const snapshotStatuses = {
  InProgress: 'InProgress',
  Failed: 'Failed',
  Succeeded: 'Succeeded',
};

export const iconMapper = {
  InProgress: YellowExclamationTriangleIcon,
  Failed: RedExclamationCircleIcon,
  Succeeded: GreenCheckCircleIcon,
};

// https://kubevirt.io/user-guide/operations/snapshot_restore_api/#snapshot-a-virtualmachine
export enum deadlineUnits {
  Miliseconds = 'ms',
  Seconds = 's',
  Minutes = 'm',
  Hours = 'h',
}
