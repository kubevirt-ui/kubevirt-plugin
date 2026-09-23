import { type FC, useMemo, useState } from 'react';

import { METRICS } from '@kubevirt-utils/components/Charts/MetricChartUtils/constants';
import useMetricChartData from '@kubevirt-utils/components/Charts/MetricChartUtils/hooks/useMetricChartData';
import { hasForbiddenLoadedError } from '@kubevirt-utils/errors/clusterMetricsAccess';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import useIsAllClustersPage from '@multicluster/hooks/useIsAllClustersPage';

import ClusterMetricsUnavailableEmptyState from '../../../../components/ClusterMetricsUnavailableEmptyState';
import { determineOverviewLevel } from '../../../../config';
import {
  GRID_FOUR_EQUAL,
  OVERVIEW_LEVEL_PROJECT,
  type OverviewSectionData,
} from '../../../../types';
import OverviewSection from '../../../OverviewSection/OverviewSection';
import OverviewSectionRow from '../../../OverviewSection/OverviewSectionRow';
import useProjectResourceQuota from '../../hooks/useProjectResourceQuota';
import { useTopClusterNames, useTopClustersChartData } from '../../hooks/useTopClustersChartData';
import ResourceAllocationWidget from '../../ResourceAllocationWidget';
import ClusterLegend from '../ResourceAllocationChart/ClusterLegend';
import ResourceAllocationSubHeader from '../ResourceAllocationSubHeader/ResourceAllocationSubHeader';
import { buildWidgetDataMap, getWidgetConfigs } from './resourceAllocationSectionConfig';

const ResourceAllocationSection: FC<OverviewSectionData> = ({
  metricsUnavailable,
  namespace,
  title,
  vmNames,
}) => {
  const { t } = useKubevirtTranslation();
  const isAllClusters = useIsAllClustersPage();
  const isProjectLevel =
    determineOverviewLevel(namespace, isAllClusters) === OVERVIEW_LEVEL_PROJECT;
  const widgetConfigs = getWidgetConfigs(t);
  const [selectedMetric, setSelectedMetric] = useState<string>(widgetConfigs[0].metric);

  const runningVmData = useMetricChartData(METRICS.RUNNING_VMS, vmNames);
  const cpuData = useMetricChartData(METRICS.VCPU_USAGE, vmNames);
  const memoryData = useMetricChartData(METRICS.MEMORY, vmNames);
  const storageData = useMetricChartData(METRICS.STORAGE, vmNames);

  const { projectQuota } = useProjectResourceQuota(namespace);

  const { error, loaded, topClusterNames } = useTopClusterNames(selectedMetric, isAllClusters);
  const vmClusterData = useTopClustersChartData(
    METRICS.RUNNING_VMS,
    topClusterNames,
    isAllClusters,
  );
  const cpuClusterData = useTopClustersChartData(
    METRICS.VCPU_USAGE,
    topClusterNames,
    isAllClusters,
  );
  const memClusterData = useTopClustersChartData(METRICS.MEMORY, topClusterNames, isAllClusters);
  const storageClusterData = useTopClustersChartData(
    METRICS.STORAGE,
    topClusterNames,
    isAllClusters,
  );

  const dataMap = useMemo(
    () =>
      buildWidgetDataMap({
        cpuClusterData,
        cpuData,
        memClusterData,
        memoryData,
        projectQuota,
        runningVmData,
        storageClusterData,
        storageData,
        vmClusterData,
      }),
    [
      runningVmData,
      cpuData,
      memoryData,
      storageData,
      vmClusterData,
      cpuClusterData,
      memClusterData,
      storageClusterData,
      projectQuota,
    ],
  );

  const legendSeries = vmClusterData?.chartSeries ?? [];
  const metricsForbidden = hasForbiddenLoadedError(
    isAllClusters
      ? [{ error, loaded }, vmClusterData, cpuClusterData, memClusterData, storageClusterData]
      : [runningVmData, cpuData, memoryData, storageData],
  );

  const subHeader = (
    <ResourceAllocationSubHeader
      isAllClusters={isAllClusters}
      onDropdownChange={setSelectedMetric}
      selectedMetric={selectedMetric}
      topClusterCount={topClusterNames.length}
      widgetConfigs={widgetConfigs}
    />
  );

  if (metricsUnavailable || metricsForbidden) {
    return (
      <OverviewSection dataTestId="resource-allocation-section" title={title}>
        <ClusterMetricsUnavailableEmptyState metricsForbidden={metricsForbidden} />
      </OverviewSection>
    );
  }

  return (
    <OverviewSection dataTestId="resource-allocation-section" subHeader={subHeader} title={title}>
      <OverviewSectionRow
        className="overview-section__row--two-columns-wide"
        gridColumns={GRID_FOUR_EQUAL}
      >
        {widgetConfigs.map(({ graphTitle, metric, subtitle, title: widgetTitle }) => {
          const widgetData = dataMap[metric];
          if (!widgetData) {
            return null;
          }
          const { clusterData, metricChartData, quotaData } = widgetData;
          return (
            <ResourceAllocationWidget
              clusterData={isAllClusters ? clusterData : undefined}
              graphTitle={graphTitle}
              key={metric}
              metric={metric}
              metricChartData={!isAllClusters ? metricChartData : undefined}
              quotaData={isProjectLevel ? quotaData : undefined}
              subtitle={subtitle(metricChartData, t)}
              title={widgetTitle}
            />
          );
        })}
      </OverviewSectionRow>
      {isAllClusters && <ClusterLegend clusters={legendSeries} />}
    </OverviewSection>
  );
};

export default ResourceAllocationSection;
