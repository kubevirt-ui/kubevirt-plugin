import {
  VM_GPU_ATTACHED,
  VM_OS_COLLECTED,
  VM_RESOURCES_COLLECTED,
  VM_WORKLOAD_COLLECTED,
} from './utils/constants';
import {
  GpuPassthroughTypeTelemetry,
  OSFamilyTelemetry,
  WorkloadTypeTelemetry,
} from './utils/types';
import { eventMonitor } from './telemetry';

export const logVMOSCollected = (properties: {
  osFamily?: OSFamilyTelemetry;
  osName?: string;
  osVersion?: string;
}) => {
  eventMonitor(VM_OS_COLLECTED, properties);
};

export const logVMWorkloadCollected = (properties: {
  cpuCores?: number;
  memoryMB?: number;
  workloadType?: WorkloadTypeTelemetry;
}) => {
  eventMonitor(VM_WORKLOAD_COLLECTED, properties);
};

export const logVMResourcesCollected = (properties: {
  cpuLimit?: number;
  cpuRequested?: number;
  memoryLimitMB?: number;
  memoryRequestedMB?: number;
  workloadType?: WorkloadTypeTelemetry;
}) => {
  eventMonitor(VM_RESOURCES_COLLECTED, properties);
};

export const logVMGPUAttached = (properties: {
  gpuCount?: number;
  gpuModel?: string;
  passthroughType?: GpuPassthroughTypeTelemetry;
}) => {
  eventMonitor(VM_GPU_ATTACHED, properties);
};
