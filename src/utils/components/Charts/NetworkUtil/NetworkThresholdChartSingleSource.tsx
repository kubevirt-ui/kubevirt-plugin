import React, { type FC } from 'react';
import { Link } from 'react-router';

import { isEmpty } from '@kubevirt-utils/utils/utils';
import { type PrometheusResult } from '@openshift-console/dynamic-plugin-sdk';
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
import useStableYMax from '../hooks/useStableYMax';
import {
  addTimestampToTooltip,
  findNetworkMaxYValue,
  formatNetworkThresholdSingleSourceTooltipData,
  formatNetworkYTick,
  getChartYRange,
  MILLISECONDS_MULTIPLIER,
  tickFormat,
  TICKS_COUNT,
} from '../utils/utils';

type NetworkChartDataPoint = {
  name: string;
  x: Date;
  y: number;
};

type NetworkThresholdSingleSourceChartProps = {
  data: PrometheusResult[];
  link: string;
};

const CursorVoronoiContainer = createContainer('voronoi', 'cursor');

const formatTooltipTitle = (datum: Record<string, unknown>): string => {
  const date = datum?.x as Date | undefined;
  return (date?.getHours() ?? '') + ':' + String(date?.getMinutes() ?? '')?.padStart(2, '0');
};

const NetworkThresholdSingleSourceChart: FC<NetworkThresholdSingleSourceChartProps> = ({
  data,
  link,
}) => {
  const { currentTime, duration, timespan } = useDuration();
  const { height, ref, width } = useResponsiveCharts();

  const chartData: NetworkChartDataPoint[][] = !isEmpty(data)
    ? (data?.map((obj) =>
        (obj?.values ?? [])?.map(
          ([timestamp, val]: [number, string]): NetworkChartDataPoint => ({
            name: obj?.metric?.interface,
            x: new Date(timestamp * MILLISECONDS_MULTIPLIER),
            y: Number(val),
          }),
        ),
      ) ?? [])
    : [];

  const isReady = !isEmpty(chartData);
  const yMaxValue = useStableYMax(findNetworkMaxYValue(chartData), duration);
  const yRange = getChartYRange(yMaxValue);

  const legendData: { childName: string; name: string }[] = !isEmpty(chartData)
    ? (chartData?.map((series) => ({
        childName: series?.[0]?.name,
        name: series?.[0]?.name,
      })) ?? [])
    : [];

  return (
    <ComponentReady isReady={isReady} linkToMetrics={link}>
      <div className="util-threshold-chart" ref={ref}>
        <Link to={link}>
          <Chart
            containerComponent={
              <CursorVoronoiContainer
                cursorDimension="x"
                labelComponent={
                  <ChartLegendTooltip legendData={legendData} title={formatTooltipTitle} />
                }
                labels={addTimestampToTooltip(formatNetworkThresholdSingleSourceTooltipData)}
                mouseFollowTooltips
                voronoiDimension="x"
              />
            }
            domain={{
              x: [currentTime - timespan, currentTime],
              ...(yRange && { y: yRange }),
            }}
            height={height}
            padding={{ bottom: 60, left: 70, right: 60, top: 30 }}
            scale={{ x: 'time', y: 'linear' }}
            themeColor={ChartThemeColor.multiUnordered}
            width={width}
          >
            <ChartAxis
              dependentAxis
              style={{
                grid: {
                  stroke: chart_color_black_200.value,
                },
                tickLabels,
              }}
              tickFormat={formatNetworkYTick}
              {...(yRange && { tickValues: yRange })}
            />
            <ChartAxis
              axisComponent={<></>}
              style={{
                tickLabels: { padding: 2, ...tickLabels },
                ticks: { stroke: 'transparent' },
              }}
              tickCount={TICKS_COUNT}
              tickFormat={tickFormat(duration, currentTime)}
            />
            <ChartGroup>
              {isReady &&
                chartData?.map((series) => (
                  <ChartLine
                    data={series}
                    key={series?.[0]?.name}
                    name={series?.[0]?.name}
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
