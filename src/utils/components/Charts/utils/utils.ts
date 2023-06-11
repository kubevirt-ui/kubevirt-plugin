import xbytes from 'xbytes';

import DurationOption from '@kubevirt-utils/components/DurationOption/DurationOption';
import {
  dateFormatterNoYear,
  timeFormatter,
} from '@kubevirt-utils/components/Timestamp/utils/datetime';
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

export const queriesToLink = (queries: string | string[]) => {
  const queriesArray = Array.isArray(queries) ? queries : [queries];
  return queriesArray?.reduce(
    (acc, query, index) => acc.concat(`&query${index}=${encodeURIComponent(query)}`),
    '/monitoring/query-browser?',
  );
};

const isMultiDayDuration = (duration: string): boolean =>
  [DurationOption.ONE_DAY, DurationOption.ONE_WEEK, DurationOption.TWO_DAYS].includes(
    DurationOption.fromString(duration),
  );

export const tickFormat =
  (duration: string, currentTime: number) => (tick: any, index: number, ticks: any[]) => {
    const isFirst = index === 0;
    const isLast = index === ticks.length - 1;
    if (isLast || isFirst) {
      const timespan = DurationOption?.getMilliseconds(duration);
      const date = isLast ? currentTime : currentTime - timespan;
      const monthDay = dateFormatterNoYear.format(date);
      const time = timeFormatter.format(date);
      return isMultiDayDuration(duration) ? `${monthDay}\n${time}` : time;
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

export const findNetworkMaxYValue = (
  chartData: { name: string; x: Date; y: number }[][],
): number => {
  const yValues =
    !isEmpty(chartData) &&
    chartData?.map((dataArray) => {
      return Math.max(...dataArray?.map((data) => data?.y));
    });
  const maxY = Math.max(...(yValues || []));
  return Number.isInteger(maxY) ? maxY : 0;
};

export const getNetworkTickValues = (Ymax: number) => {
  const tickValues = Array.from({ length: Ymax + 1 }, (_, index) => {
    if (index === 0) return '1 Bps';
    if (index === Math.round(Ymax)) return `${Math.round(Ymax + 1)} Bps`;
    return index.toString() + ' Bps';
  });
  return tickValues;
};

export const formatNetworkYTick = (tick: any, index: number, ticks: any[]) => {
  const isFirst = index === 0;
  const isLast = index === ticks.length - 1;
  if (isLast || isFirst) {
    return tick;
  }
  return;
};

export const formatMemoryYTick = (yMax: number, fixedDigits: number) => (tick: number) => {
  const humanizedValue = xbytes(yMax, { fixed: fixedDigits, iec: true });
  const unit = humanizedValue?.split(' ')?.[1];
  if (tick === 0 && unit) return `0 ${unit}`;
  return humanizedValue || '';
};

export const findMaxYValue = (
  chartData: { name?: string; x: Date; y: number }[],
): null | number => {
  const yValues = chartData?.map((point) => point?.y);
  return yValues ? Math.max(...yValues) : 0;
};

export const findMigrationMaxYValue = (processedData, remainingData, dirtyRateData) => {
  const max = [processedData, remainingData, dirtyRateData]?.map((chartData) =>
    findMaxYValue(chartData),
  );
  return Math.max(...max);
};
