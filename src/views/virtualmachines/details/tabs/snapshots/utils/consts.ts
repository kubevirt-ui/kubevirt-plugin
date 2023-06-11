import {
  GreenCheckCircleIcon,
  RedExclamationCircleIcon,
  YellowExclamationTriangleIcon,
} from '@openshift-console/dynamic-plugin-sdk';

export const snapshotStatuses = {
  Failed: 'Failed',
  InProgress: 'InProgress',
  Succeeded: 'Succeeded',
};

export const iconMapper = {
  Failed: RedExclamationCircleIcon,
  InProgress: YellowExclamationTriangleIcon,
  Succeeded: GreenCheckCircleIcon,
};

// https://kubevirt.io/user-guide/operations/snapshot_restore_api/#snapshot-a-virtualmachine
export enum deadlineUnits {
  Hours = 'h',
  Miliseconds = 'ms',
  Minutes = 'm',
  Seconds = 's',
}
