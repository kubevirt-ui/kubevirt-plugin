import React, { type FC } from 'react';
import xbytes from 'xbytes';

import useResponsiveCharts from '@kubevirt-utils/components/Charts/hooks/useResponsiveCharts';
import DurationOption from '@kubevirt-utils/components/DurationOption/DurationOption';
import ErrorAlert from '@kubevirt-utils/components/ErrorAlert/ErrorAlert';
import LoadingEmptyState from '@kubevirt-utils/components/LoadingEmptyState/LoadingEmptyState';
import useCurrentTime from '@kubevirt-utils/hooks/useCurrentTime';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { Bullseye, Divider, Grid } from '@patternfly/react-core';

import MigrationsTimeAxis from './components/MigrationsTimeAxis';
import MigrationsUtilizationChart from './components/MigrationsUtilizationChart';
import useMigrationChartsData from './useMigrationChartsData';
import { getDomainY, getLabel, getTickValuesAxisY } from './utils';

type BandwidthConsumptionChartsProps = {
  duration: string;
};

const BandwidthConsumptionCharts: FC<BandwidthConsumptionChartsProps> = ({ duration }) => {
  const { t } = useKubevirtTranslation();

  const currentTime = useCurrentTime();
  const timespan = DurationOption.getMilliseconds(duration);
  const domainX: [number, number] = [currentTime - timespan, currentTime];
  const { ref } = useResponsiveCharts();

  const {
    bandwidthConsumed,
    bandwidthLoaded,
    countLoaded,
    errorBandwidth,
    errorCount,
    maxBandwidthConsumed,
    maxMigrationCount,
    migrationsCount,
  } = useMigrationChartsData(duration, currentTime, timespan);

  const isLoading = !bandwidthLoaded || !countLoaded;
  const hasError = !!errorBandwidth || !!errorCount;

  if (isLoading && !hasError) {
    return (
      <Bullseye>
        <LoadingEmptyState />
      </Bullseye>
    );
  }

  if (hasError) {
    return (
      <Bullseye>
        <ErrorAlert error={errorBandwidth || errorCount} />
      </Bullseye>
    );
  }

  return (
    <Grid ref={ref}>
      {(!isEmpty(bandwidthConsumed) || !isEmpty(migrationsCount)) && (
        <MigrationsTimeAxis domainX={domainX} timespan={timespan} />
      )}
      <MigrationsUtilizationChart
        chartData={bandwidthConsumed}
        domain={{
          x: domainX,
          y: getDomainY(maxBandwidthConsumed),
        }}
        labels={getLabel(timespan, bandwidthConsumed, true)}
        tickFormat={(yValue) => xbytes(yValue, { fixed: 0, iec: true, prefixIndex: 3 })}
        tickValues={getTickValuesAxisY(maxBandwidthConsumed)}
        title={t('Bandwidth consumption')}
      />
      <Divider />
      <MigrationsUtilizationChart
        chartData={migrationsCount}
        domain={{
          x: domainX,
          y: getDomainY(maxMigrationCount, 1),
        }}
        labels={getLabel(timespan, migrationsCount)}
        tickValues={getTickValuesAxisY(maxMigrationCount, 1)}
        title={t('Running migrations')}
      />
    </Grid>
  );
};

export default BandwidthConsumptionCharts;
