import React from 'react';
import { Link } from 'react-router-dom-v5-compat';

import { V1VirtualMachineInstance } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { tickLabels } from '@kubevirt-utils/components/Charts/ChartLabels/styleOverrides';
import useVMQuery from '@kubevirt-utils/hooks/useVMQuery';
import { getNamespace } from '@kubevirt-utils/resources/shared';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { getCluster } from '@multicluster/helpers/selectors';
import { PrometheusEndpoint } from '@openshift-console/dynamic-plugin-sdk';
import {
  Chart,
  ChartAxis,
  ChartGroup,
  ChartLine,
  ChartVoronoiContainer,
} from '@patternfly/react-charts/victory';
import { chart_color_orange_300 } from '@patternfly/react-tokens';
import chart_color_black_200 from '@patternfly/react-tokens/dist/esm/chart_color_black_200';
import chart_color_blue_300 from '@patternfly/react-tokens/dist/esm/chart_color_blue_300';
import { useFleetPrometheusPoll } from '@stolostron/multicluster-sdk';
import useDuration from '@virtualmachines/details/tabs/metrics/hooks/useDuration';

import ComponentReady from '../ComponentReady/ComponentReady';
import useResponsiveCharts from '../hooks/useResponsiveCharts';
import { VMQueries } from '../utils/queries';
import {
  addTimestampToTooltip,
  AVG_LABEL,
  findMaxYValue,
  formatStorageReadLatencyAvgMaxTooltipData,
  MAX_LABEL,
  MILLISECONDS_MULTIPLIER,
  tickFormat,
  TICKS_COUNT,
} from '../utils/utils';

type StorageReadLatencyAvgMaxChartProps = {
  vmi: V1VirtualMachineInstance;
};

const StorageReadLatencyAvgMaxChart: React.FC<StorageReadLatencyAvgMaxChartProps> = ({ vmi }) => {
  const { currentTime, duration, timespan } = useDuration();

  const { query: queryAvg, queryLink } = useVMQuery(vmi, VMQueries.STORAGE_READ_LATENCY_AVG);
  const { query: queryMax } = useVMQuery(vmi, VMQueries.STORAGE_READ_LATENCY_MAX);
  const { height, ref, width } = useResponsiveCharts();

  const [avgData] = useFleetPrometheusPoll({
    cluster: getCluster(vmi),
    endpoint: PrometheusEndpoint?.QUERY_RANGE,
    endTime: currentTime,
    namespace: getNamespace(vmi),
    query: queryAvg,
    timespan,
  });

  const [maxData] = useFleetPrometheusPoll({
    cluster: getCluster(vmi),
    endpoint: PrometheusEndpoint?.QUERY_RANGE,
    endTime: currentTime,
    namespace: getNamespace(vmi),
    query: queryMax,
    timespan,
  });

  const avgLatencyData = avgData?.data?.result?.[0]?.values;
  const maxLatencyData = maxData?.data?.result?.[0]?.values;

  const avgChartData = avgLatencyData?.map(([x, y]) => {
    return { x: new Date(x * MILLISECONDS_MULTIPLIER), y: Number(y) };
  });

  const maxChartData = maxLatencyData?.map(([x, y]) => {
    return { x: new Date(x * MILLISECONDS_MULTIPLIER), y: Number(y) };
  });

  const allData = [...(avgChartData || []), ...(maxChartData || [])];
  const yMax = findMaxYValue(allData);

  const legendData = [
    {
      name: AVG_LABEL,
      symbol: { fill: chart_color_blue_300.value, type: 'square' },
    },
    {
      name: MAX_LABEL,
      symbol: { fill: chart_color_orange_300.value, type: 'square' },
    },
  ];

  return (
    <ComponentReady
      isReady={!isEmpty(avgChartData) || !isEmpty(maxChartData)}
      linkToMetrics={queryLink}
    >
      <div className="util-threshold-chart" ref={ref}>
        <Link to={queryLink}>
          <Chart
            containerComponent={
              <ChartVoronoiContainer
                constrainToVisibleArea
                labels={addTimestampToTooltip(formatStorageReadLatencyAvgMaxTooltipData)}
              />
            }
            domain={{
              x: [currentTime - timespan, currentTime],
              y: [0, yMax],
            }}
            height={height}
            legendData={legendData}
            legendPosition="bottom"
            padding={{ bottom: 55, left: 80, right: 35, top: 35 }}
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
              tickFormat={(tick: number) => `${tick === 0 ? tick : (tick * 1000)?.toFixed(2)} ms`}
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
              {avgChartData && (
                <ChartLine
                  style={{
                    data: {
                      stroke: chart_color_blue_300.value,
                      strokeWidth: 2,
                    },
                  }}
                  data={avgChartData}
                  name={AVG_LABEL}
                />
              )}
              {maxChartData && (
                <ChartLine
                  style={{
                    data: {
                      stroke: chart_color_orange_300.value,
                      strokeWidth: 2,
                    },
                  }}
                  data={maxChartData}
                  name={MAX_LABEL}
                />
              )}
            </ChartGroup>
          </Chart>
        </Link>
      </div>
    </ComponentReady>
  );
};

export default StorageReadLatencyAvgMaxChart;
