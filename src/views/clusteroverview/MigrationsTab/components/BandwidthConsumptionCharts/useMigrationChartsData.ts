import { useMemo } from 'react';

import { getPrometheusData } from '@kubevirt-utils/components/Charts/utils/utils';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { PrometheusEndpoint, usePrometheusPoll } from '@openshift-console/dynamic-plugin-sdk';
import { useActiveNamespace } from '@openshift-console/dynamic-plugin-sdk';

import { ChartDataObject } from './constants';
import { getBaseQuery, mapPrometheusValues } from './utils';

type UseMigrationChartsData = (
  duration: string,
  currentTime: number,
  timespan: number,
) => {
  bandwidthConsumed: ChartDataObject[];
  maxBandwidthConsumed: number;
  maxMigrationCount: number;
  migrationsCount: ChartDataObject[];
};

export const useMigrationChartsData: UseMigrationChartsData = (duration, currentTime, timespan) => {
  const { t } = useKubevirtTranslation();
  const [activeNamespace] = useActiveNamespace();
  const baseQuery = useMemo(
    () => getBaseQuery(duration, activeNamespace),
    [activeNamespace, duration],
  );

  const [migrationsBandwidthConsumed] = usePrometheusPoll({
    endpoint: PrometheusEndpoint?.QUERY_RANGE,
    endTime: currentTime,
    query: `sum${baseQuery}`,
    timespan,
  });
  const [proccessedMigrationsCount] = usePrometheusPoll({
    endpoint: PrometheusEndpoint?.QUERY_RANGE,
    endTime: currentTime,
    query: `count${baseQuery}`,
    timespan,
  });

  const bandwidthConsumed = mapPrometheusValues(
    getPrometheusData(migrationsBandwidthConsumed),
    t('Bandwidth consumption'),
  );

  const migrationsCount = mapPrometheusValues(
    getPrometheusData(proccessedMigrationsCount),
    t('Running migrations'),
  );

  return {
    bandwidthConsumed,
    maxBandwidthConsumed: Math.max(...(bandwidthConsumed || []).map((o) => o.y)),
    maxMigrationCount: Math.max(...(migrationsCount || []).map((o) => o.y)),
    migrationsCount,
  };
};

export default useMigrationChartsData;
