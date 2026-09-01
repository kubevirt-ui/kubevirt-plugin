import React, { type FC } from 'react';
import { Link } from 'react-router';

import { type V1VirtualMachineInstance } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { tickLabels } from '@kubevirt-utils/components/Charts/ChartLabels/styleOverrides';
import useVMQuery from '@kubevirt-utils/hooks/useVMQuery';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import {
  Chart,
  ChartAxis,
  ChartGroup,
  ChartLine,
  ChartVoronoiContainer,
} from '@patternfly/react-charts/victory';
import { chart_color_orange_300 } from '@patternfly/react-tokens';
import chart_color_black_200 from '@patternfly/react-tokens/dist/esm/chart_color_black_200';
import chart_color_blue_300 from '@patternfly/react-tokens/dist/esm/chart_color_blue_300';
import useDuration from '@virtualmachines/details/tabs/metrics/hooks/useDuration';

import ComponentReady from '../ComponentReady/ComponentReady';
import useResponsiveCharts from '../hooks/useResponsiveCharts';
import { VMQueries } from '../utils/queries';
import {
  addTimestampToTooltip,
  AVG_LABEL,
  formatStorageReadLatencyAvgMaxTooltipData,
  MAX_LABEL,
  tickFormat,
  TICKS_COUNT,
} from '../utils/utils';
import useStorageLatencyAvgMaxData from './useStorageLatencyAvgMaxData';

type StorageReadLatencyAvgMaxChartProps = {
  vmi: V1VirtualMachineInstance;
};

const StorageReadLatencyAvgMaxChart: FC<StorageReadLatencyAvgMaxChartProps> = ({ vmi }) => {
  const { currentTime, duration, timespan } = useDuration();
  const { query: queryAvg, queryLink } = useVMQuery(vmi, VMQueries.STORAGE_READ_LATENCY_AVG);
  const { query: queryMax } = useVMQuery(vmi, VMQueries.STORAGE_READ_LATENCY_MAX);
  const { height, ref, width } = useResponsiveCharts();
  const { avgChartData, error, isLoading, legendData, maxChartData, yRange } =
    useStorageLatencyAvgMaxData({
      currentTime,
      duration,
      queryAvg,
      queryMax,
      timespan,
      vmi,
    });

  return (
    <ComponentReady
      error={error}
      isLoading={isLoading}
      isReady={!isEmpty(avgChartData) || !isEmpty(maxChartData)}
      linkToMetrics={queryLink}
    >
      <div className="util-threshold-chart" ref={ref}>
        <Link to={queryLink}>
          <Chart
            containerComponent={
              <ChartVoronoiContainer
                constrainToVisibleArea
                labels={addTimestampToTooltip(formatStorageReadLatencyAvgMaxTooltipData)}
              />
            }
            domain={{
              x: [currentTime - timespan, currentTime],
              ...(yRange && { y: yRange }),
            }}
            height={height}
            legendData={legendData}
            legendPosition="bottom"
            padding={{ bottom: 55, left: 80, right: 35, top: 35 }}
            scale={{ x: 'time', y: 'linear' }}
            width={width}
          >
            <ChartAxis
              dependentAxis
              style={{
                grid: {
                  stroke: chart_color_black_200.value,
                },
              }}
              tickFormat={(tick: number): string =>
                `${tick === 0 ? tick : (tick * 1000)?.toFixed(2)} ms`
              }
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
              {avgChartData && (
                <ChartLine
                  data={avgChartData}
                  name={AVG_LABEL}
                  style={{
                    data: {
                      stroke: chart_color_blue_300.value,
                      strokeWidth: 2,
                    },
                  }}
                />
              )}
              {maxChartData && (
                <ChartLine
                  data={maxChartData}
                  name={MAX_LABEL}
                  style={{
                    data: {
                      stroke: chart_color_orange_300.value,
                      strokeWidth: 2,
                    },
                  }}
                />
              )}
            </ChartGroup>
          </Chart>
        </Link>
      </div>
    </ComponentReady>
  );
};

export default StorageReadLatencyAvgMaxChart;
