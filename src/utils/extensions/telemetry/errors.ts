import { type V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { getName } from '@kubevirt-utils/resources/shared';

import { eventMonitor } from './telemetry';
import {
  ERROR_RESOLUTION_ACTION,
  ERROR_RESOLUTION_MEASURED,
  VM_ERROR_DETECTED,
  VM_ERROR_SUMMARY,
} from './utils/constants';
import { type ErrorResolutionActionTelemetry, type VMErrorTypeTelemetry } from './utils/types';

export const logVMErrorDetected = (
  vm: V1VirtualMachine,
  errorType: VMErrorTypeTelemetry,
  errorMessage?: string,
): void => {
  eventMonitor(VM_ERROR_DETECTED, {
    errorMessage,
    errorType,
    vmName: getName(vm),
  });
};

export const logErrorResolutionAction = (
  vm: V1VirtualMachine,
  errorType: VMErrorTypeTelemetry,
  resolutionAction: ErrorResolutionActionTelemetry,
): void => {
  eventMonitor(ERROR_RESOLUTION_ACTION, {
    errorType,
    resolutionAction,
    vmName: getName(vm),
  });
};

export const logErrorResolutionMeasured = (
  errorType: VMErrorTypeTelemetry,
  resolutionAction: ErrorResolutionActionTelemetry,
): void => {
  eventMonitor(ERROR_RESOLUTION_MEASURED, {
    errorType,
    resolutionAction,
  });
};

export const logVMErrorSummary = (
  errorType: VMErrorTypeTelemetry,
  count: number,
  affectedVmCount: number,
  timeRange?: string,
): void => {
  eventMonitor(VM_ERROR_SUMMARY, { affectedVmCount, count, errorType, timeRange });
};
