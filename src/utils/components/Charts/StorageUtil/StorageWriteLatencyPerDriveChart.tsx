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
import chart_color_black_200 from '@patternfly/react-tokens/dist/esm/chart_color_black_200';
import chart_color_blue_300 from '@patternfly/react-tokens/dist/esm/chart_color_blue_300';
import chart_color_green_400 from '@patternfly/react-tokens/dist/esm/chart_color_green_400';
import chart_color_orange_300 from '@patternfly/react-tokens/dist/esm/chart_color_orange_300';
import chart_color_purple_300 from '@patternfly/react-tokens/dist/esm/chart_color_purple_300';
import { useFleetPrometheusPoll } from '@stolostron/multicluster-sdk';
import useDuration from '@virtualmachines/details/tabs/metrics/hooks/useDuration';

import ComponentReady from '../ComponentReady/ComponentReady';
import useResponsiveCharts from '../hooks/useResponsiveCharts';
import { VMQueries } from '../utils/queries';
import {
  addTimestampToTooltip,
  findMaxYValue,
  formatStorageLatencyTooltipData,
  getDriveName,
  MILLISECONDS_MULTIPLIER,
  tickFormat,
  TICKS_COUNT,
} from '../utils/utils';

type StorageWriteLatencyPerDriveChartProps = {
  vmi: V1VirtualMachineInstance;
};

const CHART_COLORS = [
  chart_color_blue_300.value,
  chart_color_green_400.value,
  chart_color_orange_300.value,
  chart_color_purple_300.value,
];

const StorageWriteLatencyPerDriveChart: React.FC<StorageWriteLatencyPerDriveChartProps> = ({
  vmi,
}) => {
  const { currentTime, duration, timespan } = useDuration();

  const { query, queryLink } = useVMQuery(vmi, VMQueries.STORAGE_WRITE_LATENCY_PER_DRIVE);
  const { height, ref, width } = useResponsiveCharts();

  const [data, loaded, error] = useFleetPrometheusPoll({
    cluster: getCluster(vmi),
    endpoint: PrometheusEndpoint?.QUERY_RANGE,
    endTime: currentTime,
    namespace: getNamespace(vmi),
    query,
    timespan,
  });

  const results = data?.data?.result || [];

  const isLoading = !loaded;

  const chartDataSeries = results.map((result, index) => {
    const driveName = getDriveName(result.metric?.drive, index);
    const values = result.values || [];

    const chartData = values.map(([x, y]) => ({
      x: new Date(x * MILLISECONDS_MULTIPLIER),
      y: Number(y),
    }));

    return {
      color: CHART_COLORS[index % CHART_COLORS.length],
      data: chartData,
      name: driveName,
    };
  });

  const allData = chartDataSeries.flatMap((series) => series.data);
  const yMax = findMaxYValue(allData);

  const legendData = chartDataSeries.map((series) => ({
    name: series.name,
    symbol: { fill: series.color, type: 'square' },
  }));

  return (
    <ComponentReady
      error={error}
      isLoading={isLoading}
      isReady={!isEmpty(allData)}
      linkToMetrics={queryLink}
    >
      <div className="util-threshold-chart" ref={ref}>
        <Link to={queryLink}>
          <Chart
            containerComponent={
              <ChartVoronoiContainer
                constrainToVisibleArea
                labels={addTimestampToTooltip(formatStorageLatencyTooltipData)}
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
              {chartDataSeries.map((series) => (
                <ChartLine
                  style={{
                    data: {
                      stroke: series.color,
                      strokeWidth: 2,
                    },
                  }}
                  data={series.data}
                  key={series.name}
                  name={series.name}
                />
              ))}
            </ChartGroup>
          </Chart>
        </Link>
      </div>
    </ComponentReady>
  );
};

export default StorageWriteLatencyPerDriveChart;
