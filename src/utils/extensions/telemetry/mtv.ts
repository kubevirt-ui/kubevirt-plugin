import {
  MIGRATION_PLAN_CREATED,
  MTV_DETECTED,
  POST_MIGRATION_VM_HEALTH,
  VM_MIGRATION_IMPORT_COMPLETED,
} from './utils/constants';
import { TELEMETRY_STATUS } from './utils/property-constants';
import { SourceProviderTelemetry } from './utils/types';
import { eventMonitor } from './telemetry';

export const logMTVDetected = (properties: {
  migrationPlansCreated?: number;
  mtvInstalled: boolean;
  mtvVersion?: string;
}) => {
  eventMonitor(MTV_DETECTED, properties);
};

export const logMigrationPlanCreated = (properties: {
  networkMappingCount: number;
  sourceProvider: SourceProviderTelemetry;
  sourceVersion?: string;
  storageMappingCount: number;
  vmCount?: number;
}) => {
  eventMonitor(MIGRATION_PLAN_CREATED, properties);
};

export const logVMMigrationImportCompleted = (properties: {
  errorMessage?: string;
  sourceProvider: SourceProviderTelemetry;
  status: (typeof TELEMETRY_STATUS)[keyof typeof TELEMETRY_STATUS];
  totalDiskSizeGi?: number;
  vmCount?: number;
}) => {
  eventMonitor(VM_MIGRATION_IMPORT_COMPLETED, properties);
};

export const logPostMigrationVMHealth = (properties: {
  bootSuccessful: boolean;
  firstErrorType?: string;
  sourceProvider: SourceProviderTelemetry;
  timeToFirstBootSeconds?: number;
  vmName: string;
}) => {
  eventMonitor(POST_MIGRATION_VM_HEALTH, properties);
};
