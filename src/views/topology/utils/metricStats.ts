import { formatBytesAsMiB, formatCores } from '@kubevirt-utils/utils/humanize';

import { K8sResourceKind } from '../../clusteroverview/utils/types';

import { NamespaceMetrics } from './types/metric-types';
import { PodRCData } from './types/podTypes';

export type PodStats = {
  name: string;
  value: number;
  formattedValue: string;
};

export type MetricStats = {
  totalBytes?: number;
  totalCores?: number;
  memoryByPod?: PodStats[];
  cpuByPod?: PodStats[];
};

export const getPodMetricStats = (metrics: NamespaceMetrics, podData: PodRCData): MetricStats => {
  const currentPods = podData.current ? podData.current.pods : podData.pods;
  let totalBytes = 0;
  let totalCores = 0;
  const memoryByPod = [];
  const cpuByPod = [];
  if (currentPods?.length) {
    currentPods.forEach(({ metadata: { name } }: K8sResourceKind) => {
      const bytes = metrics?.memory?.[name];
      if (Number.isFinite(bytes)) {
        totalBytes += bytes;
        const formattedValue = `${formatBytesAsMiB(bytes)} MiB`;
        memoryByPod.push({ name, value: bytes, formattedValue });
      }

      const cores = metrics?.cpu?.[name];
      if (Number.isFinite(cores)) {
        totalCores += cores;
        cpuByPod[name] = `${formatCores(cores)} cores`;
        const formattedValue = `${formatCores(cores)} cores`;
        cpuByPod.push({ name, value: cores, formattedValue });
      }
    });
  }
  return { totalBytes, totalCores, memoryByPod, cpuByPod };
};
