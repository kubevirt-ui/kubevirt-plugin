import React, { useMemo } from 'react';
import { Link } from 'react-router-dom-v5-compat';

import { V1VirtualMachineInstance } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import useVMQuery from '@kubevirt-utils/hooks/useVMQuery';
import { getNamespace } from '@kubevirt-utils/resources/shared';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { getCluster } from '@multicluster/helpers/selectors';
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
import { useFleetPrometheusPoll } from '@stolostron/multicluster-sdk';
import useDuration from '@virtualmachines/details/tabs/metrics/hooks/useDuration';

import { tickLabels } from '../ChartLabels/styleOverrides';
import ComponentReady from '../ComponentReady/ComponentReady';
import useResponsiveCharts from '../hooks/useResponsiveCharts';
import { VMQueries } from '../utils/queries';
import {
  addTimestampToTooltip,
  findMaxYValue,
  formatMemoryYTick,
  formatMigrationThresholdDiskRateTooltipData,
  getPrometheusData,
  MILLISECONDS_MULTIPLIER,
  tickFormat,
  TICKS_COUNT,
} from '../utils/utils';

type MigrationThresholdChartDiskRateProps = {
  vmi: V1VirtualMachineInstance;
};

const MigrationThresholdChartDiskRate: React.FC<MigrationThresholdChartDiskRateProps> = ({
  vmi,
}) => {
  const { t } = useKubevirtTranslation();

  const { currentTime, duration, timespan } = useDuration();
  const { query, queryLink } = useVMQuery(vmi, VMQueries.MIGRATION_DISK_TRANSFER_RATE);
  const { height, ref, width } = useResponsiveCharts();

  const [diskRate] = useFleetPrometheusPoll({
    cluster: getCluster(vmi),
    endpoint: PrometheusEndpoint?.QUERY_RANGE,
    endTime: currentTime,
    namespace: getNamespace(vmi),
    query,
    timespan,
  });

  const dataProcessed = useMemo(() => getPrometheusData(diskRate), [diskRate]);

  const chartDataProcessed = dataProcessed?.map(([x, y]) => {
    return { name: t('Data Processed'), x: new Date(x * MILLISECONDS_MULTIPLIER), y: Number(y) };
  });

  const isReady = !isEmpty(chartDataProcessed);
  const yMax = findMaxYValue(chartDataProcessed);

  return (
    <ComponentReady isReady={isReady} linkToMetrics={queryLink}>
      <div className="util-threshold-chart" ref={ref}>
        <Link to={queryLink}>
          <Chart
            containerComponent={
              <ChartVoronoiContainer
                constrainToVisibleArea
                labels={addTimestampToTooltip(formatMigrationThresholdDiskRateTooltipData)}
              />
            }
            domain={{
              x: [currentTime - timespan, currentTime],
              y: [0, yMax],
            }}
            height={height}
            padding={35}
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
            </ChartGroup>
          </Chart>
        </Link>
      </div>
    </ComponentReady>
  );
};

export default MigrationThresholdChartDiskRate;
