import { signal } from '@preact/signals-core';

export type MetricsType = {
  [key in string]: {
    cpuRequested?: number;
    cpuUsage?: number;
    memoryRequested?: number;
    memoryUsage?: number;
    networkUsage?: number;
  };
};

export const vmMetrics = signal<MetricsType>({});

export const getVMMetrics = (vmName: string, vmNamespace: string) =>
  vmMetrics.value?.[`${vmNamespace}-${vmName}`] || {};

export const setVMMemoryUsage = (vmName: string, vmNamespace: string, memoryUsage: number) => {
  vmMetrics.value[`${vmNamespace}-${vmName}`] = {
    ...getVMMetrics(vmName, vmNamespace),
    memoryUsage,
  };
};

export const setVMNetworkUsage = (vmName: string, vmNamespace: string, networkUsage: number) => {
  vmMetrics.value[`${vmNamespace}-${vmName}`] = {
    ...getVMMetrics(vmName, vmNamespace),
    networkUsage,
  };
};

export const setVMMemoryRequested = (
  vmName: string,
  vmNamespace: string,
  memoryRequested: number,
) => {
  vmMetrics.value[`${vmNamespace}-${vmName}`] = {
    ...getVMMetrics(vmName, vmNamespace),
    memoryRequested,
  };
};

export const setVMCPUUsage = (vmName: string, vmNamespace: string, cpuUsage: number) => {
  vmMetrics.value[`${vmNamespace}-${vmName}`] = {
    ...getVMMetrics(vmName, vmNamespace),
    cpuUsage,
  };
};

export const setVMCPURequested = (vmName: string, vmNamespace: string, cpuRequested: number) => {
  vmMetrics.value[`${vmNamespace}-${vmName}`] = {
    ...getVMMetrics(vmName, vmNamespace),
    cpuRequested,
  };
};
