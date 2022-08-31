import * as React from 'react';

import {
  ExclamationCircleIcon,
  HourglassHalfIcon,
  InProgressIcon,
  MigrationIcon,
  OffIcon,
  PausedIcon,
  SyncAltIcon,
  UnknownIcon,
} from '@patternfly/react-icons';

// https://github.com/kubevirt/api/blob/9689e71fe2bed9e7da5f165760bbbf6981cc1087/core/v1/types.go#L1277
export const printableVMStatus = {
  Stopped: 'Stopped',
  Provisioning: 'Provisioning',
  Starting: 'Starting',
  Running: 'Running',
  Paused: 'Paused',
  Stopping: 'Stopping',
  Terminating: 'Terminating',
  Migrating: 'Migrating',
  WaitingForVolumeBinding: 'WaitingForVolumeBinding',
  Unknown: 'Unknown',
};

export const errorPrintableVMStatus = {
  CrashLoopBackOff: 'CrashLoopBackOff',
  ErrorUnschedulable: 'ErrorUnschedulable',
  ErrImagePull: 'ErrImagePull',
  ImagePullBackOff: 'ImagePullBackOff',
  ErrorPvcNotFound: 'ErrorPvcNotFound',
  ErrorDataVolumeNotFound: 'ErrorDataVolumeNotFound',
  DataVolumeError: 'DataVolumeError',
};

export const isFailedPrintableStatus = (printableStatus: string) =>
  Object.values(errorPrintableVMStatus).includes(printableStatus);

export const getVMStatusIcon = (status: string): React.ComponentClass | React.FC => {
  switch (status) {
    case printableVMStatus.Stopped:
      return OffIcon;
    case printableVMStatus.Provisioning:
    case printableVMStatus.WaitingForVolumeBinding:
      return HourglassHalfIcon;
    case printableVMStatus.Starting:
    case printableVMStatus.Stopping:
    case printableVMStatus.Terminating:
      return InProgressIcon;
    case printableVMStatus.Running:
      return SyncAltIcon;
    case printableVMStatus.Paused:
      return PausedIcon;
    case printableVMStatus.Migrating:
      return MigrationIcon;
  }

  if (isFailedPrintableStatus(status)) return ExclamationCircleIcon;

  return UnknownIcon;
};
