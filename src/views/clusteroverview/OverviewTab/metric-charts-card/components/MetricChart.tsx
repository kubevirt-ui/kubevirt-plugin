import React, { type FC } from 'react';

import { tickLabels } from '@kubevirt-utils/components/Charts/ChartLabels/styleOverrides';
import useResponsiveCharts from '@kubevirt-utils/components/Charts/hooks/useResponsiveCharts';
import {
  Chart,
  ChartArea,
  ChartAxis,
  ChartGroup,
  ChartVoronoiContainer,
} from '@patternfly/react-charts/victory';
import chart_color_black_200 from '@patternfly/react-tokens/dist/esm/chart_color_black_200';
import chart_color_blue_100 from '@patternfly/react-tokens/dist/esm/chart_color_blue_100';

import getXAxisTicks from '../utils/hooks/getXAxisTicks';
import getYAxisTicks from '../utils/hooks/getYAxisTicks';
import { type MetricChartProps } from '../utils/types';
import { formatPopoverLabel, getLabelUnit } from '../utils/utils';

import './MetricChart.scss';

const MetricChart: FC<MetricChartProps> = ({ metric, metricChartData }) => {
  const { chartData, domain, unit } = metricChartData;
  const { height, ref, width } = useResponsiveCharts();
  const displayUnit = getLabelUnit(metric, unit) as string;
  const [xAxisTicks, xAxisTickFormat] = getXAxisTicks(chartData);
  const [yAxisTickValues, yAxisTickFormat] = getYAxisTicks(metricChartData);

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
          axisComponent={<></>}
          dependentAxis
          style={{
            grid: {
              stroke: chart_color_black_200.value,
            },
            tickLabels,
          }}
          tickFormat={yAxisTickFormat(metric, unit)}
          tickValues={yAxisTickValues}
        />
        <ChartAxis
          fixLabelOverlap
          style={{
            axis: {
              stroke: chart_color_black_200.value,
            },
            tickLabels,
          }}
          tickFormat={xAxisTickFormat}
          tickValues={xAxisTicks}
        />
        <ChartGroup>
          <ChartArea
            data={chartData}
            style={{
              data: {
                stroke: chart_color_blue_100.value,
              },
            }}
          />
        </ChartGroup>
      </Chart>
    </div>
  );
};

export default MetricChart;
