import { eventMonitor } from './telemetry';
import {
  VM_GPU_ATTACHED,
  VM_OS_COLLECTED,
  VM_RESOURCES_COLLECTED,
  VM_WORKLOAD_COLLECTED,
} from './utils/constants';
import {
  type GpuPassthroughTypeTelemetry,
  type OSFamilyTelemetry,
  type WorkloadTypeTelemetry,
} from './utils/types';

export const logVMOSCollected = (properties: {
  osFamily?: OSFamilyTelemetry;
  osName?: string;
  osVersion?: string;
}): void => {
  eventMonitor(VM_OS_COLLECTED, properties);
};

export const logVMWorkloadCollected = (properties: {
  cpuCores?: number;
  memoryMB?: number;
  workloadType?: WorkloadTypeTelemetry;
}): void => {
  eventMonitor(VM_WORKLOAD_COLLECTED, properties);
};

export const logVMResourcesCollected = (properties: {
  cpuLimit?: number;
  cpuRequested?: number;
  memoryLimitMB?: number;
  memoryRequestedMB?: number;
  workloadType?: WorkloadTypeTelemetry;
}): void => {
  eventMonitor(VM_RESOURCES_COLLECTED, properties);
};

export const logVMGPUAttached = (properties: {
  gpuCount?: number;
  gpuModel?: string;
  passthroughType?: GpuPassthroughTypeTelemetry;
}): void => {
  eventMonitor(VM_GPU_ATTACHED, properties);
};
