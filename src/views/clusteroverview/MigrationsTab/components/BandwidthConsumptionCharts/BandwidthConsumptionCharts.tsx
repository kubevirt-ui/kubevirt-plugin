import React, { useMemo } from 'react';
import xbytes from 'xbytes';

import useResponsiveCharts from '@kubevirt-utils/components/Charts/hooks/useResponsiveCharts';
import DurationOption from '@kubevirt-utils/components/DurationOption/DurationOption';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { Bullseye, Divider, Grid, HelperText, HelperTextItem } from '@patternfly/react-core';

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

  const { bandwidthConsumed, migrationsCount, maxBandwidthConsumed, maxMigrationCount } =
    useMigrationChartsData(duration, currentTime, timespan);

  return (
    <div>
      {!isEmpty(bandwidthConsumed) || !isEmpty(migrationsCount) ? (
        <Grid ref={ref}>
          <MigrationsTimeAxis domainX={domainX} timespan={timespan} />
          <MigrationsUtilizationChart
            chartData={bandwidthConsumed}
            tickValues={getTickValuesAxisY(maxBandwidthConsumed)}
            tickFormat={(y) => xbytes(y, { iec: true, fixed: 0, prefixIndex: 3 })}
            labels={getLabel(timespan, bandwidthConsumed, true)}
            title={t('Network consumption')}
            domain={{
              x: domainX,
              y: getDomainY(maxBandwidthConsumed),
            }}
          />
          <Divider />
          <MigrationsUtilizationChart
            chartData={migrationsCount}
            tickValues={getTickValuesAxisY(maxMigrationCount, 1)}
            labels={getLabel(timespan, migrationsCount)}
            title={t('Running migrations')}
            domain={{
              x: domainX,
              y: getDomainY(maxMigrationCount, 1),
            }}
          />
        </Grid>
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

export default BandwidthConsumptionCharts;
