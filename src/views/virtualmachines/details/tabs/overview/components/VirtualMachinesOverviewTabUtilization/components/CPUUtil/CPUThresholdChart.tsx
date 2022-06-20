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
  ChartGroup,
  ChartThreshold,
  ChartTooltip,
  ChartVoronoiContainer,
} from '@patternfly/react-charts';
import chart_color_blue_300 from '@patternfly/react-tokens/dist/esm/chart_color_blue_300';
import chart_color_orange_300 from '@patternfly/react-tokens/dist/esm/chart_color_orange_300';
import chart_global_FontSize_2xl from '@patternfly/react-tokens/dist/esm/chart_global_FontSize_2xl';

import { getUtilizationQueries } from '../../utils/queries';
import { queriesToLink } from '../../utils/utils';
import ComponentReady from '../ComponentReady/ComponentReady';

type CPUThresholdChartProps = {
  timespan: number;
  vmi: V1VirtualMachineInstance;
  pods: K8sResourceCommon[];
};

const CPUThresholdChart: React.FC<CPUThresholdChartProps> = ({ timespan, vmi, pods }) => {
  const vmiPod = React.useMemo(() => getVMIPod(vmi, pods), [pods, vmi]);

  const queries = React.useMemo(
    () =>
      getUtilizationQueries({
        vmName: vmi?.metadata?.name,
        launcherPodName: vmiPod?.metadata?.name,
      }),
    [vmi, vmiPod],
  );

  const [dataCPURequested] = usePrometheusPoll({
    query: queries.CPU_REQUESTED,
    endpoint: PrometheusEndpoint?.QUERY_RANGE,
    namespace: vmi?.metadata?.namespace,
    timespan,
  });

  const [dataCPUUsage] = usePrometheusPoll({
    query: queries?.CPU_USAGE,
    endpoint: PrometheusEndpoint?.QUERY_RANGE,
    namespace: vmi?.metadata?.namespace,
    timespan,
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
      <Link to={queriesToLink(queries.CPU_REQUESTED)}>
        <Chart
          height={200}
          showAxis={false}
          containerComponent={
            <ChartVoronoiContainer
              labels={({ datum }) => {
                return `${datum?.name}: ${datum?.y?.toFixed(2)}'s`;
              }}
              labelComponent={
                <ChartTooltip style={{ fontSize: chart_global_FontSize_2xl.value }} />
              }
              constrainToVisibleArea
            />
          }
        >
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
                strokeWidth: 7,
              },
            }}
          />
        </Chart>
      </Link>
    </ComponentReady>
  );
};

export default CPUThresholdChart;
