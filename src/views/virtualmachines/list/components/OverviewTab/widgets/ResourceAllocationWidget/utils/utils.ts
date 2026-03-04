import { TFunction } from 'react-i18next';

import { timestampFor } from '@kubevirt-utils/components/Timestamp/utils/datetime';
import { NO_DATA_DASH } from '@kubevirt-utils/resources/vm/utils/constants';
import { MetricChartData } from '@overview/OverviewTab/metric-charts-card/utils/hooks/useMetricChartData';
import {
  getCurrentValue,
  getLabelUnit,
} from '@overview/OverviewTab/metric-charts-card/utils/utils';

import { getUnitLabel, UNIT_GIB } from '../hooks/useProjectResourceQuota';
import { TopClustersMetricData } from '../hooks/useTopClustersChartData';

import { CHART_DAYS_WINDOW, MIB_PER_GIB } from './constants';

export const formatTimestamp = (x: Date | undefined): string => {
  if (!(x instanceof Date)) return '';
  return timestampFor(x, new Date(), false) as string;
};

/**
 * Formats the subtitle string for a resource allocation widget
 * showing the current value and its unit.
 */
export const getMetricSubtitle = (metricChartData: MetricChartData, metric: string): string => {
  if (!metricChartData.isReady) return NO_DATA_DASH;
  const currentValue = getCurrentValue(metricChartData.chartData);
  const displayUnit = getLabelUnit(metric, metricChartData.unit);
  const formattedValue =
    currentValue != null && !isNaN(currentValue) ? currentValue.toLocaleString() : '0';
  return `${formattedValue} ${displayUnit ?? ''}`.trim();
};

/**
 * Formats a numeric value with an appropriate binary unit for display.
 * Values < 1 GiB are shown as rounded MiB; values >= 1 GiB use 2 decimal places.
 */
export const formatBinaryValue = (value: number, unit: string, t: TFunction): string => {
  const label = getUnitLabel(unit, t);
  if (unit === UNIT_GIB) {
    if (value > 0 && value < 1) return `${Math.round(value * MIB_PER_GIB)} ${t('MiB')}`;
    return `${parseFloat(value.toFixed(2))} ${label}`;
  }
  return `${value.toLocaleString()} ${label}`;
};

export const EMPTY_METRIC_DATA: MetricChartData = {
  chartData: [],
  domain: { x: [undefined, undefined], y: [0, 0] },
  error: undefined,
  isReady: false,
  largestValue: 0,
  loaded: false,
  numberOfTicks: CHART_DAYS_WINDOW,
  unit: '',
};

/** Build a MetricChartData-like object from TopClustersMetricData so useYAxisTicks works. */
export const toMetricChartData = (clusterData: TopClustersMetricData): MetricChartData => {
  const allPoints = clusterData.chartSeries.flatMap((s) => s.data);
  const yValues = allPoints.map((p) => p.y);
  const largestValue = yValues.length > 0 ? Math.max(...yValues) : 0;
  return {
    chartData: allPoints,
    domain: clusterData.domain,
    error: clusterData.error,
    isReady: clusterData.isReady,
    largestValue,
    loaded: clusterData.loaded,
    numberOfTicks: CHART_DAYS_WINDOW,
    unit: clusterData.unit,
  };
};
