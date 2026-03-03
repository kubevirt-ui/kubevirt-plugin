import { MILLISECONDS_MULTIPLIER } from '@kubevirt-utils/components/Charts/utils/utils';
import { PrometheusResponse } from '@openshift-console/dynamic-plugin-sdk';
import { ChartDomain } from '@overview/OverviewTab/metric-charts-card/utils/hooks/types';
import { getHumanizedValue } from '@overview/OverviewTab/metric-charts-card/utils/hooks/utils';
import { chart_color_black_500 } from '@patternfly/react-tokens';
import chart_color_blue_300 from '@patternfly/react-tokens/dist/esm/chart_color_blue_300';
import chart_color_green_400 from '@patternfly/react-tokens/dist/esm/chart_color_green_400';
import chart_color_orange_300 from '@patternfly/react-tokens/dist/esm/chart_color_orange_300';
import chart_color_purple_300 from '@patternfly/react-tokens/dist/esm/chart_color_purple_300';

export const CLUSTER_COLORS = [
  chart_color_blue_300.value,
  chart_color_green_400.value,
  chart_color_orange_300.value,
  chart_color_purple_300.value,
  chart_color_black_500.value,
];

export type ClusterChartSeries = {
  clusterName: string;
  color: string;
  data: { x: Date; y: number }[];
};

export type TopClustersMetricData = {
  chartSeries: ClusterChartSeries[];
  domain: ChartDomain;
  error: unknown;
  isReady: boolean;
  loaded: boolean;
  unit: string;
};

export type ClusterRawData = {
  clusterName: string;
  currentValue: number;
  values: [number, string][];
};

/** Extract per-cluster time-series from a Prometheus QUERY_RANGE response. */
export const extractPerClusterData = (
  response: PrometheusResponse,
  unknownClusterLabel: string,
): ClusterRawData[] => {
  const results = response?.data?.result;
  if (!results || results.length === 0) return [];

  return results.map((result) => {
    const clusterName = result.metric?.cluster ?? unknownClusterLabel;
    const values = result.values ?? [];
    const lastValue = values.length > 0 ? Number(values[values.length - 1]?.[1]) || 0 : 0;
    return { clusterName, currentValue: lastValue, values };
  });
};

/** Extract cluster names from an instant QUERY (topk) response. */
export const extractClusterNames = (response: PrometheusResponse): string[] => {
  const results = response?.data?.result;
  if (!results || results.length === 0) return [];
  return results.map((r) => r.metric?.cluster).filter((name): name is string => Boolean(name));
};

/** Format raw per-cluster data into chart series for the given top clusters. */
export const buildChartSeries = (
  rawClusters: ClusterRawData[],
  topClusterNames: string[],
  metric: string,
  unit: string,
): ClusterChartSeries[] =>
  topClusterNames
    .map((name, idx) => {
      const clusterData = rawClusters.find((c) => c.clusterName === name);
      if (!clusterData) return null;

      const data = clusterData.values.map(([timestamp, value]) => {
        const parsed = Number(value);
        return {
          x: new Date(timestamp * MILLISECONDS_MULTIPLIER),
          y: getHumanizedValue(metric, Number.isFinite(parsed) ? parsed : 0, unit),
        };
      });

      return { clusterName: name, color: CLUSTER_COLORS[idx % CLUSTER_COLORS.length], data };
    })
    .filter(Boolean) as ClusterChartSeries[];

export const EMPTY_DOMAIN: ChartDomain = { x: [undefined, undefined], y: [0, 0] };
