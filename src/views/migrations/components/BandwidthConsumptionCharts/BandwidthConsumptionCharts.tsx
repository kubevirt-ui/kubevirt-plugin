import { type FC, useMemo } from 'react';

import DurationOption from '@kubevirt-utils/components/DurationOption/DurationOption';
import ErrorAlert from '@kubevirt-utils/components/ErrorAlert/ErrorAlert';
import LoadingEmptyState from '@kubevirt-utils/components/LoadingEmptyState/LoadingEmptyState';
import useCurrentTime from '@kubevirt-utils/hooks/useCurrentTime';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { multipliers } from '@kubevirt-utils/utils/unitConstants';
import { Bullseye, Stack, StackItem } from '@patternfly/react-core';

import MigrationsUtilizationChart from './components/MigrationsUtilizationChart';
import { MIGRATIONS_OVERVIEW_CHART_HEIGHT } from './constants';
import { formatOverviewTick, getOverviewAxis, getOverviewDomainX } from './overviewChartUtils';
import useMigrationChartsData from './useMigrationChartsData';
import { getLabel } from './utils';

import './BandwidthConsumptionCharts.scss';

type BandwidthConsumptionChartsProps = {
  duration: string;
};

const BandwidthConsumptionCharts: FC<BandwidthConsumptionChartsProps> = ({ duration }) => {
  const { t } = useKubevirtTranslation();

  const currentTime = useCurrentTime();
  const timespan = DurationOption.getMilliseconds(duration);

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

  const bandwidthYAxis = useMemo(
    () => getOverviewAxis(maxBandwidthConsumed, multipliers.Mi),
    [maxBandwidthConsumed],
  );
  const runningYAxis = useMemo(() => getOverviewAxis(maxMigrationCount, 1), [maxMigrationCount]);
  const domainX = useMemo(
    () =>
      getOverviewDomainX([bandwidthConsumed, migrationsCount], currentTime - timespan, currentTime),
    [bandwidthConsumed, currentTime, migrationsCount, timespan],
  );

  const isLoading = !bandwidthLoaded || !countLoaded;
  const hasError = !!errorBandwidth || !!errorCount;

  return (
    <div className="migrations-bandwidth-charts">
      <div className="migrations-bandwidth-charts__section-title">{t('Resources')}</div>
      {isLoading && !hasError && (
        <Bullseye>
          <LoadingEmptyState />
        </Bullseye>
      )}
      {hasError && (
        <Bullseye>
          <ErrorAlert error={errorBandwidth || errorCount} />
        </Bullseye>
      )}
      {!isLoading && !hasError && (
        <Stack>
          <StackItem isFilled={false}>
            <MigrationsUtilizationChart
              chartData={bandwidthConsumed}
              chartHeight={MIGRATIONS_OVERVIEW_CHART_HEIGHT}
              domain={{
                x: domainX,
                y: bandwidthYAxis.domainY,
              }}
              labels={getLabel(timespan, bandwidthConsumed, true)}
              tickFormat={(yValue) => formatOverviewTick(yValue, multipliers.Mi)}
              tickValues={bandwidthYAxis.tickValues}
              title={t('Bandwidth consumption')}
              yAxisUnit={t('MiB/s')}
            />
          </StackItem>
          <StackItem isFilled={false}>
            <MigrationsUtilizationChart
              chartData={migrationsCount}
              chartHeight={MIGRATIONS_OVERVIEW_CHART_HEIGHT}
              domain={{
                x: domainX,
                y: runningYAxis.domainY,
              }}
              labels={getLabel(timespan, migrationsCount)}
              tickFormat={(yValue) => formatOverviewTick(yValue, 1)}
              tickValues={runningYAxis.tickValues}
              title={t('Running migrations')}
            />
          </StackItem>
        </Stack>
      )}
    </div>
  );
};

export default BandwidthConsumptionCharts;
