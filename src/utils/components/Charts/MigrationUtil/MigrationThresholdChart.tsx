import { type JSX } from 'react';
import { Link } from 'react-router';

import { type V1VirtualMachineInstance } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import useIsACMPage from '@multicluster/useIsACMPage';
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

import { tickLabels } from '../ChartLabels/styleOverrides';
import ComponentReady from '../ComponentReady/ComponentReady';
import useResponsiveCharts from '../hooks/useResponsiveCharts';
import useStableYMax from '../hooks/useStableYMax';
import {
  addTimestampToTooltip,
  findMigrationMaxYValue,
  formatMemoryYTick,
  formatMigrationThresholdTooltipData,
  getChartYRange,
  queriesToLink,
  tickFormat,
  TICKS_COUNT,
} from '../utils/utils';
import useMigrationThresholdData from './useMigrationThresholdData';

type MigrationThresholdChartProps = {
  vmi: V1VirtualMachineInstance;
};

const MigrationThresholdChart = ({ vmi }: MigrationThresholdChartProps): JSX.Element => {
  const { t } = useKubevirtTranslation();
  const isACMPage = useIsACMPage();
  const { height, ref, width } = useResponsiveCharts();
  const {
    chartDataDirtyRate,
    chartDataProcessed,
    chartDataRemaining,
    currentTime,
    duration,
    error,
    isLoading,
    isReady,
    queries,
    timespan,
  } = useMigrationThresholdData(vmi);

  const yMax = useStableYMax(
    findMigrationMaxYValue(chartDataProcessed, chartDataRemaining, chartDataDirtyRate),
    `${vmi?.metadata?.uid}_${duration}`,
  );
  const yRange = getChartYRange(yMax);
  const linkToMetrics = isACMPage
    ? undefined
    : queriesToLink([
        queries?.MIGRATION_DATA_REMAINING,
        queries.MIGRATION_DATA_PROCESSED,
        queries.MIGRATION_MEMORY_DIRTY_RATE,
      ]);

  const chart = (
    <Chart
      containerComponent={
        <ChartVoronoiContainer
          constrainToVisibleArea
          labels={addTimestampToTooltip(formatMigrationThresholdTooltipData)}
        />
      }
      domain={{
        x: [currentTime - timespan, currentTime],
        ...(yRange && { y: yRange }),
      }}
      height={height}
      legendData={[
        { name: t('Data processed') },
        { name: t('Data remaining'), symbol: { fill: chart_color_green_300.var } },
        { name: t('Memory dirty rate'), symbol: { fill: chart_color_orange_300.var } },
      ]}
      legendOrientation="horizontal"
      legendPosition="bottom"
      padding={{ bottom: 55, left: 35, right: 35, top: 25 }}
      scale={{ x: 'time', y: 'linear' }}
      width={width}
    >
      <ChartAxis
        dependentAxis
        style={{
          grid: {
            stroke: chart_color_black_200.value,
          },
          tickLabels,
        }}
        {...(yMax != null && {
          tickFormat: formatMemoryYTick(yMax, 2),
          tickValues: yRange,
        })}
      />
      <ChartAxis
        axisComponent={<></>}
        style={{
          tickLabels: { padding: 2, ...tickLabels },
          ticks: { stroke: 'transparent' },
        }}
        tickCount={TICKS_COUNT}
        tickFormat={tickFormat(duration, currentTime)}
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
  );

  return (
    <ComponentReady
      error={error}
      isLoading={isLoading}
      isReady={isReady}
      linkToMetrics={linkToMetrics}
    >
      <div className="util-threshold-chart" ref={ref}>
        {linkToMetrics ? <Link to={linkToMetrics}>{chart}</Link> : chart}
      </div>
    </ComponentReady>
  );
};

export default MigrationThresholdChart;
