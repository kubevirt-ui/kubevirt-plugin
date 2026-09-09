import { type V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { getName } from '@kubevirt-utils/resources/shared';

import { eventMonitor } from './telemetry';
import { VM_ACTION_PERFORMED, VM_BULK_ACTION_PERFORMED } from './utils/constants';
import { type VMActionTelemetry } from './utils/types';

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
