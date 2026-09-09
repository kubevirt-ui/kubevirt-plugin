import { type MetricChartData } from '@kubevirt-utils/components/Charts/MetricChartUtils/hooks/useMetricChartData';

import { type ClusterChartSeries } from '../hooks/useTopClustersChartData';

export type ResourceAllocationChartProps = {
  chartSeries?: ClusterChartSeries[];
  effectiveData: MetricChartData;
  isMultiCluster: boolean;
  metric: string;
  quotaValue?: number;
  requestedValue?: number;
};
