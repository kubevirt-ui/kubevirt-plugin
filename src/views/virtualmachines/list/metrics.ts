import { isEmpty } from '@kubevirt-utils/utils/utils';
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

export const vmsMetrics = signal<MetricsType>({});

export const getVMMetrics = (vmName: string, vmNamespace: string) => {
  const vmMetrics = vmsMetrics.value?.[`${vmNamespace}-${vmName}`];

  if (isEmpty(vmMetrics)) vmsMetrics.value[`${vmNamespace}-${vmName}`] = {};

  return vmsMetrics.value?.[`${vmNamespace}-${vmName}`];
};

export const setVMMemoryUsage = (vmName: string, vmNamespace: string, memoryUsage: number) => {
  const vmMetrics = getVMMetrics(vmName, vmNamespace);

  vmMetrics.memoryUsage = memoryUsage;
};

export const setVMNetworkUsage = (vmName: string, vmNamespace: string, networkUsage: number) => {
  const vmMetrics = getVMMetrics(vmName, vmNamespace);
  vmMetrics.networkUsage = networkUsage;
};

export const setVMMemoryRequested = (
  vmName: string,
  vmNamespace: string,
  memoryRequested: number,
) => {
  const vmMetrics = getVMMetrics(vmName, vmNamespace);
  vmMetrics.memoryRequested = memoryRequested;
};

export const setVMCPUUsage = (vmName: string, vmNamespace: string, cpuUsage: number) => {
  const vmMetrics = getVMMetrics(vmName, vmNamespace);
  vmMetrics.cpuUsage = cpuUsage;
};

export const setVMCPURequested = (vmName: string, vmNamespace: string, cpuRequested: number) => {
  const vmMetrics = getVMMetrics(vmName, vmNamespace);
  vmMetrics.cpuRequested = cpuRequested;
};
