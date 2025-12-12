import { GreenRunningIcon } from '@kubevirt-utils/icons/GreenRunningIcon';
import {
  GreenCheckCircleIcon,
  RedExclamationCircleIcon,
} from '@openshift-console/dynamic-plugin-sdk';
import { InProgressIcon, PausedIcon } from '@patternfly/react-icons';

export const iconMapper = {
  Failed: RedExclamationCircleIcon,
  Paused: PausedIcon,
  Pending: InProgressIcon,
  PreparingTarget: InProgressIcon,
  Running: GreenRunningIcon,
  Scheduled: InProgressIcon,
  Scheduling: InProgressIcon,
  Succeeded: GreenCheckCircleIcon,
  TargetReady: InProgressIcon,
};
