import {
  GreenCheckCircleIcon,
  RedExclamationCircleIcon,
} from '@openshift-console/dynamic-plugin-sdk';
import {
  ClockIcon,
  InProgressIcon,
  PausedIcon,
  SyncAltIcon,
  UnknownIcon,
} from '@patternfly/react-icons';

const iconMapper = {
  Failed: RedExclamationCircleIcon,
  Paused: PausedIcon,
  Pending: InProgressIcon,
  PreparingTarget: InProgressIcon,
  Running: SyncAltIcon,
  Scheduled: ClockIcon,
  Scheduling: InProgressIcon,
  Succeeded: GreenCheckCircleIcon,
  Synchronizing: InProgressIcon,
  TargetReady: InProgressIcon,
  WaitingForSync: InProgressIcon,
};

export const getStatusIcon = (phase: string) => iconMapper[phase] || UnknownIcon;
