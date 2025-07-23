import { PrometheusResult } from '@openshift-console/dynamic-plugin-sdk';

const getValuesByNode = (data: PrometheusResult[]) => {
  return data?.reduce((acc, dataItem) => {
    acc[dataItem?.metric?.instance] = dataItem?.value?.[1];
    return acc;
  }, {});
};

export const getDataByNode = (allData: { [key: string]: PrometheusResult[] }) =>
  Object.entries(allData)?.reduce((acc, [metricName, dataItem]) => {
    const valuesByNode = getValuesByNode(dataItem);
    Object.entries(valuesByNode).forEach(([nodeName, value]) => {
      acc[nodeName] = acc?.[nodeName] || {};
      acc[nodeName] = { ...acc[nodeName], [metricName]: value };
    });
    return acc;
  }, {});
