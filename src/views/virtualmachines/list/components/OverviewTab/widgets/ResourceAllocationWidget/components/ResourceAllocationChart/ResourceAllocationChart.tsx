import React, { FC } from 'react';
import { abbreviateNumber } from 'js-abbreviation-number';

import { tickLabels } from '@kubevirt-utils/components/Charts/ChartLabels/styleOverrides';
import useResponsiveCharts from '@kubevirt-utils/components/Charts/hooks/useResponsiveCharts';
import ErrorAlert from '@kubevirt-utils/components/ErrorAlert/ErrorAlert';
import MutedTextSpan from '@kubevirt-utils/components/MutedTextSpan/MutedTextSpan';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getNoDataAvailableMessage } from '@kubevirt-utils/utils/utils';
import { MetricChartData } from '@overview/OverviewTab/metric-charts-card/utils/hooks/useMetricChartData';
import useYAxisTicks from '@overview/OverviewTab/metric-charts-card/utils/hooks/useYAxisTicks';
import { xTickFormat } from '@overview/OverviewTab/metric-charts-card/utils/hooks/utils';
import { getLabelUnit } from '@overview/OverviewTab/metric-charts-card/utils/utils';
import {
  Chart,
  ChartAxis,
  ChartGroup,
  ChartLine,
  ChartVoronoiContainer,
} from '@patternfly/react-charts/victory';
import { Bullseye, Skeleton } from '@patternfly/react-core';
import chart_color_black_200 from '@patternfly/react-tokens/dist/esm/chart_color_black_200';
import chart_color_blue_300 from '@patternfly/react-tokens/dist/esm/chart_color_blue_300';
import t_chart_theme_colorscales_gray_colorscale_100 from '@patternfly/react-tokens/dist/esm/t_chart_theme_colorscales_gray_colorscale_100';
import t_chart_theme_colorscales_orange_colorscale_400 from '@patternfly/react-tokens/dist/esm/t_chart_theme_colorscales_orange_colorscale_400';

import {
  CHART_FONT_SIZE,
  CHART_LINE_STROKE_WIDTH,
  DASHED_LINE_PATTERN,
  DASHED_LINE_STROKE_WIDTH,
} from '../../../shared/chartConstants';
import { ClusterChartSeries } from '../../hooks/useTopClustersChartData';
import {
  CHART_NAME_QUOTA,
  CHART_NAME_REQUESTED,
  RESOURCE_CHART_PADDING,
} from '../../utils/constants';

import SwatchTooltip from './SwatchTooltip';
import useChartDomain from './useChartDomain';
import { useChartTooltips } from './useChartTooltips';

type ResourceAllocationChartProps = {
  chartSeries?: ClusterChartSeries[];
  effectiveData: MetricChartData;
  isMultiCluster: boolean;
  metric: string;
  /** Flat horizontal quota limit line (gray dashed). Only rendered in single-cluster mode. */
  quotaValue?: number;
  /** Flat horizontal requested line (orange dashed). Only rendered in single-cluster mode. */
  requestedValue?: number;
};

const ResourceAllocationChart: FC<ResourceAllocationChartProps> = ({
  chartSeries,
  effectiveData,
  isMultiCluster,
  metric,
  quotaValue,
  requestedValue,
}) => {
  const { t } = useKubevirtTranslation();
  const { error, isReady, loaded, unit } = effectiveData;
  const { height, ref, width } = useResponsiveCharts();
  const displayUnit = getLabelUnit(metric, unit);

  const {
    effectiveDataForTicks,
    effectiveDomain,
    hasQuotaLines,
    quotaLineData,
    requestedLineData,
    xAxisTicks,
  } = useChartDomain({ effectiveData, isMultiCluster, quotaValue, requestedValue });

  const [yAxisTickValues] = useYAxisTicks(effectiveDataForTicks);

  const topTickValue = yAxisTickValues[yAxisTickValues.length - 1] ?? 0;
  const topTickLabel = abbreviateNumber(topTickValue, 1);

  // Only show the "0" baseline label; the top value is rendered separately via chart-top-label
  const minimalYAxisTickFormat = (tick: number, index: number, allTicks: number[]) => {
    if (index === allTicks?.length - 1) return null;
    if (tick === 0) return `${abbreviateNumber(tick, 1)}`;
    return null;
  };

  const { baseTooltipLabel, quotaTooltipLabel } = useChartTooltips({
    displayUnit,
    isMultiCluster,
    t,
  });

  if (loaded && error) {
    return (
      <div className="resource-allocation-widget__chart" ref={ref}>
        <ErrorAlert error={error} />
      </div>
    );
  }

  if (!loaded || width === 0) {
    return (
      <div className="resource-allocation-widget__chart" ref={ref}>
        <Skeleton height="100%" width="100%" />
      </div>
    );
  }

  if (!isReady && !hasQuotaLines) {
    return (
      <div className="resource-allocation-widget__chart" ref={ref}>
        <Bullseye>
          <MutedTextSpan text={getNoDataAvailableMessage(t)} />
        </Bullseye>
      </div>
    );
  }

  return (
    <div className="resource-allocation-widget__chart" ref={ref}>
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
          style={{
            grid: { stroke: chart_color_black_200.value },
            tickLabels: { fontSize: CHART_FONT_SIZE, ...tickLabels },
          }}
          dependentAxis
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
                  data={series.data.map((p) => ({
                    ...p,
                    _clusterName: series.clusterName,
                    _color: series.color,
                  }))}
                  style={{
                    data: { stroke: series.color, strokeWidth: CHART_LINE_STROKE_WIDTH },
                  }}
                  key={series.clusterName}
                  name={series.clusterName}
                />
              ))
            : effectiveData.chartData && (
                <ChartLine
                  data={effectiveData.chartData.map((p) => ({
                    ...p,
                    _color: chart_color_blue_300.value,
                  }))}
                  style={{
                    data: {
                      stroke: chart_color_blue_300.value,
                      strokeWidth: CHART_LINE_STROKE_WIDTH,
                    },
                  }}
                  name="used"
                />
              )}
          {quotaLineData && (
            <ChartLine
              style={{
                data: {
                  stroke: t_chart_theme_colorscales_gray_colorscale_100.value,
                  strokeDasharray: DASHED_LINE_PATTERN,
                  strokeWidth: DASHED_LINE_STROKE_WIDTH,
                },
              }}
              data={quotaLineData}
              name={CHART_NAME_QUOTA}
            />
          )}
          {requestedLineData && (
            <ChartLine
              style={{
                data: {
                  stroke: t_chart_theme_colorscales_orange_colorscale_400.value,
                  strokeDasharray: DASHED_LINE_PATTERN,
                  strokeWidth: DASHED_LINE_STROKE_WIDTH,
                },
              }}
              data={requestedLineData}
              name={CHART_NAME_REQUESTED}
            />
          )}
        </ChartGroup>
      </Chart>
    </div>
  );
};

export default ResourceAllocationChart;
