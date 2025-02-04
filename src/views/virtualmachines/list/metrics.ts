import xbytes from 'xbytes';

import { getMemorySize } from '@kubevirt-utils/components/CPUMemoryModal/utils/CpuMemoryUtils';
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

export const setVMCPUUsage = (vmName: string, vmNamespace: string, cpuUsage: number) => {
  const vmMetrics = getVMMetrics(vmName, vmNamespace);
  vmMetrics.cpuUsage = cpuUsage;
};

export const setVMCPURequested = (vmName: string, vmNamespace: string, cpuRequested: number) => {
  const vmMetrics = getVMMetrics(vmName, vmNamespace);
  vmMetrics.cpuRequested = cpuRequested;
};

export const getCPUUsagePercentage = (vmName: string, vmNamespace: string) => {
  const { cpuRequested, cpuUsage } = getVMMetrics(vmName, vmNamespace);

  if (isEmpty(cpuRequested) || isEmpty(cpuUsage)) return;

  const percentage = (cpuUsage * 100) / cpuRequested;
  return percentage;
};

export const getMemoryUsagePercentage = (
  vmName: string,
  vmNamespace: string,
  vmiMemory: string,
) => {
  const { memoryUsage } = getVMMetrics(vmName, vmNamespace);

  if (isEmpty(memoryUsage) || isEmpty(vmiMemory)) return;

  const memoryRequested = getMemorySize(vmiMemory);

  const memoryAvailableBytes = xbytes.parseSize(
    `${memoryRequested?.size} ${memoryRequested?.unit}B`,
  );

  const percentage = (memoryUsage * 100) / memoryAvailableBytes;
  return percentage;
};

export const getNetworkUsagePercentage = (vmName: string, vmNamespace: string) => {
  const { networkUsage } = getVMMetrics(vmName, vmNamespace);

  if (isEmpty(networkUsage)) return;

  return networkUsage;
};
