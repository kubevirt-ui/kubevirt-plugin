import { V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { getName } from '@kubevirt-utils/resources/shared';

import { VM_ACTION_PERFORMED, VM_BULK_ACTION_PERFORMED } from './utils/constants';
import { VMActionTelemetry } from './utils/types';
import { eventMonitor } from './telemetry';

export const logVMActionPerformed = (action: VMActionTelemetry, vm: V1VirtualMachine) => {
  eventMonitor(VM_ACTION_PERFORMED, {
    action,
    vmName: getName(vm),
  });
};

export const logVMBulkActionPerformed = (action: VMActionTelemetry, vmCount: number) => {
  eventMonitor(VM_BULK_ACTION_PERFORMED, {
    action,
    vmCount,
  });
};
