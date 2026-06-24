import { ComponentClass, FC } from 'react';

import { V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { ErrorIcon } from '@kubevirt-utils/components/ErrorIcon/ErrorIcon';
import { GreenRunningIcon } from '@kubevirt-utils/icons/GreenRunningIcon';
import {
  getVMRestoringStatus,
  getVMSnapshottingStatus,
  getVMStatus,
} from '@kubevirt-utils/resources/shared';
import { VM_ERROR_STATUSES, VM_STATUS } from '@kubevirt-utils/resources/vm';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import {
  HourglassHalfIcon,
  InProgressIcon,
  MigrationIcon,
  OffIcon,
  PausedIcon,
  UnknownIcon,
} from '@patternfly/react-icons';

// Derived from the canonical VM_STATUS enum in @kubevirt-utils/resources/vm.
// https://github.com/kubevirt/api/blob/9689e71fe2bed9e7da5f165760bbbf6981cc1087/core/v1/types.go#L1277
export const printableVMStatus: Record<string, string> = {
  Deleting: VM_STATUS.Deleting,
  Migrating: VM_STATUS.Migrating,
  Paused: VM_STATUS.Paused,
  Provisioning: VM_STATUS.Provisioning,
  Running: VM_STATUS.Running,
  Starting: VM_STATUS.Starting,
  Stopped: VM_STATUS.Stopped,
  Stopping: VM_STATUS.Stopping,
  Terminating: VM_STATUS.Terminating,
  Unknown: VM_STATUS.Unknown,
  WaitingForReceiver: VM_STATUS.WaitingForReceiver,
  WaitingForVolumeBinding: VM_STATUS.WaitingForVolumeBinding,
};

export const errorPrintableVMStatus: Record<string, string> = {
  CrashLoopBackOff: VM_STATUS.CrashLoopBackOff,
  DataVolumeError: VM_STATUS.DataVolumeError,
  ErrImagePull: VM_STATUS.ErrImagePull,
  ErrorDataVolumeNotFound: VM_STATUS.ErrorDataVolumeNotFound,
  ErrorPvcNotFound: VM_STATUS.ErrorPvcNotFound,
  ErrorUnschedulable: VM_STATUS.ErrorUnschedulable,
  ImagePullBackOff: VM_STATUS.ImagePullBackOff,
};

export const isErrorPrintableStatus = (printableStatus: string) =>
  Object.values(VM_ERROR_STATUSES).includes(printableStatus as VM_STATUS);

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
    case printableVMStatus.WaitingForReceiver:
      return InProgressIcon;
    case printableVMStatus.Running:
      return GreenRunningIcon;
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

export const isRestoring = (vm: V1VirtualMachine): boolean => !isEmpty(getVMRestoringStatus(vm));

export const isSnapshotting = (vm: V1VirtualMachine): boolean =>
  !isEmpty(getVMSnapshottingStatus(vm));
