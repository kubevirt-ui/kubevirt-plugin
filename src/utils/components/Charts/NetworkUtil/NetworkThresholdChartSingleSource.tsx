import React, { FC } from 'react';
import { Link } from 'react-router-dom';
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
} from '@patternfly/react-charts';
import chart_color_black_200 from '@patternfly/react-tokens/dist/esm/chart_color_black_200';
import useDuration from '@virtualmachines/details/tabs/metrics/hooks/useDuration';

import ComponentReady from '../ComponentReady/ComponentReady';
import useResponsiveCharts from '../hooks/useResponsiveCharts';
import {
  findNetworkMaxYValue,
  formatNetworkYTick,
  getNetworkTickValues,
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
  const { ref, width, height } = useResponsiveCharts();

  const chartData =
    !isEmpty(data) &&
    data?.map((obj) => {
      return (obj?.values || [])?.map(([x, y]) => {
        return {
          x: new Date(x * MILLISECONDS_MULTIPLIER),
          y: Number(y),
          name: obj?.metric?.interface,
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
    <ComponentReady isReady={isReady}>
      <div className="util-threshold-chart" ref={ref}>
        <Link to={link}>
          <Chart
            height={height}
            width={width}
            padding={{ top: 30, bottom: 60, left: 70, right: 60 }}
            scale={{ x: 'time', y: 'linear' }}
            themeColor={ChartThemeColor.multiUnordered}
            domain={{
              x: [currentTime - timespan, currentTime],
              y: [0, getNetworkTickValues(Ymax + 1)?.length],
            }}
            containerComponent={
              <CursorVoronoiContainer
                cursorDimension="x"
                labels={({ datum }) => {
                  return `${xbytes(datum?.y, {
                    iec: true,
                    fixed: 2,
                  })}ps`;
                }}
                labelComponent={
                  <ChartLegendTooltip
                    legendData={legendData}
                    title={(datum) =>
                      datum?.x?.getHours() + ':' + String(datum?.x?.getMinutes())?.padStart(2, '0')
                    }
                  />
                }
                mouseFollowTooltips
                voronoiDimension="x"
              />
            }
          >
            <ChartAxis
              dependentAxis
              tickFormat={formatNetworkYTick}
              tickValues={getNetworkTickValues(Ymax)}
              style={{
                grid: {
                  stroke: chart_color_black_200.value,
                },
              }}
            />
            <ChartAxis
              tickFormat={tickFormat(duration, currentTime)}
              tickCount={TICKS_COUNT}
              style={{
                ticks: { stroke: 'transparent' },
                tickLabels: { padding: 2 },
              }}
              axisComponent={<></>}
            />
            <ChartGroup>
              {isReady &&
                chartData?.map((newChartdata) => (
                  <ChartLine
                    key={newChartdata?.[0]?.name}
                    name={newChartdata?.[0]?.name}
                    data={newChartdata}
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
