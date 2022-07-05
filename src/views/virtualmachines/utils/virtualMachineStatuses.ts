import * as React from 'react';

import {
  ExclamationCircleIcon,
  HourglassHalfIcon,
  InProgressIcon,
  OffIcon,
  PausedIcon,
  SyncAltIcon,
  UnknownIcon,
} from '@patternfly/react-icons';

export const printableVMStatus = {
  Stopped: 'Stopped',
  Migrating: 'Migrating',
  Provisioning: 'Provisioning',
  Starting: 'Starting',
  Running: 'Running',
  Paused: 'Paused',
  Stopping: 'Stopping',
  Terminating: 'Terminating',
  Failed: 'Failed',
  Unknown: 'Unknown',
};

export const isFailedPrintableStatus = (printableStatus: string) =>
  printableStatus?.toLowerCase()?.includes('error');

export const getVMStatusIcon = (
  status: string,
  //   arePendingChanges: boolean,
): React.ComponentClass | React.FC => {
  let icon: React.ComponentClass | React.FC = UnknownIcon;

  if (status === printableVMStatus.Paused) {
    icon = PausedIcon;
  } else if (status === printableVMStatus.Running) {
    icon = SyncAltIcon;
  } else if (status === printableVMStatus.Stopped) {
    icon = OffIcon;
  } else if (status?.toLowerCase().includes('error')) {
    icon = ExclamationCircleIcon;
  } else if (
    status?.toLowerCase().includes('pending') ||
    status?.toLowerCase().includes('provisioning')
  ) {
    // should be called before inProgress
    icon = HourglassHalfIcon;
  } else if (status?.toLowerCase().includes('starting')) {
    icon = InProgressIcon;
  }

  //   if (arePendingChanges) {
  //     icon = YellowExclamationTriangleIcon;
  //   }

  return icon;
};
