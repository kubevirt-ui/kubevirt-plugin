import React, { useMemo } from 'react';
import { Link } from 'react-router-dom-v5-compat';

import { V1VirtualMachineInstance } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { PrometheusEndpoint } from '@openshift-console/dynamic-plugin-sdk';
import {
  Chart,
  ChartArea,
  ChartAxis,
  ChartGroup,
  ChartVoronoiContainer,
} from '@patternfly/react-charts/victory';
import chart_color_black_200 from '@patternfly/react-tokens/dist/esm/chart_color_black_200';
import chart_color_blue_300 from '@patternfly/react-tokens/dist/esm/chart_color_blue_300';
import chart_color_green_300 from '@patternfly/react-tokens/dist/esm/chart_color_green_300';
import chart_color_orange_300 from '@patternfly/react-tokens/dist/esm/chart_color_orange_300';
import { useFleetPrometheusPoll, useHubClusterName } from '@stolostron/multicluster-sdk';
import useDuration from '@virtualmachines/details/tabs/metrics/hooks/useDuration';

import { tickLabels } from '../ChartLabels/styleOverrides';
import ComponentReady from '../ComponentReady/ComponentReady';
import useResponsiveCharts from '../hooks/useResponsiveCharts';
import { getUtilizationQueries } from '../utils/queries';
import {
  addTimestampToTooltip,
  findMigrationMaxYValue,
  formatMemoryYTick,
  formatMigrationThresholdTooltipData,
  getPrometheusData,
  MILLISECONDS_MULTIPLIER,
  queriesToLink,
  tickFormat,
  TICKS_COUNT,
} from '../utils/utils';

type MigrationThresholdChartProps = {
  vmi: V1VirtualMachineInstance;
};

const MigrationThresholdChart: React.FC<MigrationThresholdChartProps> = ({ vmi }) => {
  const { t } = useKubevirtTranslation();
  const { currentTime, duration, timespan } = useDuration();
  const [hubClusterName] = useHubClusterName();

  const queries = useMemo(
    () => getUtilizationQueries({ duration, hubClusterName, obj: vmi }),
    [vmi, duration, hubClusterName],
  );
  const { height, ref, width } = useResponsiveCharts();

  const [migrationDataProcessed] = useFleetPrometheusPoll({
    cluster: vmi?.cluster,
    endpoint: PrometheusEndpoint?.QUERY_RANGE,
    endTime: currentTime,
    namespace: vmi?.metadata?.namespace,
    query: queries?.MIGRATION_DATA_PROCESSED,
    timespan,
  });

  const [migrationDataRemaining] = useFleetPrometheusPoll({
    cluster: vmi?.cluster,
    endpoint: PrometheusEndpoint?.QUERY_RANGE,
    endTime: currentTime,
    namespace: vmi?.metadata?.namespace,
    query: queries?.MIGRATION_DATA_REMAINING,
    timespan,
  });

  const [migrationDataDirtyRate] = useFleetPrometheusPoll({
    cluster: vmi?.cluster,
    endpoint: PrometheusEndpoint?.QUERY_RANGE,
    endTime: currentTime,
    namespace: vmi?.metadata?.namespace,
    query: queries?.MIGRATION_MEMORY_DIRTY_RATE,
    timespan,
  });

  const dataProcessed = useMemo(
    () => getPrometheusData(migrationDataProcessed),
    [migrationDataProcessed],
  );
  const dataRemaining = useMemo(
    () => getPrometheusData(migrationDataRemaining),
    [migrationDataRemaining],
  );
  const dataDirtyRate = useMemo(
    () => getPrometheusData(migrationDataDirtyRate),
    [migrationDataDirtyRate],
  );

  const chartDataProcessed = dataProcessed?.map(([x, y]) => {
    return { name: t('Data Processed'), x: new Date(x * MILLISECONDS_MULTIPLIER), y: Number(y) };
  });

  const chartDataRemaining = dataRemaining?.map(([x, y]) => {
    return { name: t('Data Remaining'), x: new Date(x * MILLISECONDS_MULTIPLIER), y: Number(y) };
  });

  const chartDataDirtyRate = dataDirtyRate?.map(([x, y]) => {
    return { name: t('Memory Dirty Rate'), x: new Date(x * MILLISECONDS_MULTIPLIER), y: Number(y) };
  });

  const isReady =
    !isEmpty(chartDataProcessed) || !isEmpty(chartDataRemaining) || !isEmpty(chartDataDirtyRate);
  const yMax = findMigrationMaxYValue(chartDataProcessed, chartDataRemaining, chartDataDirtyRate);
  const linkToMetrics = queriesToLink([
    queries?.MIGRATION_DATA_REMAINING,
    queries.MIGRATION_DATA_PROCESSED,
    queries.MIGRATION_MEMORY_DIRTY_RATE,
  ]);
  return (
    <ComponentReady isReady={isReady} linkToMetrics={linkToMetrics}>
      <div className="util-threshold-chart" ref={ref}>
        <Link to={linkToMetrics}>
          <Chart
            containerComponent={
              <ChartVoronoiContainer
                constrainToVisibleArea
                labels={addTimestampToTooltip(formatMigrationThresholdTooltipData)}
              />
            }
            domain={{
              x: [currentTime - timespan, currentTime],
              y: [0, yMax],
            }}
            legendData={[
              { name: t('Data Processed') },
              { name: t('Data Remaining'), symbol: { fill: chart_color_green_300.var } },
              { name: t('Memory Dirty Rate'), symbol: { fill: chart_color_orange_300.var } },
            ]}
            height={height}
            legendOrientation="horizontal"
            legendPosition="bottom"
            padding={{ bottom: 55, left: 35, right: 35, top: 25 }}
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
              tickFormat={formatMemoryYTick(yMax, 2)}
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
                data={chartDataProcessed}
              />
              <ChartArea
                style={{
                  data: {
                    stroke: chart_color_green_300.value,
                  },
                }}
                data={chartDataRemaining}
              />
              <ChartArea
                style={{
                  data: {
                    stroke: chart_color_orange_300?.value,
                  },
                }}
                data={chartDataDirtyRate}
              />
            </ChartGroup>
          </Chart>
        </Link>
      </div>
    </ComponentReady>
  );
};

export default MigrationThresholdChart;
