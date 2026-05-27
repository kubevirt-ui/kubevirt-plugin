import React, { FC, useMemo, useState } from 'react';

import MutedTextSpan from '@kubevirt-utils/components/MutedTextSpan/MutedTextSpan';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getNoDataAvailableMessage } from '@kubevirt-utils/utils/utils';
import useIsAllClustersPage from '@multicluster/hooks/useIsAllClustersPage';
import { METRICS } from '@overview/OverviewTab/metric-charts-card/utils/constants';
import useMetricChartData from '@overview/OverviewTab/metric-charts-card/utils/hooks/useMetricChartData';
import { Bullseye, Card, CardBody } from '@patternfly/react-core';

import { determineOverviewLevel } from '../../../../config';
import { GRID_FOUR_EQUAL, OVERVIEW_LEVEL_NAMESPACE, OverviewSectionData } from '../../../../types';
import OverviewSection from '../../../OverviewSection/OverviewSection';
import OverviewSectionRow from '../../../OverviewSection/OverviewSectionRow';
import useNamespaceResourceQuota from '../../hooks/useNamespaceResourceQuota';
import { useTopClusterNames, useTopClustersChartData } from '../../hooks/useTopClustersChartData';
import ResourceAllocationWidget from '../../ResourceAllocationWidget';
import ClusterLegend from '../ResourceAllocationChart/ClusterLegend';
import ResourceAllocationSubHeader from '../ResourceAllocationSubHeader/ResourceAllocationSubHeader';

import { getWidgetConfigs, WidgetDataMap } from './resourceAllocationSectionConfig';

const ResourceAllocationSection: FC<OverviewSectionData> = ({
  metricsUnavailable,
  namespace,
  title,
  vmNames,
}) => {
  const { t } = useKubevirtTranslation();
  const isAllClusters = useIsAllClustersPage();
  const isNamespaceLevel =
    determineOverviewLevel(namespace, isAllClusters) === OVERVIEW_LEVEL_NAMESPACE;
  const widgetConfigs = getWidgetConfigs(t);
  const [selectedMetric, setSelectedMetric] = useState<string>(widgetConfigs[0].metric);

  const runningVmData = useMetricChartData(METRICS.RUNNING_VMS, vmNames);
  const cpuData = useMetricChartData(METRICS.VCPU_USAGE, vmNames);
  const memoryData = useMetricChartData(METRICS.MEMORY, vmNames);
  const storageData = useMetricChartData(METRICS.STORAGE, vmNames);

  const { namespaceQuota } = useNamespaceResourceQuota(namespace);

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
        quotaData: namespaceQuota?.memory,
      },
      [METRICS.RUNNING_VMS]: {
        clusterData: vmClusterData,
        metricChartData: runningVmData,
        quotaData: namespaceQuota?.vms,
      },
      [METRICS.STORAGE]: {
        clusterData: storageClusterData,
        metricChartData: storageData,
        quotaData: namespaceQuota?.storage,
      },
      [METRICS.VCPU_USAGE]: {
        clusterData: cpuClusterData,
        metricChartData: cpuData,
        quotaData: namespaceQuota?.cpu,
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
      namespaceQuota,
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

  if (metricsUnavailable) {
    return (
      <OverviewSection dataTestId="resource-allocation-section" title={title}>
        <Card isCompact>
          <CardBody className="pf-v6-u-pb-lg">
            <Bullseye>
              <MutedTextSpan text={getNoDataAvailableMessage(t)} />
            </Bullseye>
          </CardBody>
        </Card>
      </OverviewSection>
    );
  }

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
              quotaData={isNamespaceLevel ? quotaData : undefined}
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
