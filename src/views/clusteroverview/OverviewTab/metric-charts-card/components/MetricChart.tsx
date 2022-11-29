import React from 'react';

import useResponsiveCharts from '@kubevirt-utils/components/Charts/hooks/useResponsiveCharts';
import {
  Chart,
  ChartArea,
  ChartAxis,
  ChartGroup,
  ChartVoronoiContainer,
} from '@patternfly/react-charts';
import chart_color_black_200 from '@patternfly/react-tokens/dist/esm/chart_color_black_200';
import chart_color_blue_100 from '@patternfly/react-tokens/dist/esm/chart_color_blue_100';

import useXAxisTicks from '../utils/hooks/useXAxisTicks';
import useYAxisTicks from '../utils/hooks/useYAxisTicks';
import { MetricChartProps } from '../utils/types';
import { formatPopoverLabel, getLabelUnit } from '../utils/utils';

import './MetricChart.scss';

const MetricChart: React.FC<MetricChartProps> = ({ metricChartData, metric }) => {
  const { chartData, domain, unit } = metricChartData;
  const { ref, width, height } = useResponsiveCharts();
  const displayUnit = getLabelUnit(metric, unit);
  const [xAxisTicks, xAxisTickFormat] = useXAxisTicks(chartData);
  const [yAxisTickValues, yAxisTickFormat] = useYAxisTicks(metricChartData);

  return (
    <div className="overview-metric-chart" ref={ref}>
      <Chart
        height={height}
        width={width}
        padding={{ top: 35, bottom: 35, left: 100, right: 10 }}
        scale={{ x: 'time', y: 'linear' }}
        domain={domain}
        containerComponent={
          <ChartVoronoiContainer labels={formatPopoverLabel(displayUnit)} constrainToVisibleArea />
        }
      >
        <ChartAxis
          dependentAxis
          tickValues={yAxisTickValues}
          tickFormat={yAxisTickFormat(metric, unit)}
          style={{
            grid: {
              stroke: chart_color_black_200.value,
            },
          }}
          axisComponent={<></>}
        />
        <ChartAxis
          tickValues={xAxisTicks}
          tickFormat={xAxisTickFormat}
          fixLabelOverlap
          style={{
            axis: {
              stroke: chart_color_black_200.value,
            },
          }}
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
