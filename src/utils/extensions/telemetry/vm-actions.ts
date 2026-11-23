import { type V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { getName } from '@kubevirt-utils/resources/shared';

import { VM_ACTION_PERFORMED, VM_BULK_ACTION_PERFORMED } from './utils/constants';
import { eventMonitor } from './telemetry';

export const TELEMETRY_VM_ACTION = {
  CLONE: 'clone',
  DELETE: 'delete',
  MIGRATE: 'migrate',
  PAUSE: 'pause',
  RESTART: 'restart',
  START: 'start',
  STOP: 'stop',
  UNPAUSE: 'unpause',
} as const;

export type VMActionTelemetry = (typeof TELEMETRY_VM_ACTION)[keyof typeof TELEMETRY_VM_ACTION];

export const logVMActionPerformed = (action: VMActionTelemetry, vm: V1VirtualMachine): void => {
  eventMonitor(VM_ACTION_PERFORMED, {
    action,
    vmName: getName(vm),
  });
};

export const logVMBulkActionPerformed = (action: VMActionTelemetry, vmCount: number): void => {
  eventMonitor(VM_BULK_ACTION_PERFORMED, {
    action,
    vmCount,
  });
};
