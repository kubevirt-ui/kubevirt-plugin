import { TELEMETRY_VM_ACTION } from './property-constants';
import { VMActionTelemetry } from './types';

export const mapVMActionTypeToTelemetry = (actionType: string): undefined | VMActionTelemetry => {
  const normalized = actionType.toLowerCase();
  const mapping: Record<string, VMActionTelemetry> = {
    delete: TELEMETRY_VM_ACTION.DELETE,
    migrate: TELEMETRY_VM_ACTION.MIGRATE,
    pause: TELEMETRY_VM_ACTION.PAUSE,
    restart: TELEMETRY_VM_ACTION.RESTART,
    snapshot: TELEMETRY_VM_ACTION.SNAPSHOT,
    start: TELEMETRY_VM_ACTION.START,
    stop: TELEMETRY_VM_ACTION.STOP,
    unpause: TELEMETRY_VM_ACTION.UNPAUSE,
  };
  return mapping[normalized];
};
