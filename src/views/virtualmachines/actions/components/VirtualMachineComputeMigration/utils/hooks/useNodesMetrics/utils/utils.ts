import { type PrometheusResult } from '@openshift-console/dynamic-plugin-sdk';

import { type MetricsDataByNode } from './types';

const getValuesByNode = (data: PrometheusResult[]): Record<string, string | undefined> => {
  return data?.reduce<Record<string, string | undefined>>((acc, dataItem) => {
    const instance = dataItem?.metric?.instance;
    if (instance) acc[instance] = dataItem?.value?.[1];
    return acc;
  }, {});
};

export const getDataByNode = (allData: { [key: string]: PrometheusResult[] }): MetricsDataByNode =>
  Object.entries(allData)?.reduce<MetricsDataByNode>((acc, [metricName, dataItem]) => {
    const valuesByNode = getValuesByNode(dataItem);
    for (const [nodeName, value] of Object.entries(valuesByNode)) {
      acc[nodeName] = acc?.[nodeName] ?? ({} as MetricsDataByNode[string]);
      acc[nodeName] = { ...acc[nodeName], [metricName]: value };
    }
    return acc;
  }, {} as MetricsDataByNode);
