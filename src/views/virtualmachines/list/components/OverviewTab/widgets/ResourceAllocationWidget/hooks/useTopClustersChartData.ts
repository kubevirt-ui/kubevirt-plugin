import { useMemo } from 'react';

import DurationOption from '@kubevirt-utils/components/DurationOption/DurationOption';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { PrometheusEndpoint } from '@openshift-console/dynamic-plugin-sdk';
import { ChartDomain } from '@overview/OverviewTab/metric-charts-card/utils/hooks/types';
import {
  findUnit,
  formatLargestValue,
  getLargestValue,
} from '@overview/OverviewTab/metric-charts-card/utils/hooks/utils';
import {
  getFilteredPerClusterQuery,
  getTopClusterRankingQuery,
} from '@overview/OverviewTab/metric-charts-card/utils/metricQueries';
import { useFleetPrometheusPoll } from '@stolostron/multicluster-sdk';

import { TOP_N } from '../../ClusterStatusWidget/hooks/clusterMetricConstants';
import {
  buildChartSeries,
  EMPTY_DOMAIN,
  extractClusterNames,
  extractPerClusterData,
  TopClustersMetricData,
} from '../utils/topClustersChartUtils';

export type { ClusterChartSeries, TopClustersMetricData } from '../utils/topClustersChartUtils';

const CHART_TIMESPAN = DurationOption.getMilliseconds(DurationOption.ONE_WEEK.toString());

/**
 * Returns per-cluster chart data for a given metric, filtered to the top N clusters.
 * The Prometheus QUERY_RANGE is scoped to only the provided cluster names.
 * Pass `enabled = false` to skip the Prometheus fetch entirely.
 */
export const useTopClustersChartData = (
  metric: string,
  topClusterNames: string[],
  enabled = true,
): TopClustersMetricData => {
  const { t } = useKubevirtTranslation();
  const currentTime = useMemo(() => Date.now(), []);

  const query = useMemo(
    () =>
      enabled && topClusterNames.length > 0
        ? getFilteredPerClusterQuery(metric, topClusterNames)
        : undefined,
    [enabled, metric, topClusterNames],
  );

  const [queryData, loaded, loadError] = useFleetPrometheusPoll({
    allClusters: true,
    endpoint: PrometheusEndpoint.QUERY_RANGE,
    endTime: currentTime,
    query,
    timespan: CHART_TIMESPAN,
  });

  const error = enabled ? loadError : undefined;
  const isLoaded = enabled ? loaded : true;

  return useMemo(() => {
    const rawClusters = extractPerClusterData(queryData, t('Unknown'));

    const allValues = rawClusters.flatMap((c) => c.values);
    const largestRaw = Math.max(0, getLargestValue(allValues));
    const unit = findUnit(metric, largestRaw) ?? '';
    const largestValue = formatLargestValue(metric, largestRaw, unit);

    const chartSeries = buildChartSeries(rawClusters, topClusterNames, metric, unit);

    const allPoints = chartSeries.flatMap((s) => s.data);
    const xValues = allPoints.map((p) => p.x);
    const domain: ChartDomain =
      xValues.length > 0
        ? {
            x: [
              new Date(Math.min(...xValues.map(Number))),
              new Date(Math.max(...xValues.map(Number))),
            ],
            y: [0, largestValue],
          }
        : EMPTY_DOMAIN;

    return {
      chartSeries,
      domain,
      error,
      isReady: chartSeries.length > 0 && chartSeries.some((s) => s.data.length > 0),
      loaded: isLoaded,
      unit,
    };
  }, [queryData, isLoaded, error, metric, topClusterNames, t]);
};

/**
 * Determines the top N cluster names using an instant `topk()` query.
 * Pass `enabled = false` to skip the Prometheus fetch entirely.
 */
export const useTopClusterNames = (
  rankingMetric: string,
  enabled = true,
): { error: unknown; loaded: boolean; topClusterNames: string[] } => {
  const query = useMemo(
    () => (enabled ? getTopClusterRankingQuery(rankingMetric, TOP_N) : undefined),
    [enabled, rankingMetric],
  );

  const [queryData, loaded, loadError] = useFleetPrometheusPoll({
    allClusters: true,
    endpoint: PrometheusEndpoint.QUERY,
    query,
  });

  const topClusterNames = useMemo(() => extractClusterNames(queryData), [queryData]);

  return {
    error: enabled ? loadError : undefined,
    loaded: enabled ? loaded : true,
    topClusterNames,
  };
};
