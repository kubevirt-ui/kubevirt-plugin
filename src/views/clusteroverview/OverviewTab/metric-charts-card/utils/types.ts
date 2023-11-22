import { MetricChartData } from './hooks/useMetricChartData';

export type ChartCardProps = {
  metric: string;
};

export type MetricChartProps = { metric: string; metricChartData: MetricChartData };
