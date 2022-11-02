import { MetricChartData } from './useMetricChartData';

export type ChartPoint = { x: Date; y: number; name?: string };

export type ChartData = ChartPoint[];

export type ChartDomain = { x: [left: Date, right: Date]; y: [bottom: number, top: number] };

export type TickFormat = (tick: any, index: any, allTicks: any) => string;

type XAxisTickData = [tickValues: Date[], tickFormat: TickFormat];
export type UseXAxisTicks = (chartData: ChartData) => XAxisTickData;

type YAxisTickData = [
  tickValues: number[],
  tickFormat: (metric: string, unit: string) => TickFormat,
];
export type UseYAxisTicks = (metricChartData: MetricChartData) => YAxisTickData;
