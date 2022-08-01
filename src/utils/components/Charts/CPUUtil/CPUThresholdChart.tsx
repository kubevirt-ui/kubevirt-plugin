import React from 'react';
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
import chart_color_blue_300 from '@patternfly/react-tokens/dist/esm/chart_color_blue_300';
import chart_color_orange_300 from '@patternfly/react-tokens/dist/esm/chart_color_orange_300';
import useDuration from '@virtualmachines/details/tabs/metrics/hooks/useDuration';

import ComponentReady from '../ComponentReady/ComponentReady';
import useResponsiveCharts from '../hooks/useResponsiveCharts';
import { getUtilizationQueries } from '../utils/queries';
import { queriesToLink, tickFormat } from '../utils/utils';

type CPUThresholdChartProps = {
  vmi: V1VirtualMachineInstance;
  pods: K8sResourceCommon[];
};

const CPUThresholdChart: React.FC<CPUThresholdChartProps> = ({ vmi, pods }) => {
  const vmiPod = React.useMemo(() => getVMIPod(vmi, pods), [pods, vmi]);
  const { currentTime, duration } = useDuration();
  const { ref, width, height } = useResponsiveCharts();
  const queries = React.useMemo(
    () => getUtilizationQueries({ obj: vmi, duration, launcherPodName: vmiPod?.metadata?.name }),
    [vmi, vmiPod, duration],
  );

  const [dataCPURequested] = usePrometheusPoll({
    query: queries.CPU_REQUESTED,
    endpoint: PrometheusEndpoint?.QUERY_RANGE,
    namespace: vmi?.metadata?.namespace,
    endTime: currentTime,
  });

  const [dataCPUUsage] = usePrometheusPoll({
    query: queries?.CPU_USAGE,
    endpoint: PrometheusEndpoint?.QUERY_RANGE,
    namespace: vmi?.metadata?.namespace,
    endTime: currentTime,
  });

  const cpuUsage = dataCPUUsage?.data?.result?.[0]?.values;
  const cpuRequested = dataCPURequested?.data?.result?.[0]?.values;

  const chartData = cpuUsage?.map(([, item], index) => {
    return { x: index, y: +item, name: 'CPU usage' };
  });

  const thresholdData = cpuRequested?.map(([, item], index) => {
    return { x: index, y: +item, name: 'CPU requested' };
  });

  const isReady = !isEmpty(chartData) && !isEmpty(thresholdData);

  return (
    <ComponentReady isReady={isReady}>
      <div className="util-threshold-chart" ref={ref}>
        <Link to={queriesToLink(queries?.CPU_USAGE)}>
          <Chart
            height={height}
            width={width}
            padding={35}
            scale={{ x: 'time', y: 'linear' }}
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
              tickValues={[thresholdData?.[0]?.y]}
              style={{
                ticks: {
                  stroke: 'transparent',
                },
              }}
              axisComponent={<></>}
            />
            <ChartAxis
              tickFormat={tickFormat(duration, currentTime)}
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
