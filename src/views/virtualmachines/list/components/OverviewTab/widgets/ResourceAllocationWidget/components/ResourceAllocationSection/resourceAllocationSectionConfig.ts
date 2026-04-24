import { TFunction } from 'i18next';

import { NO_DATA_DASH } from '@kubevirt-utils/resources/vm/utils/constants';
import { METRICS } from '@overview/OverviewTab/metric-charts-card/utils/constants';
import { MetricChartData } from '@overview/OverviewTab/metric-charts-card/utils/hooks/useMetricChartData';
import { getCurrentValue } from '@overview/OverviewTab/metric-charts-card/utils/utils';

import { MetricQuotaData } from '../../hooks/useProjectResourceQuota';
import { TopClustersMetricData } from '../../hooks/useTopClustersChartData';
import { getMetricSubtitle } from '../../utils/utils';

export type WidgetConfig = {
  graphTitle: string;
  metric: string;
  subtitle: (data: MetricChartData, t: TFunction) => string;
  title: string;
};

export type WidgetDataMap = Record<
  string,
  {
    clusterData?: TopClustersMetricData;
    metricChartData: MetricChartData;
    quotaData?: MetricQuotaData;
  }
>;

const vmSubtitle = (data: MetricChartData, t: TFunction): string => {
  if (!data.isReady) return NO_DATA_DASH;
  return t('{{number}} running', { number: getCurrentValue(data.chartData) ?? 0 });
};

const defaultSubtitle =
  (metric: string) =>
  (data: MetricChartData): string =>
    getMetricSubtitle(data, metric);

export const getWidgetConfigs = (t: TFunction): WidgetConfig[] => [
  {
    graphTitle: t('Running'),
    metric: METRICS.RUNNING_VMS,
    subtitle: vmSubtitle,
    title: t('Virtual Machines'),
  },
  {
    graphTitle: t('Usage'),
    metric: METRICS.VCPU_USAGE,
    subtitle: defaultSubtitle(METRICS.VCPU_USAGE),
    title: t('vCPU usage'),
  },
  {
    graphTitle: t('Usage'),
    metric: METRICS.MEMORY,
    subtitle: defaultSubtitle(METRICS.MEMORY),
    title: t('Memory usage'),
  },
  {
    graphTitle: t('Allocated'),
    metric: METRICS.STORAGE,
    subtitle: defaultSubtitle(METRICS.STORAGE),
    title: t('Storage allocated'),
  },
];
