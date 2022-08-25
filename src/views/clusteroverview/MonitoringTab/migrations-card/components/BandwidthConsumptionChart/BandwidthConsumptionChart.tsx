import React, { useMemo } from 'react';
import xbytes from 'xbytes';

import useResponsiveCharts from '@kubevirt-utils/components/Charts/hooks/useResponsiveCharts';
import { getPrometheusData } from '@kubevirt-utils/components/Charts/utils/utils';
import DurationOption from '@kubevirt-utils/components/DurationOption/DurationOption';
import {
  dateFormatterNoYear,
  timeFormatter,
} from '@kubevirt-utils/components/Timestamp/utils/datetime';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { PrometheusEndpoint, usePrometheusPoll } from '@openshift-console/dynamic-plugin-sdk';
import { Chart, ChartAxis, ChartLine, ChartVoronoiContainer } from '@patternfly/react-charts';
import { Bullseye, HelperText, HelperTextItem } from '@patternfly/react-core';

type ChartDataObject = {
  x: Date;
  y: number;
  name: string;
  idx: number;
};

type BandwidthConsumptionChartProps = {
  duration: string;
};

const BandwidthConsumptionChart: React.FC<BandwidthConsumptionChartProps> = ({ duration }) => {
  const { t } = useKubevirtTranslation();
  const currentTime = useMemo<number>(() => Date.now(), []);
  const { width, height } = useResponsiveCharts();
  const baseQuery = `sum_over_time(kubevirt_migrate_vmi_data_processed_bytes[${duration}])`;

  const timespan = DurationOption.getMilliseconds(duration);
  const [migrationsBandwidthConsumed] = usePrometheusPoll({
    query: `sum(${baseQuery})`,
    endpoint: PrometheusEndpoint?.QUERY_RANGE,
    endTime: currentTime,
    timespan,
  });
  const [proccessedMigrationsCount] = usePrometheusPoll({
    query: `count(${baseQuery})`,
    endpoint: PrometheusEndpoint?.QUERY_RANGE,
    endTime: currentTime,
    timespan,
  });

  const [bandwidthConsumed, migrationsCount] = useMemo(() => {
    const bandwidthConsumedData: ChartDataObject[] = getPrometheusData(
      migrationsBandwidthConsumed,
    )?.map(([x, y], idx) => {
      return {
        x: new Date(x * 1000),
        y: +y,
        name: t('Bandwidth consumption'),
        idx,
      };
    });

    const migrationsCountData: ChartDataObject[] = getPrometheusData(
      proccessedMigrationsCount,
    )?.map(([x, y], idx) => {
      return {
        x: new Date(x * 1000),
        y: +y,
        name: t('Running migrations'),
        idx,
      };
    });

    return [[...(bandwidthConsumedData || [])], [...(migrationsCountData || [])]];
  }, [migrationsBandwidthConsumed, proccessedMigrationsCount, t]);

  return (
    <div>
      {!isEmpty(bandwidthConsumed) ? (
        <Chart
          height={height}
          width={width}
          domain={{
            x: [currentTime - timespan, currentTime],
            y: [0, Math.max(...bandwidthConsumed.map((o) => o.y)) * 1.5],
          }}
          padding={{ top: 25, bottom: 55, left: 85, right: 55 }}
          scale={{ x: 'time', y: 'linear' }}
          containerComponent={
            <ChartVoronoiContainer
              labels={({ datum }) => {
                const bandwidth = bandwidthConsumed?.[datum.idx];
                const migrationCount = migrationsCount?.[datum.idx];
                const timestamp = timeFormatter.format(datum.x);

                return `${migrationCount?.y} ${migrationCount?.name} at ${timestamp}\n${xbytes(
                  bandwidth?.y,
                  {
                    iec: true,
                    fixed: 2,
                  },
                )} ${bandwidth?.name}`;
              }}
              constrainToVisibleArea
            />
          }
        >
          <ChartAxis
            tickFormat={(d) => {
              if (timespan > DurationOption.getMilliseconds('1d')) {
                // Add a newline between the date and time so tick labels don't overlap.
                return `${dateFormatterNoYear.format(d)}\n${timeFormatter.format(d)}`;
              }
              return timeFormatter.format(d);
            }}
            fixLabelOverlap
          />
          <ChartAxis dependentAxis tickFormat={(y) => xbytes(y, { iec: true, fixed: 0 })} />
          <ChartLine data={bandwidthConsumed} />
        </Chart>
      ) : (
        <Bullseye>
          <HelperText>
            <HelperTextItem isDynamic variant="warning">
              {t('No Datapoints found')}
            </HelperTextItem>
          </HelperText>
        </Bullseye>
      )}
    </div>
  );
};

export default BandwidthConsumptionChart;
