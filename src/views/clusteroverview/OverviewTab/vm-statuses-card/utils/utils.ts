import { Fragment } from 'react';

import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { getVMStatus } from '@kubevirt-utils/resources/shared';
import { VM_STATUS } from '@kubevirt-utils/resources/vm/utils/vmStatus';
import { RedExclamationCircleIcon } from '@openshift-console/dynamic-plugin-sdk';
import { InProgressIcon, PausedIcon, SyncAltIcon } from '@patternfly/react-icons';

import { ERROR } from './constants';

const PRIMARY_STATUSES = [VM_STATUS.Running, VM_STATUS.Paused, VM_STATUS.Migrating, ERROR];

const ERROR_STATUSES = [
  VM_STATUS.CrashLoopBackOff,
  VM_STATUS.ErrorUnschedulable,
  VM_STATUS.ErrImagePull,
  VM_STATUS.ImagePullBackOff,
  VM_STATUS.ErrorPvcNotFound,
  VM_STATUS.ErrorDataVolumeNotFound,
  VM_STATUS.DataVolumeError,
  VM_STATUS.Unknown,
  VM_STATUS.WaitingForVolumeBinding,
];

export const vmStatusIcon = {
  Deleting: Fragment,
  Error: RedExclamationCircleIcon,
  Migrating: InProgressIcon,
  Paused: PausedIcon,
  Provisioning: Fragment,
  Running: SyncAltIcon,
  Starting: Fragment,
  Stopped: Fragment,
  Stopping: Fragment,
  Terminating: Fragment,
};

const initializeStatusCountsObject = (): { [key in VM_STATUS]?: number } =>
  Object.keys(VM_STATUS).reduce((acc, status) => {
    acc[status] = 0;
    return acc;
  }, {});

export type StatusCounts = {
  additionalStatuses: { [key in VM_STATUS]?: number };
  primaryStatuses: { [key in 'Error' | VM_STATUS]?: number };
};

export const getVMStatuses = (vms: V1VirtualMachine[]): StatusCounts => {
  const statusCounts = initializeStatusCountsObject();

  vms.forEach((vm) => {
    const status = getVMStatus(vm);
    statusCounts[status] = statusCounts[status] + 1;
  });

  statusCounts[ERROR] = ERROR_STATUSES.reduce((acc, state) => {
    const count = acc + (statusCounts?.[state] || 0);
    delete statusCounts[state];
    return count;
  }, 0);

  const primaryStatuses = PRIMARY_STATUSES.reduce((acc, state) => {
    acc[state] = statusCounts?.[state] || 0;
    delete statusCounts[state];
    return acc;
  }, {});

  return { additionalStatuses: statusCounts, primaryStatuses };
};
