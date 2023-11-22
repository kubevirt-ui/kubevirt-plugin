import { ComponentClass, FC } from 'react';

import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { ErrorIcon } from '@kubevirt-utils/components/ErrorIcon/ErrorIcon';
import { getVMStatus } from '@kubevirt-utils/resources/shared';
import {
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
  Migrating: 'Migrating',
  Paused: 'Paused',
  Provisioning: 'Provisioning',
  Running: 'Running',
  Starting: 'Starting',
  Stopped: 'Stopped',
  Stopping: 'Stopping',
  Terminating: 'Terminating',
  Unknown: 'Unknown',
  WaitingForVolumeBinding: 'WaitingForVolumeBinding',
};

export const errorPrintableVMStatus = {
  CrashLoopBackOff: 'CrashLoopBackOff',
  DataVolumeError: 'DataVolumeError',
  ErrImagePull: 'ErrImagePull',
  ErrorDataVolumeNotFound: 'ErrorDataVolumeNotFound',
  ErrorPvcNotFound: 'ErrorPvcNotFound',
  ErrorUnschedulable: 'ErrorUnschedulable',
  ImagePullBackOff: 'ImagePullBackOff',
};

export const isErrorPrintableStatus = (printableStatus: string) =>
  Object.values(errorPrintableVMStatus).includes(printableStatus);

export const getVMStatusIcon = (status: string): ComponentClass | FC => {
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
    case errorPrintableVMStatus[status]:
      return ErrorIcon;
    default:
      return UnknownIcon;
  }
};

export const isStopped = (vm: V1VirtualMachine): boolean =>
  getVMStatus(vm) === printableVMStatus.Stopped;

export const isPaused = (vm: V1VirtualMachine): boolean =>
  getVMStatus(vm) === printableVMStatus.Paused;
