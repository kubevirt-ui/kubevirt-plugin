import { type PrometheusResult } from '@openshift-console/dynamic-plugin-sdk';

import { type MetricsDataByNode, type NodeMetricsData } from './types';

const isNodeMetricKey = (key: string): key is keyof NodeMetricsData =>
  key === 'totalCPU' || key === 'totalMemory' || key === 'usedCPU' || key === 'usedMemory';

const parseMetricValue = (value?: string): number | undefined => {
  if (value == null) return undefined;
  const parsed = Number(value);
  return Number.isNaN(parsed) ? undefined : parsed;
};

const getValuesByNode = (data: PrometheusResult[]): Record<string, number | undefined> => {
  return data?.reduce<Record<string, number | undefined>>((acc, dataItem) => {
    const instance = dataItem?.metric?.instance;
    if (instance) acc[instance] = parseMetricValue(dataItem?.value?.[1]);
    return acc;
  }, {});
};

export const getDataByNode = (allData: { [key: string]: PrometheusResult[] }): MetricsDataByNode =>
  Object.entries(allData).reduce<MetricsDataByNode>((acc, [metricName, dataItem]) => {
    if (!isNodeMetricKey(metricName)) {
      return acc;
    }

    const valuesByNode = getValuesByNode(dataItem);
    for (const [nodeName, value] of Object.entries(valuesByNode)) {
      const existingMetrics = acc[nodeName] ?? {};
      acc[nodeName] = { ...existingMetrics, [metricName]: value };
    }
    return acc;
  }, {});
