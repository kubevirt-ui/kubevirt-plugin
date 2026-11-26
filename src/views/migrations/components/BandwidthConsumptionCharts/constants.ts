export type ChartDataObject = {
  idx: number;
  name: string;
  x: Date;
  y: number;
};

export const GRID_LINES = 3;

/** Plot height for each overview sparkline, matching the resources mock. */
export const MIGRATIONS_OVERVIEW_CHART_HEIGHT = 88;

/** Room for a 5-digit Y label (for example 10000) inside the chart. */
export const MIGRATIONS_CHART_Y_AXIS_GUTTER = 72;
