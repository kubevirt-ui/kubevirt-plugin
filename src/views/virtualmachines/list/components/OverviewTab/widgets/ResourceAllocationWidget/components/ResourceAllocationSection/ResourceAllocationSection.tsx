import React, { FC, useMemo, useState } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import useIsAllClustersPage from '@multicluster/hooks/useIsAllClustersPage';
import { METRICS } from '@overview/OverviewTab/metric-charts-card/utils/constants';
import useMetricChartData from '@overview/OverviewTab/metric-charts-card/utils/hooks/useMetricChartData';

import { determineOverviewLevel } from '../../../../config';
import { GRID_FOUR_EQUAL, OVERVIEW_LEVEL_PROJECT, OverviewSectionData } from '../../../../types';
import OverviewSection from '../../../OverviewSection/OverviewSection';
import OverviewSectionRow from '../../../OverviewSection/OverviewSectionRow';
import useProjectResourceQuota from '../../hooks/useProjectResourceQuota';
import { useTopClusterNames, useTopClustersChartData } from '../../hooks/useTopClustersChartData';
import ResourceAllocationWidget from '../../ResourceAllocationWidget';
import ClusterLegend from '../ResourceAllocationChart/ClusterLegend';
import ResourceAllocationSubHeader from '../ResourceAllocationSubHeader/ResourceAllocationSubHeader';

import { getWidgetConfigs, WidgetDataMap } from './resourceAllocationSectionConfig';

const ResourceAllocationSection: FC<OverviewSectionData> = ({ namespace, title }) => {
  const { t } = useKubevirtTranslation();
  const isAllClusters = useIsAllClustersPage();
  const isProjectLevel =
    determineOverviewLevel(namespace, isAllClusters) === OVERVIEW_LEVEL_PROJECT;
  const widgetConfigs = getWidgetConfigs(t);
  const [selectedMetric, setSelectedMetric] = useState<string>(widgetConfigs[0].metric);

  const runningVmData = useMetricChartData(METRICS.RUNNING_VMS);
  const cpuData = useMetricChartData(METRICS.VCPU_USAGE);
  const memoryData = useMetricChartData(METRICS.MEMORY);
  const storageData = useMetricChartData(METRICS.STORAGE);

  const { projectQuota } = useProjectResourceQuota(namespace);

  const { topClusterNames } = useTopClusterNames(selectedMetric, isAllClusters);
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

  const dataMap: WidgetDataMap = useMemo(
    () => ({
      [METRICS.MEMORY]: {
        clusterData: memClusterData,
        metricChartData: memoryData,
        quotaData: projectQuota?.memory,
      },
      [METRICS.RUNNING_VMS]: {
        clusterData: vmClusterData,
        metricChartData: runningVmData,
        quotaData: projectQuota?.vms,
      },
      [METRICS.STORAGE]: {
        clusterData: storageClusterData,
        metricChartData: storageData,
        quotaData: projectQuota?.storage,
      },
      [METRICS.VCPU_USAGE]: {
        clusterData: cpuClusterData,
        metricChartData: cpuData,
        quotaData: projectQuota?.cpu,
      },
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

  const subHeader = (
    <ResourceAllocationSubHeader
      isAllClusters={isAllClusters}
      onDropdownChange={setSelectedMetric}
      selectedMetric={selectedMetric}
      topClusterCount={topClusterNames.length}
      widgetConfigs={widgetConfigs}
    />
  );

  return (
    <OverviewSection dataTestId="resource-allocation-section" subHeader={subHeader} title={title}>
      <OverviewSectionRow gridColumns={GRID_FOUR_EQUAL}>
        {widgetConfigs.map(({ graphTitle, metric, subtitle, title: widgetTitle }) => {
          const { clusterData, metricChartData, quotaData } = dataMap[metric];
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
