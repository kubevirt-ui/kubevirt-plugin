import { abbreviateNumber } from 'js-abbreviation-number';

import { MILLISECONDS_MULTIPLIER } from '@kubevirt-utils/components/Charts/utils/utils';
import { dateFormatterNoYear } from '@kubevirt-utils/components/Timestamp/utils/datetime';
import { t } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { PrometheusValue } from '@openshift-console/dynamic-plugin-sdk';

import { humanizeBinaryBytes } from '../../../../../../utils/utils/humanize';
import { getLabelUnit, hasUnit, labeledTickIndexes } from '../utils';

import { SATURDAY, SUNDAY } from './constants';
import { ChartData, ChartPoint } from './types';

export const getDay = (point: ChartPoint) => point?.x?.getDay();

export const getValue = (point: PrometheusValue): string => point?.[1];

export const getLargestValue = (data: PrometheusValue[]) => {
  return data?.reduce((acc, point) => {
    const currValue = Number(getValue(point));
    acc = currValue > acc ? currValue : acc;
    return acc;
  }, -1);
};

export const findUnit = (metric: string, largestValue: number): string | null =>
  hasUnit(metric) ? humanizeBinaryBytes(largestValue)?.unit : null;

export const getHumanizedValue = (metric: string, value: number, unit: string): number | any =>
  hasUnit(metric) ? humanizeBinaryBytes(value, null, unit)?.value : value;

export const formatLargestValue = (metric: string, largestValue: number, unit: string): number =>
  hasUnit(metric) ? getHumanizedValue(metric, largestValue, unit) : largestValue;

export const getFormattedData = (rawData: PrometheusValue[], metric: string, unit: string) =>
  rawData?.map(([x, y]) => {
    const humanizedValue = getHumanizedValue(metric, Number(y), unit);
    return { x: new Date(x * MILLISECONDS_MULTIPLIER), y: humanizedValue };
  });

export const getNumberOfTicks = (formattedData: ChartPoint[]) =>
  formattedData?.reduce((acc, point, idx) => {
    const currPointDay = getDay(point);
    if (currPointDay !== getDay(formattedData?.[idx - 1])) {
      acc.push(currPointDay);
    }
    return acc;
  }, []);

export const getPrevDay = (pointDay: number): number =>
  pointDay === SUNDAY ? SATURDAY : pointDay - 1;

export const isSingleDayData = (chartData: ChartData): boolean =>
  getDay(chartData?.[0]) === getDay(chartData?.[chartData?.length - 1]);

// Get the index for the start and end of each day in the data
export const getDayBoundaryIndexes = (
  chartData: ChartData,
): { [key: string]: { start: number; end: number } } =>
  chartData.reduce(
    (acc, point, idx) => {
      const pointDay = getDay(point);

      if (!acc.hasOwnProperty(pointDay)) {
        // Add current day to acc if it hasn't been encountered yet
        acc[pointDay] = { start: idx, end: -1 };
        // Set the end value for the previous day to the previous index
        acc[getPrevDay(pointDay)]['end'] = idx - 1;
      }

      if (idx === chartData.length - 1) {
        // Set the end value for the current day to the
        // current index if it's the last index
        acc[pointDay]['end'] = idx;
      }

      return acc;
    },
    // Start the acc with the first day in the data and set start index to 0
    { [getDay(chartData[0])]: { start: 0, end: -1 } },
  );

// Get the middle date for each day's data
export const getDayMidpoints = (chartData: ChartData): Date[] =>
  Object.values(getDayBoundaryIndexes(chartData)).reduce((acc, day) => {
    acc.push(chartData[Math.floor((day.end + day.start) / 2)]?.x);
    return acc;
  }, []);

export const xTickFormat = (tick: Date, index: number, allTicks: Date[]): string => {
  const tickIndexesToLabel = labeledTickIndexes[allTicks.length];
  if (!tickIndexesToLabel.includes(index)) {
    return '';
  }
  if (tick.getDay() === new Date().getDay()) {
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
