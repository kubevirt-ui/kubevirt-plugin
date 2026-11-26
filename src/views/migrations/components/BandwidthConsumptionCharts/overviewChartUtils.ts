import { type ChartDataObject, MIGRATIONS_CHART_Y_AXIS_GUTTER } from './constants';
import { type VictoryChartPadding } from './utils';

export const MIGRATIONS_OVERVIEW_CHART_PADDING: VictoryChartPadding = {
  bottom: 16,
  left: MIGRATIONS_CHART_Y_AXIS_GUTTER,
  right: 0,
  top: 16,
};

/** Ends the plot at the last sample so the line fills the chart instead of stopping early. */
export const getOverviewDomainX = (
  series: ChartDataObject[][],
  windowStart: number,
  windowEnd: number,
): [number, number] => {
  const times = series
    .flat()
    .map((point) => point.x.getTime())
    .filter((time) => Number.isFinite(time));

  if (times.length === 0) {
    return [windowStart, windowEnd];
  }

  return [windowStart, Math.max(...times)];
};

const NICE_STEPS = [1, 2, 4, 5, 8, 10];

/** Smallest 1-2-4-5-8-10 step that can contain `value`, so the axis shows a half tick and a top tick. */
const niceTop = (value: number): number => {
  const target = Math.max(value, 2);
  const magnitude = 10 ** Math.floor(Math.log10(target));
  const step = NICE_STEPS.find((candidate) => candidate * magnitude >= target) ?? 10;

  return step * magnitude;
};

/** Domain starts at 0 (unlabeled). Tick labels are only the midline and the top line. */
export const getOverviewAxis = (
  maxValue: number,
  unit: number,
): { domainY: [number, number]; tickValues: number[] } => {
  const top = niceTop(maxValue / unit);

  return {
    domainY: [0, top * unit],
    tickValues: [(top / 2) * unit, top * unit],
  };
};

export const formatOverviewTick = (value: number, unit: number): string => {
  const scaled = value / unit;
  return Number.isInteger(scaled) ? String(scaled) : scaled.toFixed(1);
};
