import React from 'react';

import { V1VirtualMachineInstance } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { PrometheusEndpoint } from '@openshift-console/dynamic-plugin-sdk';
import {
  Chart,
  ChartArea,
  ChartAxis,
  ChartGroup,
  ChartVoronoiContainer,
} from '@patternfly/react-charts/victory';
import chart_color_blue_300 from '@patternfly/react-tokens/dist/esm/chart_color_blue_300';
import { useFleetPrometheusPoll, useHubClusterName } from '@stolostron/multicluster-sdk';
import useDuration from '@virtualmachines/details/tabs/metrics/hooks/useDuration';

import ComponentReady from '../ComponentReady/ComponentReady';
import useResponsiveCharts from '../hooks/useResponsiveCharts';
import { getUtilizationQueries } from '../utils/queries';
import {
  addTimestampToTooltip,
  formatStorageWriteThresholdTooltipData,
  MILLISECONDS_MULTIPLIER,
  tickFormat,
  TICKS_COUNT,
} from '../utils/utils';

type StorageThresholdChartProps = {
  vmi: V1VirtualMachineInstance;
};

const GIB_IN_BYTES = 1024;

const StorageWriteThresholdChart: React.FC<StorageThresholdChartProps> = ({ vmi }) => {
  const { currentTime, duration, timespan } = useDuration();
  const [hubClusterName] = useHubClusterName();
  const queries = React.useMemo(
    () => getUtilizationQueries({ duration, hubClusterName, obj: vmi }),
    [vmi, duration, hubClusterName],
  );
  const { height, ref, width } = useResponsiveCharts();

  const [data] = useFleetPrometheusPoll({
    cluster: vmi?.cluster,
    endpoint: PrometheusEndpoint?.QUERY_RANGE,
    endTime: currentTime,
    namespace: vmi?.metadata?.namespace,
    query: queries?.FILESYSTEM_WRITE_USAGE,
    timespan,
  });

  const storageWriteData = data?.data?.result?.[0]?.values;

  const chartData = storageWriteData?.map(([x, y]) => {
    return { x: new Date(x * MILLISECONDS_MULTIPLIER), y: Number(y) / GIB_IN_BYTES };
  });

  return (
    <ComponentReady isReady={!isEmpty(chartData)}>
      <div className="util-threshold-chart" ref={ref}>
        <Chart
          containerComponent={
            <ChartVoronoiContainer
              constrainToVisibleArea
              labels={addTimestampToTooltip(formatStorageWriteThresholdTooltipData)}
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
        </Chart>
      </div>
    </ComponentReady>
  );
};

export default StorageWriteThresholdChart;
