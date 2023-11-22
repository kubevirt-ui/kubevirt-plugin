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

const MetricChart: React.FC<MetricChartProps> = ({ metric, metricChartData }) => {
  const { chartData, domain, unit } = metricChartData;
  const { height, ref, width } = useResponsiveCharts();
  const displayUnit = getLabelUnit(metric, unit);
  const [xAxisTicks, xAxisTickFormat] = useXAxisTicks(chartData);
  const [yAxisTickValues, yAxisTickFormat] = useYAxisTicks(metricChartData);

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
