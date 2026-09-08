import { type V1CPU, type V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { SINGLE_CLUSTER_KEY } from '@kubevirt-utils/resources/constants';
import { getClusterKey, getName, getNamespace } from '@kubevirt-utils/resources/shared';
import { getVCPUCount } from '@kubevirt-utils/resources/vm';
import { convertToBaseValue } from '@kubevirt-utils/utils/humanize.js';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { type PrometheusResponse } from '@openshift-console/dynamic-plugin-sdk';
import { signal } from '@preact/signals-core';

export enum Metric {
  CpuRequested = 'cpuRequested',
  CpuUsage = 'cpuUsage',
  MemoryCapacity = 'memoryCapacity',
  MemoryUsage = 'memoryUsage',
  NetworkUsage = 'networkUsage',
  StorageCapacity = 'storageCapacity',
  StorageUsage = 'storageUsage',
}

type MetricsObject = {
  [key in Metric]?: number;
};

type MetricsType = {
  [key in string]: MetricsObject;
};

const vmsMetrics = signal<MetricsType>({});

export const getVMMetrics = (vm: V1VirtualMachine): MetricsObject => {
  const cluster = getClusterKey(vm);
  const namespace = getNamespace(vm);
  const name = getName(vm);

  return getVMMetricsWithParams(name, namespace, cluster);
};

export const getVMMetricsWithParams = (
  name: string,
  namespace: string,
  cluster = SINGLE_CLUSTER_KEY,
): MetricsObject => {
  const vmMetrics = vmsMetrics.value?.[`${cluster}-${namespace}-${name}`];
  if (isEmpty(vmMetrics)) vmsMetrics.value[`${cluster}-${namespace}-${name}`] = {};

  return vmsMetrics.value?.[`${cluster}-${namespace}-${name}`];
};

const setMetricValue = (
  name: string,
  namespace: string,
  cluster = SINGLE_CLUSTER_KEY,
  metric: Metric,
  value: number,
): void => {
  const vmMetrics = getVMMetricsWithParams(name, namespace, cluster);
  vmMetrics[metric] = value;
};

export const setMetricFromResponse = (response: PrometheusResponse, metric: Metric): void => {
  for (const result of response?.data?.result ?? []) {
    const vmName = result?.metric?.name;
    const vmNamespace = result?.metric?.namespace;
    const vmCluster = result?.metric?.cluster;
    const value = parseFloat(result?.value?.[1]);

    setMetricValue(vmName, vmNamespace, vmCluster, metric, value);
  }
};

const hasNumericMetric = (value: number | undefined): value is number =>
  typeof value === 'number' && Number.isFinite(value);

export const resetVMMetrics = (): void => {
  vmsMetrics.value = {};
};

export const getCPUUsagePercentage = (
  vm: V1VirtualMachine,
  vmiCPU: undefined | V1CPU,
): number | undefined => {
  const { cpuUsage } = getVMMetrics(vm);

  if (!hasNumericMetric(cpuUsage) || isEmpty(vmiCPU)) return;

  const cpuRequested = getVCPUCount(vmiCPU);

  return (cpuUsage * 100) / cpuRequested;
};

export const getMemoryUsagePercentage = (
  vm: V1VirtualMachine,
  vmiMemory: string | undefined,
): number | undefined => {
  const { memoryUsage } = getVMMetrics(vm);

  if (!hasNumericMetric(memoryUsage) || isEmpty(vmiMemory)) return;

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const memoryAvailableBytes = convertToBaseValue(vmiMemory);

  if (!memoryAvailableBytes) return;

  return (memoryUsage * 100) / memoryAvailableBytes;
};

export const getNetworkUsagePercentage = (vm: V1VirtualMachine): number | undefined => {
  const { networkUsage } = getVMMetrics(vm);

  if (!hasNumericMetric(networkUsage)) return;

  return networkUsage;
};
