import { MetricChartData } from './hooks/useMetricChartData';

export type ChartCardProps = {
  metric: string;
};

export type MetricChartProps = { metricChartData: MetricChartData; metric: string };
