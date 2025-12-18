import { Fragment } from 'react';

import { V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { GreenRunningIcon } from '@kubevirt-utils/icons/GreenRunningIcon';
import { getVMStatus } from '@kubevirt-utils/resources/shared';
import { VM_ERROR_STATUSES, VM_STATUS } from '@kubevirt-utils/resources/vm/utils/vmStatus';
import { sumObjectValues } from '@kubevirt-utils/utils/utils';
import { RedExclamationCircleIcon } from '@openshift-console/dynamic-plugin-sdk';
import { InProgressIcon, OffIcon, PausedIcon, UnknownIcon } from '@patternfly/react-icons';
import { printableVMStatus } from '@virtualmachines/utils';

import { ERROR } from './constants';

const PRIMARY_STATUSES = [VM_STATUS.Running, VM_STATUS.Stopped, ERROR];
export const vmStatusIcon = {
  Deleting: Fragment,
  Error: RedExclamationCircleIcon,
  Migrating: InProgressIcon,
  Other: UnknownIcon,
  Paused: PausedIcon,
  Provisioning: Fragment,
  Running: GreenRunningIcon,
  Starting: Fragment,
  Stopped: OffIcon,
  Stopping: Fragment,
  Terminating: Fragment,
};

export const getOtherStatuses = (): VM_STATUS[] => {
  const PRINTABLE_VM_STATUSES = Object.values(printableVMStatus) as VM_STATUS[];
  return PRINTABLE_VM_STATUSES.filter(
    (status) => !PRIMARY_STATUSES.includes(status) && !VM_ERROR_STATUSES.includes(status),
  );
};

const initializeStatusCountsObject = (): { [key in VM_STATUS]?: number } =>
  Object.keys(VM_STATUS).reduce((acc, status) => {
    acc[status] = 0;
    return acc;
  }, {});

export type StatusCounts = {
  otherStatuses: { [key in VM_STATUS]?: number };
  otherStatusesCount: number;
  primaryStatuses: { [key in 'Error' | VM_STATUS]?: number };
};

export const getVMStatuses = (vms: V1VirtualMachine[]): StatusCounts => {
  const statusCounts = initializeStatusCountsObject();
  vms.forEach((vm) => {
    const status = getVMStatus(vm);
    statusCounts[status] = statusCounts[status] + 1;
  });

  statusCounts[ERROR] = VM_ERROR_STATUSES.reduce((acc, state) => {
    const count = acc + (statusCounts?.[state] || 0);
    delete statusCounts[state];
    return count;
  }, 0);

  const primaryStatuses = PRIMARY_STATUSES.reduce((acc, state) => {
    acc[state] = statusCounts?.[state] || 0;
    delete statusCounts[state];
    return acc;
  }, {});

  const otherStatusesCount = sumObjectValues(statusCounts);

  return {
    otherStatuses: statusCounts,
    otherStatusesCount,
    primaryStatuses,
  };
};
