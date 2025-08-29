import xbytes from 'xbytes';

import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { getMemorySize } from '@kubevirt-utils/components/CPUMemoryModal/utils/CpuMemoryUtils';
import { NO_MULTICLUSTER_KEY } from '@kubevirt-utils/resources/constants';
import { getName, getNamespace } from '@kubevirt-utils/resources/shared';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { getCluster } from '@multicluster/helpers/selectors';
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

export const getVMMetrics = (vm: V1VirtualMachine) => {
  const cluster = getCluster(vm) || NO_MULTICLUSTER_KEY;
  const namespace = getNamespace(vm);
  const name = getName(vm);
  const vmMetrics = vmsMetrics.value?.[`${cluster}-${namespace}-${name}`];
  if (isEmpty(vmMetrics)) vmsMetrics.value[`${cluster}-${namespace}-${name}`] = {};

  return vmsMetrics.value?.[`${cluster}-${namespace}-${name}`];
};

export const getVMMetricsWithParams = (
  name: string,
  namespace: string,
  cluster = NO_MULTICLUSTER_KEY,
) => {
  const vmMetrics = vmsMetrics.value?.[`${cluster}-${namespace}-${name}`];
  if (isEmpty(vmMetrics)) vmsMetrics.value[`${cluster}-${namespace}-${name}`] = {};

  return vmsMetrics.value?.[`${cluster}-${namespace}-${name}`];
};

export const setVMMemoryUsage = (
  name: string,
  namespace: string,
  cluster = NO_MULTICLUSTER_KEY,
  memoryUsage: number,
) => {
  const vmMetrics = getVMMetricsWithParams(name, namespace, cluster);

  vmMetrics.memoryUsage = memoryUsage;
};

export const setVMNetworkUsage = (
  name: string,
  namespace: string,
  cluster = NO_MULTICLUSTER_KEY,
  networkUsage: number,
) => {
  const vmMetrics = getVMMetricsWithParams(name, namespace, cluster);
  vmMetrics.networkUsage = networkUsage;
};

export const setVMCPUUsage = (
  name: string,
  namespace: string,
  cluster = NO_MULTICLUSTER_KEY,
  cpuUsage: number,
) => {
  const vmMetrics = getVMMetricsWithParams(name, namespace, cluster);
  vmMetrics.cpuUsage = cpuUsage;
};

export const setVMCPURequested = (
  name: string,
  namespace: string,
  cluster = NO_MULTICLUSTER_KEY,
  cpuRequested: number,
) => {
  const vmMetrics = getVMMetricsWithParams(name, namespace, cluster);
  vmMetrics.cpuRequested = cpuRequested;
};

export const getCPUUsagePercentage = (vm: V1VirtualMachine) => {
  const { cpuRequested, cpuUsage } = getVMMetrics(vm);

  if (isEmpty(cpuRequested) || isEmpty(cpuUsage)) return;

  const percentage = (cpuUsage * 100) / cpuRequested;
  return percentage;
};

export const getMemoryUsagePercentage = (vm: V1VirtualMachine, vmiMemory: string) => {
  const { memoryUsage } = getVMMetrics(vm);

  if (isEmpty(memoryUsage) || isEmpty(vmiMemory)) return;

  const memoryRequested = getMemorySize(vmiMemory);

  const memoryAvailableBytes = xbytes.parseSize(
    `${memoryRequested?.size} ${memoryRequested?.unit}B`,
  );

  const percentage = (memoryUsage * 100) / memoryAvailableBytes;
  return percentage;
};

export const getNetworkUsagePercentage = (vm: V1VirtualMachine) => {
  const { networkUsage } = getVMMetrics(vm);

  if (isEmpty(networkUsage)) return;

  return networkUsage;
};
