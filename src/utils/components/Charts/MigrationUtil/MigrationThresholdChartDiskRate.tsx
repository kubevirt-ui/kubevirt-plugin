import { type FC, useMemo } from 'react';
import { Link } from 'react-router';

import { type V1VirtualMachineInstance } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
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
import useStableYMax from '../hooks/useStableYMax';
import { VMQueries } from '../utils/queries';
import {
  addTimestampToTooltip,
  findMaxYValue,
  formatMemoryYTick,
  formatMigrationThresholdDiskRateTooltipData,
  getChartYRange,
  getPrometheusData,
  MILLISECONDS_MULTIPLIER,
  tickFormat,
  TICKS_COUNT,
} from '../utils/utils';

type MigrationThresholdChartDiskRateProps = {
  vmi: V1VirtualMachineInstance;
};

const MigrationThresholdChartDiskRate: FC<MigrationThresholdChartDiskRateProps> = ({ vmi }) => {
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

  const chartDataProcessed = dataProcessed?.map(([timestamp, value]) => {
    return {
      name: t('Data processed'),
      x: new Date(timestamp * MILLISECONDS_MULTIPLIER),
      y: Number(value),
    };
  });

  const isReady = !isEmpty(chartDataProcessed);
  const yMax = useStableYMax(
    findMaxYValue(chartDataProcessed),
    `${vmi?.metadata?.uid}_${duration}`,
  );
  const yRange = getChartYRange(yMax);

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
              ...(yRange && { y: yRange }),
            }}
            height={height}
            padding={35}
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
            </ChartGroup>
          </Chart>
        </Link>
      </div>
    </ComponentReady>
  );
};

export default MigrationThresholdChartDiskRate;
