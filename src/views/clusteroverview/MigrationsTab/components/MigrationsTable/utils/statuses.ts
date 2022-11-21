import {
  GreenCheckCircleIcon,
  RedExclamationCircleIcon,
} from '@openshift-console/dynamic-plugin-sdk';
import { InProgressIcon, PausedIcon, SyncAltIcon } from '@patternfly/react-icons';

export const iconMapper = {
  Pending: InProgressIcon,
  Scheduling: InProgressIcon,
  Scheduled: InProgressIcon,
  PreparingTarget: InProgressIcon,
  TargetReady: InProgressIcon,
  Paused: PausedIcon,
  Running: SyncAltIcon,
  Succeeded: GreenCheckCircleIcon,
  Failed: RedExclamationCircleIcon,
};
