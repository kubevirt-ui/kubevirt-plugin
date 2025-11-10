import React from 'react';

import { tickLabels } from '@kubevirt-utils/components/Charts/ChartLabels/styleOverrides';
import useResponsiveCharts from '@kubevirt-utils/components/Charts/hooks/useResponsiveCharts';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import {
  Chart,
  ChartArea,
  ChartAxis,
  ChartDonut,
  ChartGroup,
  ChartVoronoiContainer,
} from '@patternfly/react-charts/victory';
import chart_color_black_200 from '@patternfly/react-tokens/dist/esm/chart_color_black_200';
import chart_color_blue_100 from '@patternfly/react-tokens/dist/esm/chart_color_blue_100';

import { METRICS } from '../utils/constants';
import useXAxisTicks from '../utils/hooks/useXAxisTicks';
import useYAxisTicks from '../utils/hooks/useYAxisTicks';
import { MetricChartProps } from '../utils/types';
import {
  formatOvercommitLabel,
  formatPopoverLabel,
  getCurrentValue,
  getLabelUnit,
  getOvercommitThemeColor,
} from '../utils/utils';

import './MetricChart.scss';

const MetricChart: React.FC<MetricChartProps> = ({ metric, metricChartData, targetValue }) => {
  const { t } = useKubevirtTranslation();
  const { chartData, domain, unit } = metricChartData;
  const { height, ref, width } = useResponsiveCharts();

  const displayUnit = getLabelUnit(metric, unit);
  const [xAxisTicks, xAxisTickFormat] = useXAxisTicks(chartData);
  const [yAxisTickValues, yAxisTickFormat] = useYAxisTicks(metricChartData);

  // If it's overcommit ratio, render donut chart
  if (metric === METRICS.OVERCOMMIT_RATIO) {
    const currentValue = getCurrentValue(chartData);
    const currentRatio = Math.round(currentValue || 0);
    const chartDisplayData = [
      { x: 'Current', y: currentRatio },
      { x: 'Remaining', y: Math.max(0, targetValue - currentRatio) },
    ];

    return (
      <div className="overview-metric-chart" ref={ref}>
        <ChartDonut
          constrainToVisibleArea
          data={chartDisplayData}
          height={height}
          labels={formatOvercommitLabel}
          padding={{ bottom: 20, left: 20, right: 20, top: 20 }}
          subTitle={t('of {{target}}%', { target: targetValue })}
          themeColor={getOvercommitThemeColor(currentRatio, targetValue)}
          title={`${currentRatio}%`}
          width={width}
        />
      </div>
    );
  }

  // Otherwise, render line chart for other metrics
  return (
    <div className="overview-metric-chart" ref={ref}>
      <Chart
        containerComponent={
          <ChartVoronoiContainer constrainToVisibleArea labels={formatPopoverLabel(displayUnit)} />
        }
        domain={domain}
        height={height}
        padding={{ bottom: 35, left: 100, right: 10, top: 35 }}
        scale={{ x: 'time', y: 'linear' }}
        width={width}
      >
        <ChartAxis
          style={{
            grid: {
              stroke: chart_color_black_200.value,
            },
            tickLabels,
          }}
          axisComponent={<></>}
          dependentAxis
          tickFormat={yAxisTickFormat(metric, unit)}
          tickValues={yAxisTickValues}
        />
        <ChartAxis
          style={{
            axis: {
              stroke: chart_color_black_200.value,
            },
            tickLabels,
          }}
          fixLabelOverlap
          tickFormat={xAxisTickFormat}
          tickValues={xAxisTicks}
        />
        <ChartGroup>
          <ChartArea
            style={{
              data: {
                stroke: chart_color_blue_100.value,
              },
            }}
            data={chartData}
          />
        </ChartGroup>
      </Chart>
    </div>
  );
};

export default MetricChart;
