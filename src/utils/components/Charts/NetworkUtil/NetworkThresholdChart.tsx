import React from 'react';
import { Link } from 'react-router-dom-v5-compat';
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
import chart_color_blue_400 from '@patternfly/react-tokens/dist/esm/chart_color_blue_400';
import useDuration from '@virtualmachines/details/tabs/metrics/hooks/useDuration';

import ComponentReady from '../ComponentReady/ComponentReady';
import useResponsiveCharts from '../hooks/useResponsiveCharts';
import { getUtilizationQueries } from '../utils/queries';
import { MILLISECONDS_MULTIPLIER, queriesToLink, tickFormat, TICKS_COUNT } from '../utils/utils';

type NetworkThresholdChartProps = {
  vmi: V1VirtualMachineInstance;
};

const NetworkThresholdChart: React.FC<NetworkThresholdChartProps> = ({ vmi }) => {
  const { currentTime, duration, timespan } = useDuration();
  const queries = React.useMemo(
    () => getUtilizationQueries({ duration, obj: vmi }),
    [vmi, duration],
  );
  const { height, ref, width } = useResponsiveCharts();

  const [networkIn] = usePrometheusPoll({
    endpoint: PrometheusEndpoint?.QUERY_RANGE,
    endTime: currentTime,
    namespace: vmi?.metadata?.namespace,
    query: queries?.NETWORK_IN_USAGE,
    timespan,
  });

  const [networkOut] = usePrometheusPoll({
    endpoint: PrometheusEndpoint?.QUERY_RANGE,
    endTime: currentTime,
    namespace: vmi?.metadata?.namespace,
    query: queries?.NETWORK_OUT_USAGE,
    timespan,
  });

  const networkInData = networkIn?.data?.result?.[0]?.values;
  const networkOutData = networkOut?.data?.result?.[0]?.values;
  const chartDataIn = networkInData?.map(([x, y]) => {
    return { name: 'Network In', x: new Date(x * MILLISECONDS_MULTIPLIER), y: Number(y) };
  });

  const chartDataOut = networkOutData?.map(([x, y]) => {
    return { name: 'Network Out', x: new Date(x * MILLISECONDS_MULTIPLIER), y: Number(y) };
  });

  const isReady = !isEmpty(chartDataOut) || !isEmpty(chartDataIn);

  return (
    <ComponentReady isReady={isReady}>
      <div className="util-threshold-chart" ref={ref}>
        <Link to={queriesToLink([queries?.NETWORK_IN_USAGE, queries?.NETWORK_OUT_USAGE])}>
          <Chart
            containerComponent={
              <ChartVoronoiContainer
                labels={({ datum }) => {
                  return `${datum?.name}: ${xbytes(datum?.y, { fixed: 2, iec: true })}`;
                }}
                constrainToVisibleArea
              />
            }
            domain={{
              x: [currentTime - timespan, currentTime],
            }}
            height={height}
            padding={35}
            scale={{ x: 'time', y: 'linear' }}
            width={width}
          >
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
                data={chartDataOut}
              />
              <ChartArea
                style={{
                  data: {
                    stroke: chart_color_blue_400.value,
                  },
                }}
                data={chartDataIn}
              />
            </ChartGroup>
          </Chart>
        </Link>
      </div>
    </ComponentReady>
  );
};

export default NetworkThresholdChart;
