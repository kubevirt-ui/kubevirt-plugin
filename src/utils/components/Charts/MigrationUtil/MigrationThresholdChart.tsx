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
import chart_color_blue_300 from '@patternfly/react-tokens/dist/esm/chart_color_blue_300';
import chart_color_green_300 from '@patternfly/react-tokens/dist/esm/chart_color_green_300';
import chart_color_orange_300 from '@patternfly/react-tokens/dist/esm/chart_color_orange_300';
import useDuration from '@virtualmachines/details/tabs/metrics/hooks/useDuration';

import ComponentReady from '../ComponentReady/ComponentReady';
import useResponsiveCharts from '../hooks/useResponsiveCharts';
import { getUtilizationQueries } from '../utils/queries';
import { getPrometheusData, queriesToLink, tickFormat } from '../utils/utils';

type MigrationThresholdChartProps = {
  vmi: V1VirtualMachineInstance;
};

const MigrationThresholdChart: React.FC<MigrationThresholdChartProps> = ({ vmi }) => {
  const { t } = useKubevirtTranslation();
  const { currentTime, duration } = useDuration();
  const queries = useMemo(() => getUtilizationQueries({ obj: vmi, duration }), [vmi, duration]);
  const { ref, width, height } = useResponsiveCharts();

  const [migrationDataProcessed] = usePrometheusPoll({
    query: queries?.MIGRATION_DATA_PROCESSED,
    endpoint: PrometheusEndpoint?.QUERY_RANGE,
    namespace: vmi?.metadata?.namespace,
    endTime: currentTime,
  });

  const [migrationDataRemaining] = usePrometheusPoll({
    query: queries?.MIGRATION_DATA_REMAINING,
    endpoint: PrometheusEndpoint?.QUERY_RANGE,
    namespace: vmi?.metadata?.namespace,
    endTime: currentTime,
  });

  const [migrationDataDirtyRate] = usePrometheusPoll({
    query: queries?.MIGRATION_MEMORY_DIRTY_RATE,
    endpoint: PrometheusEndpoint?.QUERY_RANGE,
    namespace: vmi?.metadata?.namespace,
    endTime: currentTime,
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

  const chartDataProcessed = dataProcessed?.map(([, item], index) => {
    return { x: index, y: +item, name: t('Data Processed') };
  });

  const chartDataRemaining = dataRemaining?.map(([, item], index) => {
    return { x: index, y: +item, name: t('Data Remaining') };
  });

  const chartDataDirtyRate = dataDirtyRate?.map(([, item], index) => {
    return { x: index, y: +item, name: t('Memory Dirty Rate') };
  });

  const isReady =
    !isEmpty(chartDataProcessed) || !isEmpty(chartDataRemaining) || !isEmpty(chartDataDirtyRate);

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
              tickFormat={tickFormat(duration, currentTime)}
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
