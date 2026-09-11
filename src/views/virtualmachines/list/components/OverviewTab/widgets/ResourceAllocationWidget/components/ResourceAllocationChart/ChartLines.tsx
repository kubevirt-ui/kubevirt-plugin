import { type FC } from 'react';

import { type MetricChartData } from '@overview/OverviewTab/metric-charts-card/utils/hooks/useMetricChartData';
import { ChartLine } from '@patternfly/react-charts/victory';
import chart_color_blue_300 from '@patternfly/react-tokens/dist/esm/chart_color_blue_300';
import t_chart_theme_colorscales_gray_colorscale_100 from '@patternfly/react-tokens/dist/esm/t_chart_theme_colorscales_gray_colorscale_100';
import t_chart_theme_colorscales_orange_colorscale_400 from '@patternfly/react-tokens/dist/esm/t_chart_theme_colorscales_orange_colorscale_400';

import {
  CHART_LINE_STROKE_WIDTH,
  DASHED_LINE_PATTERN,
  DASHED_LINE_STROKE_WIDTH,
} from '../../../shared/chartConstants';
import { type ClusterChartSeries } from '../../hooks/useTopClustersChartData';
import { CHART_NAME_QUOTA, CHART_NAME_REQUESTED } from '../../utils/constants';

type ChartLinesProps = {
  chartSeries?: ClusterChartSeries[];
  effectiveData: MetricChartData;
  isMultiCluster: boolean;
  quotaLineData?: Array<{ x: Date; y: number }>;
  requestedLineData?: Array<{ x: Date; y: number }>;
};

const ChartLines: FC<ChartLinesProps> = ({
  chartSeries,
  effectiveData,
  isMultiCluster,
  quotaLineData,
  requestedLineData,
}) => (
  <>
    {isMultiCluster && chartSeries
      ? chartSeries.map((series) => (
          <ChartLine
            data={series.data.map((point) => ({
              ...point,
              _clusterName: series.clusterName,
              _color: series.color,
            }))}
            key={series.clusterName}
            name={series.clusterName}
            style={{
              data: { stroke: series.color, strokeWidth: CHART_LINE_STROKE_WIDTH },
            }}
          />
        ))
      : effectiveData.chartData && (
          <ChartLine
            data={effectiveData.chartData.map((point) => ({
              ...point,
              _color: chart_color_blue_300.value,
            }))}
            name="used"
            style={{
              data: {
                stroke: chart_color_blue_300.value,
                strokeWidth: CHART_LINE_STROKE_WIDTH,
              },
            }}
          />
        )}
    {quotaLineData && (
      <ChartLine
        data={quotaLineData}
        name={CHART_NAME_QUOTA}
        style={{
          data: {
            stroke: t_chart_theme_colorscales_gray_colorscale_100.value,
            strokeDasharray: DASHED_LINE_PATTERN,
            strokeWidth: DASHED_LINE_STROKE_WIDTH,
          },
        }}
      />
    )}
    {requestedLineData && (
      <ChartLine
        data={requestedLineData}
        name={CHART_NAME_REQUESTED}
        style={{
          data: {
            stroke: t_chart_theme_colorscales_orange_colorscale_400.value,
            strokeDasharray: DASHED_LINE_PATTERN,
            strokeWidth: DASHED_LINE_STROKE_WIDTH,
          },
        }}
      />
    )}
  </>
);

export default ChartLines;
