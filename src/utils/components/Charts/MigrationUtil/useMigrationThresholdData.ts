import { useMemo } from 'react';

import { type V1VirtualMachineInstance } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import useVMQueries from '@kubevirt-utils/hooks/useVMQueries';
import { getNamespace } from '@kubevirt-utils/resources/shared';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { getCluster } from '@multicluster/helpers/selectors';
import { PrometheusEndpoint, type PrometheusValue } from '@openshift-console/dynamic-plugin-sdk';
import { type ChartPoint } from '@overview/OverviewTab/metric-charts-card/utils/hooks/types';
import { useFleetPrometheusPoll } from '@stolostron/multicluster-sdk';
import useDuration from '@virtualmachines/details/tabs/metrics/hooks/useDuration';

import { getPrometheusData, MILLISECONDS_MULTIPLIER } from '../utils/utils';

type UseMigrationThresholdData = {
  chartDataDirtyRate: ChartPoint[] | undefined;
  chartDataProcessed: ChartPoint[] | undefined;
  chartDataRemaining: ChartPoint[] | undefined;
  currentTime: number;
  duration: string;
  error: unknown;
  isLoading: boolean;
  isReady: boolean;
  queries: ReturnType<typeof useVMQueries>;
  timespan: number;
};

const mapMigrationValues = (
  values: PrometheusValue[] | undefined,
  name: string,
): ChartPoint[] | undefined =>
  values?.map(([timestamp, value]: PrometheusValue): ChartPoint => {
    return { name, x: new Date(timestamp * MILLISECONDS_MULTIPLIER), y: Number(value) };
  });

const useMigrationThresholdData = (vmi: V1VirtualMachineInstance): UseMigrationThresholdData => {
  const { t } = useKubevirtTranslation();
  const { currentTime, duration, timespan } = useDuration();
  const queries = useVMQueries(vmi);

  const prometheusProps = {
    cluster: getCluster(vmi),
    endpoint: PrometheusEndpoint?.QUERY_RANGE,
    endTime: currentTime,
    namespace: getNamespace(vmi),
    timespan,
  };

  const [migrationDataProcessed, processedLoaded, processedError] = useFleetPrometheusPoll({
    ...prometheusProps,
    query: queries?.MIGRATION_DATA_PROCESSED,
  });

  const [migrationDataRemaining, remainingLoaded, remainingError] = useFleetPrometheusPoll({
    ...prometheusProps,
    query: queries?.MIGRATION_DATA_REMAINING,
  });

  const [migrationDataDirtyRate, dirtyRateLoaded, dirtyRateError] = useFleetPrometheusPoll({
    ...prometheusProps,
    query: queries?.MIGRATION_MEMORY_DIRTY_RATE,
  });

  const isLoading = !processedLoaded || !remainingLoaded || !dirtyRateLoaded;
  const error = processedError || remainingError || dirtyRateError;

  const dataProcessed = useMemo(
    (): PrometheusValue[] | undefined => getPrometheusData(migrationDataProcessed),
    [migrationDataProcessed],
  );
  const dataRemaining = useMemo(
    (): PrometheusValue[] | undefined => getPrometheusData(migrationDataRemaining),
    [migrationDataRemaining],
  );
  const dataDirtyRate = useMemo(
    (): PrometheusValue[] | undefined => getPrometheusData(migrationDataDirtyRate),
    [migrationDataDirtyRate],
  );

  const chartDataProcessed = mapMigrationValues(dataProcessed, t('Data processed'));
  const chartDataRemaining = mapMigrationValues(dataRemaining, t('Data remaining'));
  const chartDataDirtyRate = mapMigrationValues(dataDirtyRate, t('Memory dirty rate'));

  const isReady =
    !isEmpty(chartDataProcessed) || !isEmpty(chartDataRemaining) || !isEmpty(chartDataDirtyRate);

  return {
    chartDataDirtyRate,
    chartDataProcessed,
    chartDataRemaining,
    currentTime,
    duration,
    error,
    isLoading,
    isReady,
    queries,
    timespan,
  };
};

export default useMigrationThresholdData;
