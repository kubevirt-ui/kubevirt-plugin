import React from 'react';
import { Link } from 'react-router-dom';
import xbytes from 'xbytes';

import { V1VirtualMachineInstance } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { PrometheusEndpoint, usePrometheusPoll } from '@openshift-console/dynamic-plugin-sdk';
import {
  Chart,
  ChartArea,
  ChartAxis,
  ChartGroup,
  ChartVoronoiContainer,
} from '@patternfly/react-charts';
import chart_color_blue_300 from '@patternfly/react-tokens/dist/esm/chart_color_blue_300';
import chart_color_blue_400 from '@patternfly/react-tokens/dist/esm/chart_color_blue_300';
import useDuration from '@virtualmachines/details/tabs/metrics/hooks/useDuration';

import ComponentReady from '../ComponentReady/ComponentReady';
import useResponsiveCharts from '../hooks/useResponsiveCharts';
import { getUtilizationQueries } from '../utils/queries';
import { queriesToLink, tickFormat } from '../utils/utils';

type NetworkThresholdChartProps = {
  vmi: V1VirtualMachineInstance;
};

const NetworkThresholdChart: React.FC<NetworkThresholdChartProps> = ({ vmi }) => {
  const { currentTime, duration } = useDuration();
  const queries = React.useMemo(() => getUtilizationQueries(vmi, duration), [vmi, duration]);
  const { ref, width, height } = useResponsiveCharts();

  const [networkIn] = usePrometheusPoll({
    query: queries?.NETWORK_IN_USAGE,
    endpoint: PrometheusEndpoint?.QUERY_RANGE,
    namespace: vmi?.metadata?.namespace,
    endTime: currentTime,
  });

  const [networkOut] = usePrometheusPoll({
    query: queries?.NETWORK_OUT_USAGE,
    endpoint: PrometheusEndpoint?.QUERY_RANGE,
    namespace: vmi?.metadata?.namespace,
    endTime: currentTime,
  });

  const networkInData = networkIn?.data?.result?.[0]?.values;
  const networkOutData = networkOut?.data?.result?.[0]?.values;
  const chartDataIn = networkInData?.map(([, item], index) => {
    return { x: index, y: +item, name: 'Network In' };
  });

  const chartDataOut = networkOutData?.map(([, item], index) => {
    return { x: index, y: +item, name: 'Network Out' };
  });

  const isReady = !isEmpty(chartDataOut) || !isEmpty(chartDataIn);

  return (
    <ComponentReady isReady={isReady}>
      <div className="util-threshold-chart" ref={ref}>
        <Link to={queriesToLink([queries?.NETWORK_IN_USAGE, queries?.NETWORK_OUT_USAGE])}>
          <Chart
            height={height}
            width={width}
            padding={35}
            scale={{ x: 'time', y: 'linear' }}
            containerComponent={
              <ChartVoronoiContainer
                labels={({ datum }) => {
                  return `${datum?.name}: ${xbytes(datum?.y, { iec: true, fixed: 2 })}`;
                }}
                constrainToVisibleArea
              />
            }
          >
            <ChartAxis
              tickFormat={tickFormat(duration, currentTime)}
              style={{
                ticks: { stroke: 'transparent' },
              }}
              axisComponent={<></>}
            />
            <ChartGroup>
              <ChartArea
                data={chartDataOut}
                style={{
                  data: {
                    stroke: chart_color_blue_300.value,
                  },
                }}
              />
              <ChartArea
                data={chartDataIn}
                style={{
                  data: {
                    stroke: chart_color_blue_400.value,
                  },
                }}
              />
            </ChartGroup>
          </Chart>
        </Link>
      </div>
    </ComponentReady>
  );
};

export default NetworkThresholdChart;
