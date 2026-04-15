import xbytes from 'xbytes';

import DurationOption from '@kubevirt-utils/components/DurationOption/DurationOption';
import {
  dateFormatterNoYear,
  timeFormatter,
  timestampFor,
} from '@kubevirt-utils/components/Timestamp/utils/datetime';
import { t } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import {
  PrometheusResponse,
  PrometheusResult,
  PrometheusValue,
} from '@openshift-console/dynamic-plugin-sdk';
import { ChartPoint } from '@overview/OverviewTab/metric-charts-card/utils/hooks/types';
import { ALL_NETWORKS } from '@virtualmachines/details/tabs/metrics/utils/constants';

import { humanizeSeconds } from '../../../utils/humanize';

export const SINGLE_VM_DURATION = 'SINGLE_VM_DURATION';
export const TICKS_COUNT = 100;
export const MILLISECONDS_MULTIPLIER = 1000;
export const MS_PER_DAY = 24 * 60 * 60 * MILLISECONDS_MULTIPLIER;
export const AVG_LABEL = t('Average');
export const MAX_LABEL = t('Maximum');

export const getDriveName = (drive: string | undefined, index: number): string =>
  drive || t('Drive {{index}}', { index });

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
  (duration: string, currentTime: number) => (_tick: any, index: number, ticks: any[]) => {
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

/**
 * Finds the maximum Y value across nested per-NIC chart data arrays. Ceils non-integer results.
 * @param chartData
 */
export const findNetworkMaxYValue = (
  chartData: { name: string; x: Date; y: number }[][],
): null | number => {
  if (!chartData?.length) return null;

  let max = -Infinity;
  for (const dataArray of chartData) {
    if (!dataArray?.length) continue;
    for (const point of dataArray) {
      if (point?.y > max) max = point.y;
    }
  }

  if (!Number.isFinite(max)) return null;
  return Number.isInteger(max) ? max : Math.ceil(max);
};

export const formatNetworkYTick = (tick: any, index: number, ticks: any[]) => {
  const isFirst = index === 0;
  const isLast = index === ticks.length - 1;
  if (isLast || isFirst) {
    return xbytes(tick, { fixed: 1, iec: true });
  }
  return;
};

export const formatMemoryYTick = (yMax: number, fixedDigits: number) => (tick: number) => {
  const humanizedValue = xbytes(yMax, { fixed: fixedDigits, iec: true });
  const unit = humanizedValue?.split(' ')?.[1];
  if (tick === 0 && unit) return `0 ${unit}`;
  return humanizedValue || '';
};

/**
 * Finds the maximum Y value in a flat chart data array. Returns null when data is empty or all NaN.
 * @param chartData
 */
export const findMaxYValue = (
  chartData: { name?: string; x: Date; y: number }[],
): null | number => {
  if (!chartData?.length) return null;

  let max = -Infinity;
  for (const point of chartData) {
    if (point?.y > max) max = point.y;
  }

  return Number.isFinite(max) ? max : null;
};

/**
 * Returns a [0, max] range suitable for Y-axis domain and tickValues.
 * Returns undefined when max is null (no data), letting the chart library auto-scale.
 * Ensures a minimum positive range to avoid degenerate [0, 0] domains.
 * @param yMax - the maximum Y value, or null when no data is available
 */
export const getChartYRange = (yMax: null | number): [number, number] | undefined =>
  yMax != null ? [0, yMax || 1] : undefined;

/**
 * Finds the overall maximum Y across the three migration metric series. Returns null when all are empty.
 * @param processedData
 * @param remainingData
 * @param dirtyRateData
 */
export const findMigrationMaxYValue = (
  processedData,
  remainingData,
  dirtyRateData,
): null | number => {
  const values = [processedData, remainingData, dirtyRateData]
    .map((chartData) => findMaxYValue(chartData))
    .filter((v): v is number => v !== null);
  return values.length ? Math.max(...values) : null;
};

/**
 * Calculate the number of digits that should be displayed after decimal point
 * based on a static list of threshold values.
 * @param bytes
 */
export const getNumberOfDigitsAfterDecimalPoint = (bytes: number) => {
  const threshold2digits: [string, number][] = [
    ['1 GiB', 0],
    ['10 GiB', 2],
    ['100 GiB', 1],
    ['1 TiB', 0],
    ['10 TiB', 2],
    ['100 TiB', 1],
    ['1 PiB', 0],
  ];

  const [, digitsAfterDecimalPoint = 2] =
    threshold2digits
      .map(([threshold, value]) => [xbytes.parse(threshold).bytes, value])
      .find(([threshold]) => bytes < threshold) ?? [];

  return digitsAfterDecimalPoint;
};

export const addTimestampToTooltip =
  (formatData: (point: ChartPoint) => string) =>
  ({ datum }: { datum: ChartPoint }) =>
    `${timestampFor(datum?.x as Date, new Date(), false)}\n ${formatData(datum)}`;

// Resource utilization charts

export const formatCPUUtilTooltipData = (datum: ChartPoint) =>
  `${datum?.name}: ${datum?.y?.toFixed(2)}'s`;

export const formatMemoryThresholdTooltipData = (datum: ChartPoint) =>
  `${datum?.name}: ${xbytes(datum?.y, {
    fixed: 2,
    iec: true,
  })}`;

// Storage charts

export const formatStorageReadThresholdTooltipData = (datum: ChartPoint) =>
  t('Data read: {{input}}', { input: xbytes(datum?.y, { fixed: 2, iec: true }) });

export const formatStorageWriteThresholdTooltipData = (datum: ChartPoint) =>
  t('Data written: {{input}}', { input: xbytes(datum?.y, { fixed: 2, iec: true }) });

export const formatStorageTotalReadWriteThresholdTooltipData = (datum: ChartPoint) =>
  t('Data transfer: {{input}}', {
    input: xbytes(datum?.y, { fixed: 2, iec: true }),
  });

export const formatStorageIOPSTotalThresholdTooltipData = (datum: ChartPoint) =>
  t('IOPS total: {{input}}', { input: datum?.y?.toFixed(2) });

export const formatStorageLatencyTooltipData = (datum: ChartPoint) => {
  const humanized = humanizeSeconds(datum?.y, 's', 'ms');
  return t('Latency: {{input}} {{unit}}', { input: humanized.value, unit: humanized.unit });
};

export const formatStorageReadLatencyAvgMaxTooltipData = (datum: ChartPoint) =>
  t('{{name}}: {{input}}ms', {
    input: (datum?.y * 1000)?.toFixed(2),
    name: datum?.name || 'Read latency',
  });

export const formatStorageWriteLatencyAvgMaxTooltipData = (datum: ChartPoint) =>
  t('{{name}}: {{input}}ms', {
    input: (datum?.y * 1000)?.toFixed(2),
    name: datum?.name || 'Write latency',
  });

// Network charts

export const formatNetworkThresholdSingleSourceTooltipData = (datum: ChartPoint) =>
  `${xbytes(datum?.y, {
    fixed: 2,
    iec: true,
  })}ps`;

export const formatNetworkThresholdTooltipData = (datum: ChartPoint) =>
  `${datum?.name}: ${xbytes(datum?.y, { fixed: 2, iec: true })}`;

// Migration charts

export const formatMigrationThresholdTooltipData = (datum: ChartPoint) =>
  `${datum?.name}: ${xbytes(datum?.y, { fixed: 2, iec: true })}`;

export const formatMigrationThresholdDiskRateTooltipData = (datum: ChartPoint) =>
  `${datum?.name}: ${xbytes(datum?.y, { fixed: 2, iec: true })}`;
