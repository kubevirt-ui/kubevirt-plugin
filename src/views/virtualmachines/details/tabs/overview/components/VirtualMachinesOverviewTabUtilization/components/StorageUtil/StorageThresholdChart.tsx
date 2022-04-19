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
import chart_global_FontSize_2xl from '@patternfly/react-tokens/dist/esm/chart_global_FontSize_2xl';
// import chart_color_orange_300 from '@patternfly/react-tokens/dist/esm/chart_color_orange_300';

type StorageThresholdChartProps = {
  threshold?: number;
  data: PrometheusValue[];
};

const GIB_IN_BYTES = 1024;

const StorageThresholdChart: React.FC<StorageThresholdChartProps> = ({ data }) => {
  const chartData = data?.map(([, item], index) => {
    return { x: index, y: Number(+item / GIB_IN_BYTES) };
  });

  //! should be fixed once promethesus request adjust
  // const thresholdLine = new Array(chartData?.length || 0)
  //   .fill(0)
  //   .map((_, index) => ({ x: index, y: threshold / GIB_IN_BYTES }));

  return (
    <div>
      <Chart
        height={200}
        showAxis={false}
        containerComponent={
          <ChartVoronoiContainer
            labels={({ datum }) => {
              return `Data written: ${xbytes(datum?.y, { iec: true, fixed: 2 })}`;
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
        {/* ! should be fixed once promethesus request adjust */}
        {/* <ChartThreshold
          data={thresholdLine}
          style={{
            data: {
              stroke: chart_color_orange_300.value,
              strokeDasharray: 10,
              strokeWidth: 3,
            },
          }}
        /> */}
      </Chart>
    </div>
  );
};

export default StorageThresholdChart;
