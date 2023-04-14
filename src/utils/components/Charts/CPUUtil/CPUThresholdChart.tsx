import React, { FC, useMemo } from 'react';
import { Link } from 'react-router-dom';

import { V1VirtualMachineInstance } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { getVMIPod } from '@kubevirt-utils/resources/vmi';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import {
  K8sResourceCommon,
  PrometheusEndpoint,
  usePrometheusPoll,
} from '@openshift-console/dynamic-plugin-sdk';
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
import { MILLISECONDS_MULTIPLIER, queriesToLink, tickFormat, TICKS_COUNT } from '../utils/utils';

type CPUThresholdChartProps = {
  vmi: V1VirtualMachineInstance;
  pods: K8sResourceCommon[];
};

const CPUThresholdChart: FC<CPUThresholdChartProps> = ({ vmi, pods }) => {
  const vmiPod = useMemo(() => getVMIPod(vmi, pods), [pods, vmi]);
  const { currentTime, duration, timespan } = useDuration();
  const { ref, width, height } = useResponsiveCharts();
  const queries = useMemo(
    () => getUtilizationQueries({ obj: vmi, duration, launcherPodName: vmiPod?.metadata?.name }),
    [vmi, vmiPod, duration],
  );

  const [dataCPURequested] = usePrometheusPoll({
    query: queries.CPU_REQUESTED,
    endpoint: PrometheusEndpoint?.QUERY_RANGE,
    namespace: vmi?.metadata?.namespace,
    endTime: currentTime,
    timespan,
  });

  const [dataCPUUsage] = usePrometheusPoll({
    query: queries?.CPU_USAGE,
    endpoint: PrometheusEndpoint?.QUERY_RANGE,
    namespace: vmi?.metadata?.namespace,
    endTime: currentTime,
    timespan,
  });

  const cpuUsage = dataCPUUsage?.data?.result?.[0]?.values;
  const cpuRequested = dataCPURequested?.data?.result?.[0]?.values;

  const chartData = cpuUsage?.map(([x, y]) => {
    return { x: new Date(x * MILLISECONDS_MULTIPLIER), y: Number(y), name: 'CPU usage' };
  });

  const thresholdData = cpuRequested?.map(([x, y]) => {
    return { x: new Date(x * MILLISECONDS_MULTIPLIER), y: Number(y), name: 'CPU requested' };
  });

  const isReady = !isEmpty(chartData) && !isEmpty(thresholdData);

  return (
    <ComponentReady isReady={isReady}>
      <div className="util-threshold-chart" ref={ref}>
        <Link to={queriesToLink(queries?.CPU_USAGE)}>
          <Chart
            height={height}
            width={width}
            padding={{ top: 35, bottom: 35, left: 70, right: 35 }}
            scale={{ x: 'time', y: 'linear' }}
            domain={{
              x: [currentTime - timespan, currentTime],
            }}
            containerComponent={
              <ChartVoronoiContainer
                labels={({ datum }) => {
                  return `${datum?.name}: ${datum?.y?.toFixed(2)}'s`;
                }}
                constrainToVisibleArea
              />
            }
          >
            <ChartAxis
              dependentAxis
              tickCount={2}
              tickValues={[0, thresholdData?.[0]?.y]}
              tickFormat={(tick: number) => `${tick === 0 ? tick : tick?.toFixed(2)} s`}
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
                },
              }}
            />
          </Chart>
        </Link>
      </div>
    </ComponentReady>
  );
};

export default CPUThresholdChart;
