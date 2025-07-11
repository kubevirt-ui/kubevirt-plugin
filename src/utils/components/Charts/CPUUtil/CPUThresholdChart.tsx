import React, { FC, useMemo } from 'react';
import { Link } from 'react-router-dom-v5-compat';

import { V1VirtualMachineInstance } from '@kubevirt-ui/kubevirt-api/kubevirt';
import useVMQueries from '@kubevirt-utils/hooks/useVMQueries';
import { getNamespace } from '@kubevirt-utils/resources/shared';
import { getVMIPod } from '@kubevirt-utils/resources/vmi';
import { humanizeCpuCores } from '@kubevirt-utils/utils/humanize.js';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { getCluster } from '@multicluster/helpers/selectors';
import { K8sResourceCommon, PrometheusEndpoint } from '@openshift-console/dynamic-plugin-sdk';
import {
  Chart,
  ChartArea,
  ChartAxis,
  ChartGroup,
  ChartThreshold,
  ChartVoronoiContainer,
} from '@patternfly/react-charts/victory';
import chart_color_black_200 from '@patternfly/react-tokens/dist/esm/chart_color_black_200';
import chart_color_blue_300 from '@patternfly/react-tokens/dist/esm/chart_color_blue_300';
import chart_color_orange_300 from '@patternfly/react-tokens/dist/esm/chart_color_orange_300';
import { useFleetPrometheusPoll } from '@stolostron/multicluster-sdk';
import useDuration from '@virtualmachines/details/tabs/metrics/hooks/useDuration';

import { tickLabels } from '../ChartLabels/styleOverrides';
import ComponentReady from '../ComponentReady/ComponentReady';
import useResponsiveCharts from '../hooks/useResponsiveCharts';
import {
  addTimestampToTooltip,
  findMaxYValue,
  formatCPUUtilTooltipData,
  MILLISECONDS_MULTIPLIER,
  queriesToLink,
  tickFormat,
  TICKS_COUNT,
} from '../utils/utils';

type CPUThresholdChartProps = {
  pods: K8sResourceCommon[];
  vmi: V1VirtualMachineInstance;
};

const CPUThresholdChart: FC<CPUThresholdChartProps> = ({ pods, vmi }) => {
  const vmiPod = useMemo(() => getVMIPod(vmi, pods), [pods, vmi]);
  const { currentTime, duration, timespan } = useDuration();
  const { height, ref, width } = useResponsiveCharts();

  const queries = useVMQueries(vmi, vmiPod?.metadata?.name);

  const prometheusProps = {
    cluster: getCluster(vmi),
    endpoint: PrometheusEndpoint?.QUERY_RANGE,
    endTime: currentTime,
    namespace: getNamespace(vmi),
    timespan,
  };

  const [dataCPURequested] = useFleetPrometheusPoll({
    ...prometheusProps,
    endpoint: PrometheusEndpoint?.QUERY_RANGE,
    query: queries.CPU_REQUESTED,
  });

  const [dataCPUUsage] = useFleetPrometheusPoll({
    ...prometheusProps,
    endpoint: PrometheusEndpoint?.QUERY_RANGE,
    query: queries?.CPU_USAGE,
  });

  const cpuUsage = dataCPUUsage?.data?.result?.[0]?.values;
  const cpuRequested = dataCPURequested?.data?.result?.[0]?.values;

  const chartData = cpuUsage?.map(([x, y]) => {
    return {
      name: 'CPU usage',
      x: new Date(x * MILLISECONDS_MULTIPLIER),
      y: humanizeCpuCores(Number(y)).value,
    };
  });

  const thresholdData = cpuRequested?.map(([x, y]) => {
    return {
      name: 'CPU requested',
      x: new Date(x * MILLISECONDS_MULTIPLIER),
      y: humanizeCpuCores(Number(y)).value,
    };
  });

  const isReady = !isEmpty(chartData) && !isEmpty(thresholdData);
  const linkToMetrics = queriesToLink(queries?.CPU_USAGE);
  const yMax = findMaxYValue(thresholdData);
  return (
    <ComponentReady isReady={isReady} linkToMetrics={linkToMetrics}>
      <div className="util-threshold-chart" ref={ref}>
        <Link to={linkToMetrics}>
          <Chart
            containerComponent={
              <ChartVoronoiContainer
                constrainToVisibleArea
                labels={addTimestampToTooltip(formatCPUUtilTooltipData)}
              />
            }
            domain={{
              x: [currentTime - timespan, currentTime],
            }}
            height={height}
            padding={{ bottom: 35, left: 70, right: 35, top: 35 }}
            scale={{ x: 'time', y: 'linear' }}
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
              tickFormat={(tick: number) => tick?.toFixed(2)}
              tickValues={[0, yMax]}
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
              data={thresholdData}
            />
          </Chart>
        </Link>
      </div>
    </ComponentReady>
  );
};

export default CPUThresholdChart;
