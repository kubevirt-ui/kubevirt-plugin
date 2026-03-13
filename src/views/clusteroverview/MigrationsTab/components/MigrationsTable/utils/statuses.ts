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

export const getStatusIcon = (phase: string) => iconMapper[phase] || UnknownIcon;
