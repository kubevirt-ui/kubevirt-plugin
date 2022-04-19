import React from 'react';
import xbytes from 'xbytes';

import { PrometheusValue } from '@openshift-console/dynamic-plugin-sdk';
import {
  Chart,
  ChartArea,
  ChartGroup,
  ChartTooltip,
  ChartVoronoiContainer,
} from '@patternfly/react-charts';
import chart_color_blue_300 from '@patternfly/react-tokens/dist/esm/chart_color_blue_300';
import chart_color_blue_400 from '@patternfly/react-tokens/dist/esm/chart_color_blue_300';
import chart_global_FontSize_2xl from '@patternfly/react-tokens/dist/esm/chart_global_FontSize_2xl';

type NetworkThresholdChartProps = {
  networkIn: PrometheusValue[];
  networkOut: PrometheusValue[];
};

const NetworkThresholdChart: React.FC<NetworkThresholdChartProps> = ({ networkIn, networkOut }) => {
  const chartDataIn = networkIn?.map(([, item], index) => {
    return { x: index, y: +item, name: 'Network In' };
  });

  const chartDataOut = networkOut?.map(([, item], index) => {
    return { x: index, y: +item, name: 'Network Out' };
  });

  return (
    <div>
      <Chart
        height={200}
        showAxis={false}
        containerComponent={
          <ChartVoronoiContainer
            labels={({ datum }) => {
              return `${datum?.name}: ${xbytes(datum?.y, { iec: true, fixed: 2 })}`;
            }}
            labelComponent={<ChartTooltip style={{ fontSize: chart_global_FontSize_2xl.value }} />}
            constrainToVisibleArea
          />
        }
      >
        <ChartGroup>
          <ChartArea
            data={chartDataOut}
            style={{
              data: {
                stroke: chart_color_blue_300.value,
              },
            }}
          />
          <ChartArea
            data={chartDataIn}
            style={{
              data: {
                stroke: chart_color_blue_400.value,
              },
            }}
          />
        </ChartGroup>
      </Chart>
    </div>
  );
};

export default NetworkThresholdChart;
