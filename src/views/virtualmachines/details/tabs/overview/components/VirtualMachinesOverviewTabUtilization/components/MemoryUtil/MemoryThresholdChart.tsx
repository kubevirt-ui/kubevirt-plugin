import React from 'react';
import { Link } from 'react-router-dom';
import xbytes from 'xbytes';

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

import { queriesToLink } from '../../utils/utils';

type MemoryThresholdChartProps = {
  threshold: number;
  data: PrometheusValue[];
  query: string;
};

const MemoryThresholdChart: React.FC<MemoryThresholdChartProps> = ({ threshold, data, query }) => {
  const chartData = data?.map(([, item], index) => {
    return { x: index, y: +item, name: 'Memory used' };
  });

  const thresholdLine = new Array(chartData?.length || 0)
    .fill(0)
    .map((_, index) => ({ x: index, y: threshold, name: 'Memory available' }));

  return (
    <Link to={queriesToLink(query)}>
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
            data={chartData}
            style={{
              data: {
                stroke: chart_color_blue_300.value,
              },
            }}
          />
        </ChartGroup>
        <ChartThreshold
          data={thresholdLine}
          style={{
            data: {
              stroke: chart_color_orange_300.value,
              strokeDasharray: 10,
              strokeWidth: 7,
            },
          }}
        />
      </Chart>
    </Link>
  );
};

export default MemoryThresholdChart;
