import DurationOption from '@kubevirt-utils/components/DurationOption/DurationOption';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import {
  PrometheusResponse,
  PrometheusResult,
  PrometheusValue,
} from '@openshift-console/dynamic-plugin-sdk';
import { ALL_NETWORKS } from '@virtualmachines/details/tabs/metrics/utils/constants';

export const SINGLE_VM_DURATION = 'SINGLE_VM_DURATION';
export const TICKS_COUNT = 100;
export const MILLISECONDS_MULTIPLIER = 1000;

export const sumOfValues = (obj: PrometheusResponse) =>
  obj?.data?.result?.[0]?.values.reduce((acc, [, v]) => acc + Number(v), 0);

export const queriesToLink = (queries: string[] | string) => {
  const queriesArray = Array.isArray(queries) ? queries : [queries];
  return queriesArray?.reduce(
    (acc, query, index) => acc.concat(`&query${index}=${encodeURIComponent(query)}`),
    '/monitoring/query-browser?',
  );
};

export const tickFormat =
  (duration: string, currentTime: number) => (tick: any, index: number, ticks: any[]) => {
    const isFirst = index === 0;
    const isLast = index === ticks.length - 1;
    if (isLast || isFirst) {
      const date = new Date(currentTime);
      const timespan = DurationOption?.getMilliseconds(duration);
      const datePast = new Date(currentTime - timespan);
      const hours = (isLast ? date : datePast).getHours();
      const minutes = ('0' + (isLast ? date : datePast).getMinutes()).slice(-2);
      return `${hours}:${minutes}`;
    }

    return '';
  };

export const getPrometheusData = (response: PrometheusResponse): PrometheusValue[] => {
  return response?.data?.result?.[0]?.values;
};

export const getPrometheusDataByNic = (
  response: PrometheusResponse,
  nic: string,
): PrometheusResult[] => {
  if (!response?.data?.result) {
    return [];
  }
  const singleNic = response?.data?.result?.find((res) => res.metric?.interface === nic);
  return singleNic ? [singleNic] : response?.data?.result;
};

export const getPrometheusDataAllNics = (response: PrometheusResponse): PrometheusResult[] => {
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
export const findChartMaxYAxis = (chartData: { x: Date; y: number; name: string }[][]) => {
  const yValues =
    !isEmpty(chartData) &&
    chartData?.map((dataArray) => {
      return Math.max(...dataArray?.map((data) => data?.y));
    });
  const maxY = Math.max(...(yValues || []));
  return maxY;
};

export const tickValue = (Ymax: number) => {
  const tickValues = Array.from({ length: Ymax + 1 }, (_, index) => {
    if (index === 0) return '1 Bps';
    if (index === Math.round(Ymax)) return `${Math.round(Ymax + 1)} Bps`;
    return index.toString() + ' Bps';
  });
  return tickValues;
};
export const yTickFormat = (tick: any, index: number, ticks: any[]) => {
  const isFirst = index === 0;
  const isLast = index === ticks.length - 1;
  if (isLast || isFirst) {
    return tick;
  }
  return;
};
