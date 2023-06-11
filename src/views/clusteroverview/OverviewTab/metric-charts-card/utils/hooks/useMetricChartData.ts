import { useMemo } from 'react';

import { getPrometheusData } from '@kubevirt-utils/components/Charts/utils/utils';
import DurationOption from '@kubevirt-utils/components/DurationOption/DurationOption';
import { ALL_NAMESPACES_SESSION_KEY } from '@kubevirt-utils/hooks/constants';
import { PrometheusEndpoint, usePrometheusPoll } from '@openshift-console/dynamic-plugin-sdk';
import { useActiveNamespace } from '@openshift-console/dynamic-plugin-sdk-internal';

import { getMetricQuery } from '../metricQueries';

import { ChartData, ChartDomain } from './types';
import {
  findUnit,
  formatLargestValue,
  getFormattedData,
  getLargestValue,
  getNumberOfTicks,
} from './utils';

export type MetricChartData = {
  chartData: ChartData;
  domain: ChartDomain;
  isReady: boolean;
  largestValue: number;
  numberOfTicks: number;
  unit: string;
};

type UseMetricChartData = (metric: string) => MetricChartData;

const useMetricChartData: UseMetricChartData = (metric) => {
  const [activeNamespace] = useActiveNamespace();
  const currentTime = useMemo(() => Date.now(), []);
  const timespan = DurationOption.getMilliseconds(DurationOption.ONE_WEEK.toString());

  const [queryData] = usePrometheusPoll({
    endpoint: PrometheusEndpoint.QUERY_RANGE,
    endTime: currentTime,
    namespace: activeNamespace === ALL_NAMESPACES_SESSION_KEY ? null : activeNamespace,
    query: getMetricQuery(metric, activeNamespace),
    timespan,
  });

  const rawData = getPrometheusData(queryData);
  const largestRawValue = getLargestValue(rawData);
  const unit = findUnit(metric, largestRawValue);
  const formattedData = getFormattedData(rawData, metric, unit);
  const largestValue = formatLargestValue(metric, largestRawValue, unit);
  const numberOfTicks = getNumberOfTicks(formattedData);

  const domain: ChartDomain = {
    x: [formattedData?.[0]?.x, formattedData?.[formattedData?.length - 1]?.x],
    y: [0, largestValue],
  };

  return {
    chartData: formattedData,
    domain,
    isReady: formattedData?.length > 1,
    largestValue,
    numberOfTicks: numberOfTicks?.length,
    unit,
  };
};

export default useMetricChartData;
