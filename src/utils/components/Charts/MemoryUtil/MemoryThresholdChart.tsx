import React from 'react';
import { Link } from 'react-router-dom';
import xbytes from 'xbytes';

import { V1VirtualMachineInstance } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { getMemorySize } from '@kubevirt-utils/components/CPUMemoryModal/utils/CpuMemoryUtils';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { PrometheusEndpoint, usePrometheusPoll } from '@openshift-console/dynamic-plugin-sdk';
import {
  Chart,
  ChartArea,
  ChartAxis,
  ChartGroup,
  ChartThreshold,
  ChartVoronoiContainer,
} from '@patternfly/react-charts';
import chart_color_black_200 from '@patternfly/react-tokens/dist/esm/chart_color_black_200';
import chart_color_blue_300 from '@patternfly/react-tokens/dist/esm/chart_color_blue_300';
import chart_color_orange_300 from '@patternfly/react-tokens/dist/esm/chart_color_orange_300';
import useDuration from '@virtualmachines/details/tabs/metrics/hooks/useDuration';

import ComponentReady from '../ComponentReady/ComponentReady';
import useResponsiveCharts from '../hooks/useResponsiveCharts';
import { getUtilizationQueries } from '../utils/queries';
import {
  formatMemoryYTick,
  MILLISECONDS_MULTIPLIER,
  queriesToLink,
  tickFormat,
  TICKS_COUNT,
} from '../utils/utils';

type MemoryThresholdChartProps = {
  vmi: V1VirtualMachineInstance;
};

const MemoryThresholdChart: React.FC<MemoryThresholdChartProps> = ({ vmi }) => {
  const { currentTime, duration, timespan } = useDuration();
  const queries = React.useMemo(
    () => getUtilizationQueries({ obj: vmi, duration }),
    [vmi, duration],
  );
  const { ref, width, height } = useResponsiveCharts();

  const requests = vmi?.spec?.domain?.resources?.requests as {
    [key: string]: string;
  };
  const memory = getMemorySize(requests?.memory);

  const [data] = usePrometheusPoll({
    query: queries?.MEMORY_USAGE,
    endpoint: PrometheusEndpoint?.QUERY_RANGE,
    namespace: vmi?.metadata?.namespace,
    endTime: currentTime,
    timespan,
  });

  const prometheusMemoryData = data?.data?.result?.[0]?.values;
  const memoryAvailableBytes = xbytes.parseSize(`${memory?.size} ${memory?.unit}B`);

  const chartData = prometheusMemoryData?.map(([x, y]) => {
    return { x: new Date(x * MILLISECONDS_MULTIPLIER), y: Number(y), name: 'Memory used' };
  });

  const thresholdLine = new Array(chartData?.length || 0).fill(0).map((_, index) => ({
    x: chartData?.[index]?.x,
    y: memoryAvailableBytes,
    name: 'Memory available',
  }));

  const isReady = !isEmpty(chartData) || !isEmpty(thresholdLine);

  return (
    <ComponentReady isReady={isReady}>
      <div className="util-threshold-chart" ref={ref}>
        <Link to={queriesToLink(queries?.MEMORY_USAGE)}>
          <Chart
            height={height}
            width={width}
            padding={{ top: 35, bottom: 35, left: 55, right: 35 }}
            scale={{ x: 'time', y: 'linear' }}
            domain={{
              x: [currentTime - timespan, currentTime],
            }}
            containerComponent={
              <ChartVoronoiContainer
                labels={({ datum }) => {
                  return `${datum?.name}: ${xbytes(datum?.y, {
                    iec: true,
                    fixed: 2,
                  })}`;
                }}
                constrainToVisibleArea
              />
            }
          >
            <ChartAxis
              dependentAxis
              tickCount={2}
              tickValues={[0, thresholdLine?.[0]?.y]}
              tickFormat={formatMemoryYTick(thresholdLine?.[0]?.y, 0)}
              style={{
                ticks: {
                  stroke: 'transparent',
                },
                grid: {
                  stroke: chart_color_black_200.value,
                },
              }}
              axisComponent={<></>}
            />
            <ChartAxis
              tickFormat={tickFormat(duration, currentTime)}
              tickCount={TICKS_COUNT}
              style={{
                ticks: { stroke: 'transparent' },
              }}
              axisComponent={<></>}
            />
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
                },
              }}
            />
          </Chart>
        </Link>
      </div>
    </ComponentReady>
  );
};

export default MemoryThresholdChart;
