import { abbreviateNumber } from 'js-abbreviation-number';

import { MILLISECONDS_MULTIPLIER, MS_PER_DAY } from '@kubevirt-utils/components/Charts/utils/utils';
import { dateFormatterNoYear } from '@kubevirt-utils/components/Timestamp/utils/datetime';
import { t } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { PrometheusValue } from '@openshift-console/dynamic-plugin-sdk';

import { humanizeBinaryBytes } from '../../../../../../utils/utils/humanize';
import { getLabelUnit, hasUnit, labeledTickIndexes } from '../utils';

import { ChartData, ChartPoint } from './types';

// Returns a unique date key like "2024-12-15" for grouping data points by calendar day
export const getDateKey = (point: ChartPoint): string => {
  const date = point?.x;
  if (!date) return '';
  return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
};

export const getValue = (point: PrometheusValue): string => point?.[1];

export const getLargestValue = (data: PrometheusValue[]) => {
  return data?.reduce((acc, point) => {
    const currValue = Number(getValue(point));
    acc = currValue > acc ? currValue : acc;
    return acc;
  }, -1);
};

export const findUnit = (metric: string, largestValue: number): null | string =>
  hasUnit(metric) ? humanizeBinaryBytes(largestValue)?.unit : null;

export const getHumanizedValue = (metric: string, value: number, unit: string): any | number =>
  hasUnit(metric) ? humanizeBinaryBytes(value, null, unit)?.value : value;

export const formatLargestValue = (metric: string, largestValue: number, unit: string): number =>
  hasUnit(metric) ? getHumanizedValue(metric, largestValue, unit) : largestValue;

export const getFormattedData = (rawData: PrometheusValue[], metric: string, unit: string) =>
  rawData?.map(([x, y]) => {
    const humanizedValue = getHumanizedValue(metric, Number(y), unit);
    return { x: new Date(x * MILLISECONDS_MULTIPLIER), y: humanizedValue };
  });

// Calculate actual day span between two dates (inclusive)
export const getDaySpan = (startDate: Date, endDate: Date): number => {
  if (!startDate || !endDate) return 0;
  return Math.ceil((endDate.getTime() - startDate.getTime()) / MS_PER_DAY) + 1;
};

export const isSingleDayData = (chartData: ChartData): boolean =>
  getDateKey(chartData?.[0]) === getDateKey(chartData?.[chartData?.length - 1]);

// Get the index for the start and end of each day in the data
export const getDayBoundaryIndexes = (
  chartData: ChartData,
): { [key: string]: { end: number; start: number } } => {
  if (!chartData || chartData.length === 0) {
    return {};
  }

  let prevDateKey: null | string = null;

  return chartData.reduce(
    (acc, point, idx) => {
      const dateKey = getDateKey(point);

      if (!acc.hasOwnProperty(dateKey)) {
        // Add current day to acc if it hasn't been encountered yet
        acc[dateKey] = { end: -1, start: idx };
        // Set the end value for the previous day to the previous index
        if (prevDateKey && acc[prevDateKey]) {
          acc[prevDateKey]['end'] = idx - 1;
        }
      }

      if (idx === chartData.length - 1) {
        // Set the end value for the current day to the
        // current index if it's the last index
        acc[dateKey]['end'] = idx;
      }

      prevDateKey = dateKey;
      return acc;
    },
    // Start the acc with the first day in the data and set start index to 0
    { [getDateKey(chartData[0])]: { end: -1, start: 0 } },
  );
};

// Get the middle date for each day's data
export const getDayMidpoints = (chartData: ChartData): Date[] =>
  Object.values(getDayBoundaryIndexes(chartData)).reduce((acc, day) => {
    acc.push(chartData[Math.floor((day.end + day.start) / 2)]?.x);
    return acc;
  }, []);

export const xTickFormat = (tick: Date, index: number, allTicks: Date[]): string => {
  const tickIndexesToLabel = labeledTickIndexes[allTicks.length];
  // When no specific tick labeling is defined, show first and last labels
  const shouldShowLabel = tickIndexesToLabel
    ? tickIndexesToLabel.includes(index)
    : index === 0 || index === allTicks.length - 1;

  if (!shouldShowLabel) {
    return '';
  }
  const today = new Date();
  const isToday =
    tick.getFullYear() === today.getFullYear() &&
    tick.getMonth() === today.getMonth() &&
    tick.getDate() === today.getDate();
  if (isToday) {
    return t('Today');
  }
  return dateFormatterNoYear.format(tick);
};

export const yTickFormat = (metric: string, unit: string) => (tick, index, allTicks) => {
  if (tick === 0 || index === allTicks?.length - 1) {
    return `${abbreviateNumber(tick, 1)} ${getLabelUnit(metric, unit)}`;
  }
  return null;
};
