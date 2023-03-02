import xbytes from 'xbytes';

import DurationOption from '@kubevirt-utils/components/DurationOption/DurationOption';
import {
  dateFormatterNoYear,
  timeFormatter,
} from '@kubevirt-utils/components/Timestamp/utils/datetime';
import { ALL_NAMESPACES_SESSION_KEY } from '@kubevirt-utils/hooks/constants';
import { MILLISECONDS_TO_SECONDS_MULTIPLIER } from '@kubevirt-utils/resources/vm/utils/constants';
import { multipliers } from '@kubevirt-utils/utils/units';
import { PrometheusValue } from '@openshift-console/dynamic-plugin-sdk';

import { ChartDataObject, GRID_LINES } from './constants';

export const mapPrometheusValues = (
  prometheusValues: PrometheusValue[],
  name: string,
): ChartDataObject[] =>
  (prometheusValues || []).map(([x, y], idx) => {
    return {
      x: new Date(x * MILLISECONDS_TO_SECONDS_MULTIPLIER),
      y: Number(y),
      name,
      idx,
    };
  });

export const formatTimestamp = (timespan: number, time: any, dropLine = false): string => {
  if (timespan > DurationOption.getMilliseconds('1d')) {
    return `${dateFormatterNoYear.format(time)}${dropLine ? '\n' : ' '}${timeFormatter.format(
      time,
    )}`;
  }
  return timeFormatter.format(time);
};

export const getLabel =
  (timespan: number, chartData: ChartDataObject[], formatIEC = false) =>
  (prop: { datum: any }) => {
    const datum = prop?.datum;
    const data = chartData?.[datum?.idx];
    const dataYValue = formatIEC
      ? xbytes(data?.y, {
          iec: true,
          fixed: 2,
          prefixIndex: 3,
        })
      : data?.y;
    const timestamp = formatTimestamp(timespan, datum?.x);

    return `${timestamp}\n${dataYValue} ${data?.name}`;
  };

export const getTickValuesAxisY = (maxValue: number, normalize = multipliers.Gi) => {
  const tickValues = [];

  const normalizedMaxValue = Math.ceil(maxValue / normalize);
  const gridLineSpacer = Math.ceil(normalizedMaxValue / GRID_LINES) || 1;
  for (let i = 0; i <= gridLineSpacer * GRID_LINES; i += gridLineSpacer) {
    tickValues.push(i * normalize);
  }

  return tickValues;
};

export const getTimeTickValues = (domainX: [number, number]): number[] => {
  const difference = (domainX[1] - domainX[0]) / GRID_LINES;
  return [domainX[0], domainX[0] + difference, domainX[1] - difference, domainX[1]];
};

export const getDomainY = (maxValue: number, normalize = multipliers.Gi): [number, number] => {
  const tickValues = getTickValuesAxisY(maxValue, normalize);
  return [tickValues?.[0], tickValues?.[GRID_LINES]];
};

export const getBaseQuery = (duration: string, activeNamespace: string) => {
  const namespacedQuery = activeNamespace !== ALL_NAMESPACES_SESSION_KEY;

  return `(sum_over_time(kubevirt_migrate_vmi_data_processed_bytes${
    namespacedQuery ? `{namespace='${activeNamespace}'}` : ''
  }[${duration}]))${namespacedQuery ? ' BY (namespace)' : ''}`;
};
