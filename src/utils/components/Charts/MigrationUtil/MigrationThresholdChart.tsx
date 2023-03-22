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
  const queries = useMemo(() => getUtilizationQueries({ obj: vmi, duration }), [vmi, duration]);
  const { ref, width, height } = useResponsiveCharts();

  const [migrationDataProcessed] = usePrometheusPoll({
    query: queries?.MIGRATION_DATA_PROCESSED,
    endpoint: PrometheusEndpoint?.QUERY_RANGE,
    namespace: vmi?.metadata?.namespace,
    endTime: currentTime,
    timespan,
  });

  const [migrationDataRemaining] = usePrometheusPoll({
    query: queries?.MIGRATION_DATA_REMAINING,
    endpoint: PrometheusEndpoint?.QUERY_RANGE,
    namespace: vmi?.metadata?.namespace,
    endTime: currentTime,
    timespan,
  });

  const [migrationDataDirtyRate] = usePrometheusPoll({
    query: queries?.MIGRATION_MEMORY_DIRTY_RATE,
    endpoint: PrometheusEndpoint?.QUERY_RANGE,
    namespace: vmi?.metadata?.namespace,
    endTime: currentTime,
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
    return { x: new Date(x * MILLISECONDS_MULTIPLIER), y: Number(y), name: t('Data Processed') };
  });

  const chartDataRemaining = dataRemaining?.map(([x, y]) => {
    return { x: new Date(x * MILLISECONDS_MULTIPLIER), y: Number(y), name: t('Data Remaining') };
  });

  const chartDataDirtyRate = dataDirtyRate?.map(([x, y]) => {
    return { x: new Date(x * MILLISECONDS_MULTIPLIER), y: Number(y), name: t('Memory Dirty Rate') };
  });

  const isReady =
    !isEmpty(chartDataProcessed) || !isEmpty(chartDataRemaining) || !isEmpty(chartDataDirtyRate);
  const yMax = findMigrationMaxYValue(chartDataProcessed, chartDataRemaining, chartDataDirtyRate);

  return (
    <ComponentReady isReady={isReady}>
      <div className="util-threshold-chart" ref={ref}>
        <Link
          to={queriesToLink([
            queries?.MIGRATION_DATA_REMAINING,
            queries.MIGRATION_DATA_PROCESSED,
            queries.MIGRATION_MEMORY_DIRTY_RATE,
          ])}
        >
          <Chart
            height={height}
            width={width}
            padding={{ top: 25, bottom: 55, left: 35, right: 35 }}
            scale={{ x: 'time', y: 'linear' }}
            domain={{
              x: [currentTime - timespan, currentTime],
              y: [0, yMax],
            }}
            containerComponent={
              <ChartVoronoiContainer
                labels={({ datum }) => {
                  return `${datum?.name}: ${xbytes(datum?.y, { iec: true, fixed: 2 })}`;
                }}
                constrainToVisibleArea
              />
            }
            legendData={[
              { name: t('Data Processed') },
              { name: t('Data Remaining'), symbol: { fill: chart_color_green_300.value } },
              { name: t('Memory Dirty Rate'), symbol: { fill: chart_color_orange_300.value } },
            ]}
            legendOrientation={ChartLegendOrientation.horizontal}
            legendPosition={ChartLegendPosition.bottom}
          >
            <ChartAxis
              dependentAxis
              tickValues={[0, yMax]}
              tickFormat={formatMemoryYTick(yMax, 2)}
              style={{
                grid: {
                  stroke: chart_color_black_200.value,
                },
              }}
            />
            <ChartAxis
              tickFormat={tickFormat(duration, currentTime)}
              tickCount={TICKS_COUNT}
              style={{
                ticks: { stroke: 'transparent' },
              }}
              axisComponent={<></>}
            />
            <ChartGroup>
              <ChartArea
                data={chartDataProcessed}
                style={{
                  data: {
                    stroke: chart_color_blue_300.value,
                  },
                }}
              />
              <ChartArea
                data={chartDataRemaining}
                style={{
                  data: {
                    stroke: chart_color_green_300.value,
                  },
                }}
              />
              <ChartArea
                data={chartDataDirtyRate}
                style={{
                  data: {
                    stroke: chart_color_orange_300?.value,
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

export default MigrationThresholdChart;
