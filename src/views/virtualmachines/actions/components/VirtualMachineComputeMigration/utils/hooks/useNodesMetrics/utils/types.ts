export type NodeMetricsData = {
  totalCPU: number;
  totalMemory: number;
  usedCPU: number;
  usedMemory: number;
};

export type MetricsDataByNode = { [nodeName: string]: NodeMetricsData };
