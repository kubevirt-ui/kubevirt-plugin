import React, { useMemo } from 'react';
import xbytes from 'xbytes';

import useResponsiveCharts from '@kubevirt-utils/components/Charts/hooks/useResponsiveCharts';
import DurationOption from '@kubevirt-utils/components/DurationOption/DurationOption';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { Divider, Grid } from '@patternfly/react-core';

import MigrationsTimeAxis from './components/MigrationsTimeAxis';
import MigrationsUtilizationChart from './components/MigrationsUtilizationChart';
import useMigrationChartsData from './useMigrationChartsData';
import { getDomainY, getLabel, getTickValuesAxisY } from './utils';

type BandwidthConsumptionChartsProps = {
  duration: string;
};

const BandwidthConsumptionCharts: React.FC<BandwidthConsumptionChartsProps> = ({ duration }) => {
  const { t } = useKubevirtTranslation();

  const currentTime = useMemo(() => Date.now(), []);
  const timespan = DurationOption.getMilliseconds(duration);
  const domainX: [number, number] = [currentTime - timespan, currentTime];
  const { ref } = useResponsiveCharts();

  const { bandwidthConsumed, maxBandwidthConsumed, maxMigrationCount, migrationsCount } =
    useMigrationChartsData(duration, currentTime, timespan);

  return (
    <Grid ref={ref}>
      {(!isEmpty(bandwidthConsumed) || !isEmpty(migrationsCount)) && (
        <MigrationsTimeAxis domainX={domainX} timespan={timespan} />
      )}
      <MigrationsUtilizationChart
        domain={{
          x: domainX,
          y: getDomainY(maxBandwidthConsumed),
        }}
        chartData={bandwidthConsumed}
        labels={getLabel(timespan, bandwidthConsumed, true)}
        tickFormat={(y) => xbytes(y, { fixed: 0, iec: true, prefixIndex: 3 })}
        tickValues={getTickValuesAxisY(maxBandwidthConsumed)}
        title={t('Bandwidth consumption')}
      />
      <Divider />
      <MigrationsUtilizationChart
        domain={{
          x: domainX,
          y: getDomainY(maxMigrationCount, 1),
        }}
        chartData={migrationsCount}
        labels={getLabel(timespan, migrationsCount)}
        tickValues={getTickValuesAxisY(maxMigrationCount, 1)}
        title={t('Running migrations')}
      />
    </Grid>
  );
};

export default BandwidthConsumptionCharts;
