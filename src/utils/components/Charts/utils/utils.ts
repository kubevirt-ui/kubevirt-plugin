import xbytes from 'xbytes';

import DurationOption from '@kubevirt-utils/components/DurationOption/DurationOption';
import {
  dateFormatterNoYear,
  timeFormatter,
} from '@kubevirt-utils/components/Timestamp/utils/datetime';
import { t } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { type ChartPoint } from '@overview/OverviewTab/metric-charts-card/utils/hooks/types';

export const SINGLE_VM_DURATION = 'SINGLE_VM_DURATION';
export const TICKS_COUNT = 100;
export const MILLISECONDS_MULTIPLIER = 1000;
export const MS_PER_DAY = 24 * 60 * 60 * MILLISECONDS_MULTIPLIER;
export const AVG_LABEL = t('Average');
export const MAX_LABEL = t('Maximum');

export * from './prometheusData';
export * from './tooltipFormatters';

export const getDriveName = (drive: string | undefined, index: number): string =>
  drive ?? t('Drive {{index}}', { index });

export const queriesToLink = (queries: string | string[]): string => {
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
  (
    duration: string,
    currentTime: number,
  ): ((tick: unknown, index: number, ticks: unknown[]) => string) =>
  (_tick: unknown, index: number, ticks: unknown[]): string => {
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

/**
 * Finds the maximum Y value across nested per-NIC chart data arrays. Ceils non-integer results.
 * @param chartData
 */
export const findNetworkMaxYValue = (chartData: ChartPoint[][] | undefined): null | number => {
  if (!chartData?.length) {
    return null;
  }

  let max = -Infinity;
  for (const dataArray of chartData) {
    if (!dataArray?.length) {
      continue;
    }
    for (const chartPoint of dataArray) {
      if (chartPoint?.y > max) {
        max = chartPoint.y;
      }
    }
  }

  if (!Number.isFinite(max)) {
    return null;
  }
  return Number.isInteger(max) ? max : Math.ceil(max);
};

export const formatNetworkYTick = (
  tick: number,
  index: number,
  ticks: number[],
): string | undefined => {
  const isFirst = index === 0;
  const isLast = index === ticks.length - 1;
  if (isLast || isFirst) {
    return xbytes(tick, { fixed: 1, iec: true });
  }
  return undefined;
};

export const formatMemoryYTick =
  (yMax: number, fixedDigits: number): ((tick: number) => string) =>
  (tick: number): string => {
    const humanizedValue = xbytes(yMax, { fixed: fixedDigits, iec: true });
    const unit = humanizedValue?.split(' ')?.[1];
    if (tick === 0 && unit) {
      return `0 ${unit}`;
    }
    return humanizedValue ?? '';
  };

/**
 * Finds the maximum Y value in a flat chart data array. Returns null when data is empty or all NaN.
 * @param chartData
 */
export const findMaxYValue = (chartData: ChartPoint[] | undefined): null | number => {
  if (!chartData?.length) {
    return null;
  }

  let max = -Infinity;
  for (const chartPoint of chartData) {
    if (chartPoint?.y > max) {
      max = chartPoint.y;
    }
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
  yMax != null ? [0, yMax === 0 ? 1 : yMax] : undefined;

/**
 * Finds the overall maximum Y across the three migration metric series. Returns null when all are empty.
 * @param processedData
 * @param remainingData
 * @param dirtyRateData
 */
export const findMigrationMaxYValue = (
  processedData: ChartPoint[] | undefined,
  remainingData: ChartPoint[] | undefined,
  dirtyRateData: ChartPoint[] | undefined,
): null | number => {
  const values = [processedData, remainingData, dirtyRateData]
    .map((chartData) => findMaxYValue(chartData))
    .filter((value): value is number => value !== null);
  return values.length ? Math.max(...values) : null;
};

/**
 * Calculate the number of digits that should be displayed after decimal point
 * based on a static list of threshold values.
 * @param bytes
 */
export const getNumberOfDigitsAfterDecimalPoint = (bytes: number): number => {
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
