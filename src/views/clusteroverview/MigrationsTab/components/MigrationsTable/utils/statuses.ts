import { type ComponentType } from 'react';

import { GreenRunningIcon } from '@kubevirt-utils/icons/GreenRunningIcon';
import {
  GreenCheckCircleIcon,
  RedExclamationCircleIcon,
} from '@openshift-console/dynamic-plugin-sdk';
import {
  InProgressIcon,
  OutlinedClockIcon,
  PausedIcon,
  UnknownIcon,
} from '@patternfly/react-icons';

const iconMapper = {
  Failed: RedExclamationCircleIcon,
  Paused: PausedIcon,
  Pending: OutlinedClockIcon,
  PreparingTarget: InProgressIcon,
  Running: GreenRunningIcon,
  Scheduled: OutlinedClockIcon,
  Scheduling: OutlinedClockIcon,
  Succeeded: GreenCheckCircleIcon,
  Synchronizing: InProgressIcon,
  TargetReady: InProgressIcon,
  WaitingForSync: InProgressIcon,
};

type StatusIconPhase = keyof typeof iconMapper;

const isStatusIconPhase = (phase: string): phase is StatusIconPhase =>
  Object.hasOwn(iconMapper, phase);

export const getStatusIcon = (phase: string): ComponentType => {
  if (isStatusIconPhase(phase)) {
    return iconMapper[phase];
  }
  return UnknownIcon;
};
