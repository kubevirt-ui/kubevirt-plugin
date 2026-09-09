import {
  type PrometheusResponse,
  type PrometheusResult,
  type PrometheusValue,
} from '@openshift-console/dynamic-plugin-sdk';
import { ALL_NETWORKS } from '@virtualmachines/details/tabs/metrics/utils/constants';

export const getPrometheusData = (
  response: PrometheusResponse | undefined,
): PrometheusValue[] | undefined => response?.data?.result?.[0]?.values;

export const getPrometheusDataByNic = (
  response: PrometheusResponse | undefined,
  nic: string,
): PrometheusResult[] => {
  if (!response?.data?.result) {
    return [];
  }
  const singleNic = response?.data?.result?.find((res) => res.metric?.interface === nic);
  return singleNic ? [singleNic] : response?.data?.result;
};

export const getPrometheusDataAllNics = (
  response: PrometheusResponse | undefined,
): PrometheusResult[] => {
  if (!response?.data?.result) {
    return [];
  }
  return [
    {
      ...response?.data?.result?.[0],
      metric: { ...response?.data?.result?.[0]?.metric, interface: ALL_NETWORKS },
    },
  ];
};
