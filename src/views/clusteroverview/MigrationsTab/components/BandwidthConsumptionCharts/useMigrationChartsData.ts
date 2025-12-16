import { useMemo } from 'react';

import { getPrometheusData } from '@kubevirt-utils/components/Charts/utils/utils';
import { ALL_CLUSTERS_KEY } from '@kubevirt-utils/hooks/constants';
import useActiveNamespace from '@kubevirt-utils/hooks/useActiveNamespace';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import useActiveClusterParam from '@multicluster/hooks/useActiveClusterParam';
import { PrometheusEndpoint } from '@openshift-console/dynamic-plugin-sdk';
import { useFleetPrometheusPoll, useHubClusterName } from '@stolostron/multicluster-sdk';

import { ChartDataObject } from './constants';
import { getBaseQuery, mapPrometheusValues } from './utils';

type UseMigrationChartsData = (
  duration: string,
  currentTime: number,
  timespan: number,
) => {
  bandwidthConsumed: ChartDataObject[];
  bandwidthLoaded: boolean;
  countLoaded: boolean;
  errorBandwidth: Error | unknown;
  errorCount: Error | unknown;
  maxBandwidthConsumed: number;
  maxMigrationCount: number;
  migrationsCount: ChartDataObject[];
};

export const useMigrationChartsData: UseMigrationChartsData = (duration, currentTime, timespan) => {
  const { t } = useKubevirtTranslation();
  const activeNamespace = useActiveNamespace();
  const cluster = useActiveClusterParam();
  const [hubClusterName] = useHubClusterName();
  const baseQuery = useMemo(
    () =>
      getBaseQuery(
        duration,
        activeNamespace,
        cluster === ALL_CLUSTERS_KEY ? undefined : cluster,
        cluster === ALL_CLUSTERS_KEY ? undefined : hubClusterName,
      ),
    [activeNamespace, cluster, duration, hubClusterName],
  );

  const [migrationsBandwidthConsumed, bandwidthLoaded, errorBandwidth] = useFleetPrometheusPoll({
    endpoint: PrometheusEndpoint?.QUERY_RANGE,
    endTime: currentTime,
    query: `sum${baseQuery}`,
    timespan,
    ...(cluster === ALL_CLUSTERS_KEY ? { allClusters: true } : { cluster }),
  });
  const [processedMigrationsCount, countLoaded, errorCount] = useFleetPrometheusPoll({
    endpoint: PrometheusEndpoint?.QUERY_RANGE,
    endTime: currentTime,
    query: `count${baseQuery}`,
    timespan,
    ...(cluster === ALL_CLUSTERS_KEY ? { allClusters: true } : { cluster }),
  });

  const bandwidthConsumed = useMemo(
    () =>
      mapPrometheusValues(
        getPrometheusData(migrationsBandwidthConsumed),
        t('Bandwidth consumption'),
      ),
    [migrationsBandwidthConsumed, t],
  );

  const migrationsCount = useMemo(
    () => mapPrometheusValues(getPrometheusData(processedMigrationsCount), t('Running migrations')),
    [processedMigrationsCount, t],
  );

  return {
    bandwidthConsumed,
    bandwidthLoaded,
    countLoaded,
    errorBandwidth,
    errorCount,
    maxBandwidthConsumed: Math.max(...(bandwidthConsumed || []).map((o) => o.y), 0),
    maxMigrationCount: Math.max(...(migrationsCount || []).map((o) => o.y), 0),
    migrationsCount,
  };
};

export default useMigrationChartsData;
