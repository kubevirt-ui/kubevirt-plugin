import xbytes from 'xbytes';

import { V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { V1CPU } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { getMemorySize } from '@kubevirt-utils/components/CPUMemoryModal/utils/CpuMemoryUtils';
import { SINGLE_CLUSTER_KEY } from '@kubevirt-utils/resources/constants';
import { getName, getNamespace } from '@kubevirt-utils/resources/shared';
import { getVCPUCount } from '@kubevirt-utils/resources/vm';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { getCluster } from '@multicluster/helpers/selectors';
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

export const getVMMetrics = (vm: V1VirtualMachine) => {
  const cluster = getCluster(vm) || SINGLE_CLUSTER_KEY;
  const namespace = getNamespace(vm);
  const name = getName(vm);
  const vmMetrics = vmsMetrics.value?.[`${cluster}-${namespace}-${name}`];
  if (isEmpty(vmMetrics)) vmsMetrics.value[`${cluster}-${namespace}-${name}`] = {};

  return vmsMetrics.value?.[`${cluster}-${namespace}-${name}`];
};

export const getVMMetricsWithParams = (
  name: string,
  namespace: string,
  cluster = SINGLE_CLUSTER_KEY,
) => {
  const vmMetrics = vmsMetrics.value?.[`${cluster}-${namespace}-${name}`];
  if (isEmpty(vmMetrics)) vmsMetrics.value[`${cluster}-${namespace}-${name}`] = {};

  return vmsMetrics.value?.[`${cluster}-${namespace}-${name}`];
};

export const setVMMemoryUsage = (
  name: string,
  namespace: string,
  cluster = SINGLE_CLUSTER_KEY,
  memoryUsage: number,
) => {
  const vmMetrics = getVMMetricsWithParams(name, namespace, cluster);

  vmMetrics.memoryUsage = memoryUsage;
};

export const setVMNetworkUsage = (
  name: string,
  namespace: string,
  cluster = SINGLE_CLUSTER_KEY,
  networkUsage: number,
) => {
  const vmMetrics = getVMMetricsWithParams(name, namespace, cluster);
  vmMetrics.networkUsage = networkUsage;
};

export const setVMCPUUsage = (
  name: string,
  namespace: string,
  cluster = SINGLE_CLUSTER_KEY,
  cpuUsage: number,
) => {
  const vmMetrics = getVMMetricsWithParams(name, namespace, cluster);
  vmMetrics.cpuUsage = cpuUsage;
};

export const getCPUUsagePercentage = (vm: V1VirtualMachine, vmiCPU: V1CPU) => {
  const { cpuUsage } = getVMMetrics(vm);

  if (isEmpty(cpuUsage)) return;

  const cpuRequested = getVCPUCount(vmiCPU);

  return (cpuUsage * 100) / cpuRequested;
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
