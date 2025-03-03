import React, { FC } from 'react';
import { Link } from 'react-router-dom-v5-compat';
import xbytes from 'xbytes';

import { isEmpty } from '@kubevirt-utils/utils/utils';
import { PrometheusResult } from '@openshift-console/dynamic-plugin-sdk';
import {
  Chart,
  ChartAxis,
  ChartGroup,
  ChartLegendTooltip,
  ChartLine,
  ChartThemeColor,
  createContainer,
} from '@patternfly/react-charts/victory';
import chart_color_black_200 from '@patternfly/react-tokens/dist/esm/chart_color_black_200';
import useDuration from '@virtualmachines/details/tabs/metrics/hooks/useDuration';

import { tickLabels } from '../ChartLabels/styleOverrides';
import ComponentReady from '../ComponentReady/ComponentReady';
import useResponsiveCharts from '../hooks/useResponsiveCharts';
import {
  findNetworkMaxYValue,
  formatNetworkYTick,
  MILLISECONDS_MULTIPLIER,
  tickFormat,
  TICKS_COUNT,
} from '../utils/utils';

type NetworkThresholdSingleSourceChartProps = {
  data: PrometheusResult[];
  link: string;
};

const NetworkThresholdSingleSourceChart: FC<NetworkThresholdSingleSourceChartProps> = ({
  data,
  link,
}) => {
  const { currentTime, duration, timespan } = useDuration();
  const { height, ref, width } = useResponsiveCharts();

  const chartData =
    !isEmpty(data) &&
    data?.map((obj) => {
      return (obj?.values || [])?.map(([x, y]) => {
        return {
          name: obj?.metric?.interface,
          x: new Date(x * MILLISECONDS_MULTIPLIER),
          y: Number(y),
        };
      });
    });
  const isReady = !isEmpty(chartData);
  const Ymax = findNetworkMaxYValue(chartData);

  const CursorVoronoiContainer = createContainer('voronoi', 'cursor');
  const legendData =
    !isEmpty(chartData) &&
    chartData?.map((newChartdata, index) => {
      return { childName: newChartdata?.[index]?.name, name: newChartdata?.[index]?.name };
    });

  return (
    <ComponentReady isReady={isReady} linkToMetrics={link}>
      <div className="util-threshold-chart" ref={ref}>
        <Link to={link}>
          <Chart
            containerComponent={
              <CursorVoronoiContainer
                labelComponent={
                  <ChartLegendTooltip
                    title={(datum: any) =>
                      datum?.x?.getHours() + ':' + String(datum?.x?.getMinutes())?.padStart(2, '0')
                    }
                    legendData={legendData}
                  />
                }
                labels={({ datum }) => {
                  return `${xbytes(datum?.y, {
                    fixed: 2,
                    iec: true,
                  })}ps`;
                }}
                cursorDimension="x"
                mouseFollowTooltips
                voronoiDimension="x"
              />
            }
            domain={{
              x: [currentTime - timespan, currentTime],
              y: [0, Ymax + 1],
            }}
            height={height}
            padding={{ bottom: 60, left: 70, right: 60, top: 30 }}
            scale={{ x: 'time', y: 'linear' }}
            themeColor={ChartThemeColor.multiUnordered}
            width={width}
          >
            <ChartAxis
              style={{
                grid: {
                  stroke: chart_color_black_200.value,
                },
                tickLabels,
              }}
              dependentAxis
              tickFormat={formatNetworkYTick}
              tickValues={[0, Ymax]}
            />
            <ChartAxis
              style={{
                tickLabels: { padding: 2, ...tickLabels },
                ticks: { stroke: 'transparent' },
              }}
              axisComponent={<></>}
              tickCount={TICKS_COUNT}
              tickFormat={tickFormat(duration, currentTime)}
            />
            <ChartGroup>
              {isReady &&
                chartData?.map((newChartdata) => (
                  <ChartLine
                    data={newChartdata}
                    key={newChartdata?.[0]?.name}
                    name={newChartdata?.[0]?.name}
                    themeColor={ChartThemeColor.multiUnordered}
                  />
                ))}
            </ChartGroup>
          </Chart>
        </Link>
      </div>
    </ComponentReady>
  );
};
export default NetworkThresholdSingleSourceChart;
