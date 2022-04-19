import React from 'react';

import { PrometheusValue } from '@openshift-console/dynamic-plugin-sdk';
import {
  Chart,
  ChartArea,
  ChartGroup,
  ChartThreshold,
  ChartTooltip,
  ChartVoronoiContainer,
} from '@patternfly/react-charts';
import chart_color_blue_300 from '@patternfly/react-tokens/dist/esm/chart_color_blue_300';
import chart_color_orange_300 from '@patternfly/react-tokens/dist/esm/chart_color_orange_300';
import chart_global_FontSize_2xl from '@patternfly/react-tokens/dist/esm/chart_global_FontSize_2xl';

type CPUThresholdChartProps = {
  cpuUsage: PrometheusValue[];
  cpuRequested: PrometheusValue[];
};

const CPUThresholdChart: React.FC<CPUThresholdChartProps> = ({ cpuRequested, cpuUsage }) => {
  const chartData = cpuUsage?.map(([, item], index) => {
    return { x: index, y: +item, name: 'CPU usage' };
  });

  const thresholdData = cpuRequested?.map(([, item], index) => {
    return { x: index, y: +item, name: 'CPU requested' };
  });

  return (
    <div>
      <Chart
        height={200}
        showAxis={false}
        containerComponent={
          <ChartVoronoiContainer
            labels={({ datum }) => {
              return `${datum?.name}: ${datum?.y?.toFixed(2)}'s`;
            }}
            labelComponent={<ChartTooltip style={{ fontSize: chart_global_FontSize_2xl.value }} />}
            constrainToVisibleArea
          />
        }
      >
        <ChartGroup>
          <ChartArea
            data={chartData}
            style={{
              data: {
                stroke: chart_color_blue_300.value,
              },
            }}
          />
        </ChartGroup>
        <ChartThreshold
          data={thresholdData}
          style={{
            data: {
              stroke: chart_color_orange_300.value,
              strokeDasharray: 10,
              strokeWidth: 7,
            },
          }}
        />
      </Chart>
    </div>
  );
};

export default CPUThresholdChart;
