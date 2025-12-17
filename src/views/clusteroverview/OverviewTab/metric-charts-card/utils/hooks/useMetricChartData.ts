import { useMemo } from 'react';

import { getPrometheusData } from '@kubevirt-utils/components/Charts/utils/utils';
import DurationOption from '@kubevirt-utils/components/DurationOption/DurationOption';
import { ALL_CLUSTERS_KEY, ALL_NAMESPACES_SESSION_KEY } from '@kubevirt-utils/hooks/constants';
import useActiveNamespace from '@kubevirt-utils/hooks/useActiveNamespace';
import useActiveClusterParam from '@multicluster/hooks/useActiveClusterParam';
import { PrometheusEndpoint } from '@openshift-console/dynamic-plugin-sdk';
import { useFleetPrometheusPoll, useHubClusterName } from '@stolostron/multicluster-sdk';

import { getMetricQuery } from '../metricQueries';

import { ChartData, ChartDomain } from './types';
import {
  findUnit,
  formatLargestValue,
  getDaySpan,
  getFormattedData,
  getLargestValue,
} from './utils';

export type MetricChartData = {
  chartData: ChartData;
  domain: ChartDomain;
  error: Error | unknown;
  isReady: boolean;
  largestValue: number;
  loaded: boolean;
  numberOfTicks: number;
  unit: string;
};

type UseMetricChartData = (metric: string) => MetricChartData;

const useMetricChartData: UseMetricChartData = (metric) => {
  const activeNamespace = useActiveNamespace();
  const cluster = useActiveClusterParam();
  const [hubClusterName] = useHubClusterName();
  const currentTime = useMemo(() => Date.now(), []);
  const timespan = DurationOption.getMilliseconds(DurationOption.ONE_WEEK.toString());

  const [queryData, loaded, error] = useFleetPrometheusPoll({
    endpoint: PrometheusEndpoint.QUERY_RANGE,
    endTime: currentTime,
    namespace: activeNamespace === ALL_NAMESPACES_SESSION_KEY ? undefined : activeNamespace,
    query: getMetricQuery(
      metric,
      activeNamespace,
      cluster === ALL_CLUSTERS_KEY ? undefined : cluster,
      cluster === ALL_CLUSTERS_KEY ? undefined : hubClusterName,
    ),
    timespan,
    ...(cluster === ALL_CLUSTERS_KEY ? { allClusters: true } : { cluster }),
  });

  const rawData = getPrometheusData(queryData);
  const largestRawValue = getLargestValue(rawData);
  const unit = findUnit(metric, largestRawValue);
  const formattedData = getFormattedData(rawData, metric, unit);
  const largestValue = formatLargestValue(metric, largestRawValue, unit);

  const domain: ChartDomain = useMemo(
    () => ({
      x:
        formattedData?.length > 0
          ? [formattedData[0]?.x, formattedData[formattedData.length - 1]?.x]
          : [undefined, undefined],
      y: [0, largestValue],
    }),
    [formattedData, largestValue],
  );

  const daySpan = useMemo(() => getDaySpan(domain.x[0], domain.x[1]), [domain]);

  return {
    chartData: formattedData,
    domain,
    error,
    isReady: formattedData?.length > 1,
    largestValue,
    loaded,
    numberOfTicks: daySpan,
    unit,
  };
};

export default useMetricChartData;
