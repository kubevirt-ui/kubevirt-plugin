import { V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { getName } from '@kubevirt-utils/resources/shared';

import {
  VM_MIGRATION_CLUSTER_LIMIT_CONFIGURED,
  VM_MIGRATION_CLUSTER_LIMIT_REACHED,
  VM_MIGRATION_COMPLETED,
  VM_MIGRATION_FAILED,
  VM_MIGRATION_NODE_LIMIT_CONFIGURED,
  VM_MIGRATION_NODE_LIMIT_REACHED,
  VM_MIGRATION_STARTED,
} from './utils/constants';
import { MigrationStatusTelemetry } from './utils/types';
import { eventMonitor, getTelemetryErrorMessage } from './telemetry';

export const logVMMigrationStarted = (
  vm: V1VirtualMachine,
  properties?: {
    sourceNode?: string;
    targetNode?: string;
    targetNodeSpecified?: boolean;
  },
) => {
  eventMonitor(VM_MIGRATION_STARTED, {
    vmName: getName(vm),
    ...properties,
  });
};

export const logVMMigrationCompleted = (
  vm: V1VirtualMachine,
  status: MigrationStatusTelemetry,
  properties?: {
    clusterLimit?: number;
    currentParallelCount?: number;
    vmDiskGB?: number;
    vmMemoryMB?: number;
  },
) => {
  eventMonitor(VM_MIGRATION_COMPLETED, {
    status,
    vmName: getName(vm),
    ...(properties?.vmMemoryMB !== undefined && { vmMemoryMB: properties.vmMemoryMB }),
    ...(properties?.vmDiskGB !== undefined && { vmDiskGB: properties.vmDiskGB }),
    ...(properties?.clusterLimit !== undefined && { clusterLimit: properties.clusterLimit }),
    ...(properties?.currentParallelCount !== undefined && {
      currentParallelCount: properties.currentParallelCount,
    }),
  });
};

export const logVMMigrationFailed = (vm: V1VirtualMachine, error: unknown) => {
  const vmName = getName(vm);
  const errorMessage = getTelemetryErrorMessage(error);
  const errorCode = (error as { code?: string })?.code;

  eventMonitor(VM_MIGRATION_FAILED, {
    errorMessage,
    vmName,
    ...(errorCode && { errorCode }),
  });
};

export const logVMMigrationClusterLimitConfigured = (clusterLimit: number) => {
  eventMonitor(VM_MIGRATION_CLUSTER_LIMIT_CONFIGURED, { clusterLimit });
};

export const logVMMigrationClusterLimitReached = (
  clusterLimit: number,
  currentParallelCount: number,
) => {
  eventMonitor(VM_MIGRATION_CLUSTER_LIMIT_REACHED, { clusterLimit, currentParallelCount });
};

export const logVMMigrationNodeLimitConfigured = (nodeLimit: number) => {
  eventMonitor(VM_MIGRATION_NODE_LIMIT_CONFIGURED, { nodeLimit });
};

export const logVMMigrationNodeLimitReached = (nodeLimit: number, currentParallelCount: number) => {
  eventMonitor(VM_MIGRATION_NODE_LIMIT_REACHED, { currentParallelCount, nodeLimit });
};
