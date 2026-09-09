import { eventMonitor } from './telemetry';
import {
  MIGRATION_PLAN_CREATED,
  MTV_DETECTED,
  POST_MIGRATION_VM_HEALTH,
  VM_MIGRATION_IMPORT_COMPLETED,
} from './utils/constants';
import { type TELEMETRY_STATUS } from './utils/property-constants';
import { type SourceProviderTelemetry } from './utils/types';

export const logMTVDetected = (properties: {
  migrationPlansCreated?: number;
  mtvInstalled: boolean;
  mtvVersion?: string;
}): void => {
  eventMonitor(MTV_DETECTED, properties);
};

export const logMigrationPlanCreated = (properties: {
  networkMappingCount: number;
  sourceProvider: SourceProviderTelemetry;
  sourceVersion?: string;
  storageMappingCount: number;
  vmCount?: number;
}): void => {
  eventMonitor(MIGRATION_PLAN_CREATED, properties);
};

export const logVMMigrationImportCompleted = (properties: {
  errorMessage?: string;
  sourceProvider: SourceProviderTelemetry;
  status: (typeof TELEMETRY_STATUS)[keyof typeof TELEMETRY_STATUS];
  totalDiskSizeGi?: number;
  vmCount?: number;
}): void => {
  eventMonitor(VM_MIGRATION_IMPORT_COMPLETED, properties);
};

export const logPostMigrationVMHealth = (properties: {
  bootSuccessful: boolean;
  firstErrorType?: string;
  sourceProvider: SourceProviderTelemetry;
  timeToFirstBootSeconds?: number;
  vmName: string;
}): void => {
  eventMonitor(POST_MIGRATION_VM_HEALTH, properties);
};
