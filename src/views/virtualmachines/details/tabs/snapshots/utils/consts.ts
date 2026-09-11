import { type FC } from 'react';

import {
  type ColoredIconProps,
  GreenCheckCircleIcon,
  RedExclamationCircleIcon,
  YellowExclamationTriangleIcon,
} from '@openshift-console/dynamic-plugin-sdk';

export const snapshotStatuses = {
  Failed: 'Failed',
  InProgress: 'InProgress',
  Succeeded: 'Succeeded',
};

export const iconMapper: Record<string, FC<ColoredIconProps>> = {
  default: GreenCheckCircleIcon,
  Error: RedExclamationCircleIcon,
  Failed: RedExclamationCircleIcon,
  InProgress: YellowExclamationTriangleIcon,
  'Not ready': YellowExclamationTriangleIcon,
  Succeeded: GreenCheckCircleIcon,
};

// https://kubevirt.io/user-guide/operations/snapshot_restore_api/#snapshot-a-virtualmachine
export enum DeadlineUnits {
  Hours = 'h',
  Minutes = 'm',
  Seconds = 's',
}
