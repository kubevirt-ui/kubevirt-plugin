import xbytes from 'xbytes';

import { V1CPU } from '@kubevirt-ui/kubevirt-api/kubevirt/models/V1CPU';
import { getMemorySize } from '@kubevirt-utils/components/CPUMemoryModal/utils/CpuMemoryUtils';
import { getVCPUCount } from '@kubevirt-utils/resources/vm';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { signal } from '@preact/signals-core';

export type MetricsType = {
  [key in string]: {
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

export const getCPUUsagePercentage = (vmName: string, vmNamespace: string, vmiCPU: V1CPU) => {
  const { cpuUsage } = getVMMetrics(vmName, vmNamespace);

  if (isEmpty(cpuUsage)) return;

  const cpuRequested = getVCPUCount(vmiCPU);

  return (cpuUsage * 100) / cpuRequested;
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
