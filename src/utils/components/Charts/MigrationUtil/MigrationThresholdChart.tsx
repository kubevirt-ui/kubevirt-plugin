import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import xbytes from 'xbytes';

import { V1VirtualMachineInstance } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { PrometheusEndpoint, usePrometheusPoll } from '@openshift-console/dynamic-plugin-sdk';
import {
  Chart,
  ChartArea,
  ChartAxis,
  ChartGroup,
  ChartLegendOrientation,
  ChartLegendPosition,
  ChartVoronoiContainer,
} from '@patternfly/react-charts';
import chart_color_black_200 from '@patternfly/react-tokens/dist/esm/chart_color_black_200';
import chart_color_blue_300 from '@patternfly/react-tokens/dist/esm/chart_color_blue_300';
import chart_color_green_300 from '@patternfly/react-tokens/dist/esm/chart_color_green_300';
import chart_color_orange_300 from '@patternfly/react-tokens/dist/esm/chart_color_orange_300';
import useDuration from '@virtualmachines/details/tabs/metrics/hooks/useDuration';

import ComponentReady from '../ComponentReady/ComponentReady';
import useResponsiveCharts from '../hooks/useResponsiveCharts';
import { getUtilizationQueries } from '../utils/queries';
import {
  findMigrationMaxYValue,
  formatMemoryYTick,
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
  const queries = useMemo(() => getUtilizationQueries({ duration, obj: vmi }), [vmi, duration]);
  const { height, ref, width } = useResponsiveCharts();

  const [migrationDataProcessed] = usePrometheusPoll({
    endpoint: PrometheusEndpoint?.QUERY_RANGE,
    endTime: currentTime,
    namespace: vmi?.metadata?.namespace,
    query: queries?.MIGRATION_DATA_PROCESSED,
    timespan,
  });

  const [migrationDataRemaining] = usePrometheusPoll({
    endpoint: PrometheusEndpoint?.QUERY_RANGE,
    endTime: currentTime,
    namespace: vmi?.metadata?.namespace,
    query: queries?.MIGRATION_DATA_REMAINING,
    timespan,
  });

  const [migrationDataDirtyRate] = usePrometheusPoll({
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
                labels={({ datum }) => {
                  return `${datum?.name}: ${xbytes(datum?.y, { fixed: 2, iec: true })}`;
                }}
                constrainToVisibleArea
              />
            }
            domain={{
              x: [currentTime - timespan, currentTime],
              y: [0, yMax],
            }}
            legendData={[
              { name: t('Data Processed') },
              { name: t('Data Remaining'), symbol: { fill: chart_color_green_300.value } },
              { name: t('Memory Dirty Rate'), symbol: { fill: chart_color_orange_300.value } },
            ]}
            height={height}
            legendOrientation={ChartLegendOrientation.horizontal}
            legendPosition={ChartLegendPosition.bottom}
            padding={{ bottom: 55, left: 35, right: 35, top: 25 }}
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
              tickFormat={formatMemoryYTick(yMax, 2)}
              tickValues={[0, yMax]}
            />
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
