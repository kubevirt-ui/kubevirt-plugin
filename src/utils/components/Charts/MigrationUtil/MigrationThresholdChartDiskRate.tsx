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
  ChartVoronoiContainer,
} from '@patternfly/react-charts';
import chart_color_blue_300 from '@patternfly/react-tokens/dist/esm/chart_color_blue_300';
import useDuration from '@virtualmachines/details/tabs/metrics/hooks/useDuration';

import ComponentReady from '../ComponentReady/ComponentReady';
import useResponsiveCharts from '../hooks/useResponsiveCharts';
import { getUtilizationQueries } from '../utils/queries';
import {
  getPrometheusData,
  MILLISECONDS_MULTIPLIER,
  queriesToLink,
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
  const queries = useMemo(() => getUtilizationQueries({ obj: vmi, duration }), [vmi, duration]);
  const { ref, width, height } = useResponsiveCharts();

  const [diskRate] = usePrometheusPoll({
    query: queries?.MIGRATION_DISK_TRANSFER_RATE,
    endpoint: PrometheusEndpoint?.QUERY_RANGE,
    namespace: vmi?.metadata?.namespace,
    endTime: currentTime,
    timespan,
  });
  const dataProcessed = useMemo(() => getPrometheusData(diskRate), [diskRate]);

  const chartDataProcessed = dataProcessed?.map(([x, y]) => {
    return { x: new Date(x * MILLISECONDS_MULTIPLIER), y: Number(y), name: t('Data Processed') };
  });

  const isReady = !isEmpty(chartDataProcessed);

  return (
    <ComponentReady isReady={isReady}>
      <div className="util-threshold-chart" ref={ref}>
        <Link to={queriesToLink(queries.MIGRATION_DISK_TRANSFER_RATE)}>
          <Chart
            height={height}
            width={width}
            padding={35}
            scale={{ x: 'time', y: 'linear' }}
            domain={{
              x: [currentTime - timespan, currentTime],
            }}
            containerComponent={
              <ChartVoronoiContainer
                labels={({ datum }) => {
                  return `${datum?.name}: ${xbytes(datum?.y, { iec: true, fixed: 2 })}`;
                }}
                constrainToVisibleArea
              />
            }
          >
            <ChartAxis
              tickFormat={tickFormat(duration, currentTime)}
              tickCount={TICKS_COUNT}
              style={{
                ticks: { stroke: 'transparent' },
                tickLabels: { padding: 2 },
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
            </ChartGroup>
          </Chart>
        </Link>
      </div>
    </ComponentReady>
  );
};

export default MigrationThresholdChartDiskRate;
