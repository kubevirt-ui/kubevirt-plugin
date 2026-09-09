import { type V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { getName } from '@kubevirt-utils/resources/shared';

import { eventMonitor, getTelemetryErrorMessage } from './telemetry';
import {
  VM_MIGRATION_CLUSTER_LIMIT_CONFIGURED,
  VM_MIGRATION_CLUSTER_LIMIT_REACHED,
  VM_MIGRATION_COMPLETED,
  VM_MIGRATION_FAILED,
  VM_MIGRATION_NODE_LIMIT_CONFIGURED,
  VM_MIGRATION_NODE_LIMIT_REACHED,
  VM_MIGRATION_STARTED,
} from './utils/constants';
import { type MigrationStatusTelemetry } from './utils/types';

type MigrationProperties = {
  clusterLimit?: number;
  currentParallelCount?: number;
  vmDiskGB?: number;
  vmMemoryMB?: number;
};

export const logVMMigrationStarted = (
  vm: V1VirtualMachine,
  properties?: {
    sourceNode?: string;
    targetNode?: string;
    targetNodeSpecified?: boolean;
  },
): void => {
  eventMonitor(VM_MIGRATION_STARTED, {
    vmName: getName(vm),
    ...properties,
  });
};

export const logVMMigrationCompleted = (
  vm: V1VirtualMachine,
  status: MigrationStatusTelemetry,
  properties: MigrationProperties = {},
): void => {
  const { clusterLimit, currentParallelCount, vmDiskGB, vmMemoryMB } = properties;

  eventMonitor(VM_MIGRATION_COMPLETED, {
    status,
    vmName: getName(vm),
    ...(clusterLimit !== undefined && { clusterLimit }),
    ...(currentParallelCount !== undefined && { currentParallelCount }),
    ...(vmDiskGB !== undefined && { vmDiskGB }),
    ...(vmMemoryMB !== undefined && { vmMemoryMB }),
  });
};

export const logVMMigrationFailed = (vm: V1VirtualMachine, error: unknown): void => {
  const vmName = getName(vm);
  const errorMessage = getTelemetryErrorMessage(error);
  const errorCode = (error as { code?: string })?.code;

  eventMonitor(VM_MIGRATION_FAILED, {
    errorMessage,
    vmName,
    ...(errorCode && { errorCode }),
  });
};

export const logVMMigrationClusterLimitConfigured = (clusterLimit: number): void => {
  eventMonitor(VM_MIGRATION_CLUSTER_LIMIT_CONFIGURED, { clusterLimit });
};

export const logVMMigrationClusterLimitReached = (
  clusterLimit: number,
  currentParallelCount: number,
): void => {
  eventMonitor(VM_MIGRATION_CLUSTER_LIMIT_REACHED, { clusterLimit, currentParallelCount });
};

export const logVMMigrationNodeLimitConfigured = (nodeLimit: number): void => {
  eventMonitor(VM_MIGRATION_NODE_LIMIT_CONFIGURED, { nodeLimit });
};

export const logVMMigrationNodeLimitReached = (
  nodeLimit: number,
  currentParallelCount: number,
): void => {
  eventMonitor(VM_MIGRATION_NODE_LIMIT_REACHED, { currentParallelCount, nodeLimit });
};
