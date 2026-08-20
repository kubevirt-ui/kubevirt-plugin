import React, { type FC } from 'react';
import { abbreviateNumber } from 'js-abbreviation-number';

import { tickLabels } from '@kubevirt-utils/components/Charts/ChartLabels/styleOverrides';
import { type ChartDomain } from '@overview/OverviewTab/metric-charts-card/utils/hooks/types';
import { type MetricChartData } from '@overview/OverviewTab/metric-charts-card/utils/hooks/useMetricChartData';
import { xTickFormat } from '@overview/OverviewTab/metric-charts-card/utils/hooks/utils';
import {
  Chart,
  ChartAxis,
  ChartGroup,
  ChartLine,
  ChartVoronoiContainer,
} from '@patternfly/react-charts/victory';
import chart_color_black_200 from '@patternfly/react-tokens/dist/esm/chart_color_black_200';
import chart_color_blue_300 from '@patternfly/react-tokens/dist/esm/chart_color_blue_300';

import { CHART_FONT_SIZE, CHART_LINE_STROKE_WIDTH } from '../../../shared/chartConstants';
import { type ClusterChartSeries } from '../../hooks/useTopClustersChartData';
import { RESOURCE_CHART_PADDING } from '../../utils/constants';
import DashedChartLines from './DashedChartLines';
import SwatchTooltip from './SwatchTooltip';

type ChartLinePoint = { _color: string; _dashed: boolean; x: Date; y: number };
type TooltipLabelFn = (args: { datum: Record<string, unknown> }) => string;

type ResourceAllocationChartContentProps = {
  baseTooltipLabel: TooltipLabelFn;
  chartSeries?: ClusterChartSeries[];
  effectiveData: MetricChartData;
  effectiveDomain: ChartDomain;
  hasQuotaLines: boolean;
  height: number;
  isMultiCluster: boolean;
  quotaLineData: ChartLinePoint[] | null;
  quotaTooltipLabel: TooltipLabelFn;
  requestedLineData: ChartLinePoint[] | null;
  width: number;
  xAxisTicks: Date[];
  yAxisTickValues: number[];
};

const minimalYAxisTickFormat = (tick: number, index: number, allTicks: number[]): null | string => {
  if (index === allTicks?.length - 1) return null;
  if (tick === 0) return `${abbreviateNumber(tick, 1)}`;
  return null;
};

const ResourceAllocationChartContent: FC<ResourceAllocationChartContentProps> = ({
  baseTooltipLabel,
  chartSeries,
  effectiveData,
  effectiveDomain,
  hasQuotaLines,
  height,
  isMultiCluster,
  quotaLineData,
  quotaTooltipLabel,
  requestedLineData,
  width,
  xAxisTicks,
  yAxisTickValues,
}) => {
  const topTickValue = yAxisTickValues[yAxisTickValues.length - 1] ?? 0;
  const topTickLabel = abbreviateNumber(topTickValue, 1);

  return (
    <>
      <span aria-hidden="true" className="resource-allocation-widget__chart-top-label">
        {topTickLabel}
      </span>
      <Chart
        containerComponent={
          <ChartVoronoiContainer
            constrainToVisibleArea
            labelComponent={<SwatchTooltip />}
            labels={hasQuotaLines ? quotaTooltipLabel : baseTooltipLabel}
          />
        }
        domain={effectiveDomain}
        height={height}
        padding={RESOURCE_CHART_PADDING}
        scale={{ x: 'time', y: 'linear' }}
        width={width}
      >
        <ChartAxis
          dependentAxis
          style={{
            grid: { stroke: chart_color_black_200.value },
            tickLabels: { fontSize: CHART_FONT_SIZE, ...tickLabels },
          }}
          tickFormat={minimalYAxisTickFormat}
          tickValues={yAxisTickValues}
        />
        <ChartAxis
          style={{
            axis: { stroke: chart_color_black_200.value },
            tickLabels: { fontSize: CHART_FONT_SIZE, ...tickLabels },
          }}
          tickFormat={xTickFormat}
          tickValues={xAxisTicks}
        />
        <ChartGroup>
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
                  style={{ data: { stroke: series.color, strokeWidth: CHART_LINE_STROKE_WIDTH } }}
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
          <DashedChartLines quotaLineData={quotaLineData} requestedLineData={requestedLineData} />
        </ChartGroup>
      </Chart>
    </>
  );
};

export default ResourceAllocationChartContent;
