import React, { FC, useMemo } from 'react';
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

const MemoryThresholdChart: FC<MemoryThresholdChartProps> = ({ vmi }) => {
  const { currentTime, duration, timespan } = useDuration();
  const queries = useMemo(() => getUtilizationQueries({ duration, obj: vmi }), [vmi, duration]);
  const { height, ref, width } = useResponsiveCharts();

  const requests = vmi?.spec?.domain?.resources?.requests as {
    [key: string]: string;
  };
  const memory = getMemorySize(requests?.memory);

  const [data] = usePrometheusPoll({
    endpoint: PrometheusEndpoint?.QUERY_RANGE,
    endTime: currentTime,
    namespace: vmi?.metadata?.namespace,
    query: queries?.MEMORY_USAGE,
    timespan,
  });

  const prometheusMemoryData = data?.data?.result?.[0]?.values;
  const memoryAvailableBytes = xbytes.parseSize(`${memory?.size} ${memory?.unit}B`);

  const chartData = prometheusMemoryData?.map(([x, y]) => {
    return { name: 'Memory used', x: new Date(x * MILLISECONDS_MULTIPLIER), y: Number(y) };
  });

  const thresholdLine = new Array(chartData?.length || 0).fill(0).map((_, index) => ({
    name: 'Memory available',
    x: chartData?.[index]?.x,
    y: memoryAvailableBytes,
  }));

  const isReady = !isEmpty(chartData) || !isEmpty(thresholdLine);

  return (
    <ComponentReady isReady={isReady}>
      <div className="util-threshold-chart" ref={ref}>
        <Link to={queriesToLink(queries?.MEMORY_USAGE)}>
          <Chart
            containerComponent={
              <ChartVoronoiContainer
                labels={({ datum }) => {
                  return `${datum?.name}: ${xbytes(datum?.y, {
                    fixed: 2,
                    iec: true,
                  })}`;
                }}
                constrainToVisibleArea
              />
            }
            domain={{
              x: [currentTime - timespan, currentTime],
            }}
            height={height}
            padding={{ bottom: 35, left: 55, right: 35, top: 35 }}
            scale={{ x: 'time', y: 'linear' }}
            width={width}
          >
            <ChartAxis
              style={{
                grid: {
                  stroke: chart_color_black_200.value,
                },
              }}
              dependentAxis
              tickCount={2}
              tickFormat={formatMemoryYTick(thresholdLine?.[0]?.y, 0)}
              tickValues={[0, thresholdLine?.[0]?.y]}
            />
            <ChartAxis
              style={{
                tickLabels: { padding: 2 },
                ticks: { stroke: 'transparent' },
              }}
              axisComponent={<></>}
              tickCount={TICKS_COUNT}
              tickFormat={tickFormat(duration, currentTime)}
            />
            <ChartGroup>
              <ChartArea
                style={{
                  data: {
                    stroke: chart_color_blue_300.value,
                  },
                }}
                data={chartData}
              />
            </ChartGroup>
            <ChartThreshold
              style={{
                data: {
                  stroke: chart_color_orange_300.value,
                  strokeDasharray: 10,
                },
              }}
              data={thresholdLine}
            />
          </Chart>
        </Link>
      </div>
    </ComponentReady>
  );
};

export default MemoryThresholdChart;
