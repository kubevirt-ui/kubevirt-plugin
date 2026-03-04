import { GreenRunningIcon } from '@kubevirt-utils/icons/GreenRunningIcon';
import {
  GreenCheckCircleIcon,
  RedExclamationCircleIcon,
} from '@openshift-console/dynamic-plugin-sdk';
import { ClockIcon, InProgressIcon, PausedIcon, UnknownIcon } from '@patternfly/react-icons';

const iconMapper = {
  Failed: RedExclamationCircleIcon,
  Paused: PausedIcon,
  Pending: ClockIcon,
  PreparingTarget: InProgressIcon,
  Running: GreenRunningIcon,
  Scheduled: ClockIcon,
  Scheduling: ClockIcon,
  Succeeded: GreenCheckCircleIcon,
  Synchronizing: InProgressIcon,
  TargetReady: InProgressIcon,
  WaitingForSync: InProgressIcon,
};

export const getStatusIcon = (phase: string) => iconMapper[phase] || UnknownIcon;
