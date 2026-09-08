import { type MetricChartData } from '@overview/OverviewTab/metric-charts-card/utils/hooks/useMetricChartData';

import { type ClusterChartSeries } from '../hooks/useTopClustersChartData';

export type ResourceAllocationChartProps = {
  chartSeries?: ClusterChartSeries[];
  effectiveData: MetricChartData;
  isMultiCluster: boolean;
  metric: string;
  quotaValue?: number;
  requestedValue?: number;
};
