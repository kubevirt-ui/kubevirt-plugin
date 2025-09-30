import React, { FC } from 'react';
import { Link } from 'react-router-dom-v5-compat';

import { V1VirtualMachineInstance } from '@kubevirt-ui/kubevirt-api/kubevirt';
import useVMQuery from '@kubevirt-utils/hooks/useVMQuery';
import { getNamespace } from '@kubevirt-utils/resources/shared';
import { getCPU, getVCPUCount } from '@kubevirt-utils/resources/vm';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { getCluster } from '@multicluster/helpers/selectors';
import { PrometheusEndpoint } from '@openshift-console/dynamic-plugin-sdk';
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
import { VMQueries } from '../utils/queries';
import {
  addTimestampToTooltip,
  formatCPUUtilTooltipData,
  MILLISECONDS_MULTIPLIER,
  tickFormat,
  TICKS_COUNT,
} from '../utils/utils';

type CPUThresholdChartProps = {
  vmi: V1VirtualMachineInstance;
};

const CPUThresholdChart: FC<CPUThresholdChartProps> = ({ vmi }) => {
  const { currentTime, duration, timespan } = useDuration();
  const { height, ref, width } = useResponsiveCharts();

  const { query, queryLink } = useVMQuery(vmi, VMQueries.CPU_USAGE);

  const prometheusProps = {
    cluster: getCluster(vmi),
    endpoint: PrometheusEndpoint?.QUERY_RANGE,
    endTime: currentTime,
    namespace: getNamespace(vmi),
    timespan,
  };

  const [dataCPUUsage] = useFleetPrometheusPoll({
    ...prometheusProps,
    endpoint: PrometheusEndpoint?.QUERY_RANGE,
    query,
  });

  const cpuUsage = dataCPUUsage?.data?.result?.[0]?.values;
  const cpu = getCPU(vmi);
  const cpuRequested = getVCPUCount(cpu);

  const showValuesInMillicores = cpuUsage?.some(([_, y]) => Number(y) < 1);

  const chartData = cpuUsage?.map(([x, y]) => {
    const value = Number(y);

    return {
      name: showValuesInMillicores ? 'CPU usage (m)' : 'CPU usage',
      x: new Date(x * MILLISECONDS_MULTIPLIER),
      y: showValuesInMillicores ? value * 1000 : value,
    };
  });

  const thresholdData = [
    {
      name: showValuesInMillicores ? 'CPU requested (m)' : 'CPU requested',
      x: new Date(currentTime),
      y: showValuesInMillicores ? cpuRequested * 1000 : cpuRequested,
    },
  ];

  const isReady = !isEmpty(chartData) && !isEmpty(thresholdData);

  return (
    <ComponentReady isReady={isReady} linkToMetrics={queryLink}>
      <div className="util-threshold-chart" ref={ref}>
        <Link to={queryLink}>
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
              tickValues={[0, showValuesInMillicores ? cpuRequested * 1000 : cpuRequested]}
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
