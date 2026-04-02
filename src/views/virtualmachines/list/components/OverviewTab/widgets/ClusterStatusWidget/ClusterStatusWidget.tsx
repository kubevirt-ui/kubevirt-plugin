import React, { FC, useMemo } from 'react';

import useIsAllClustersPage from '@multicluster/hooks/useIsAllClustersPage';
import {
  getClustersWithVMsCount,
  getNamespacesWithVMsCount,
} from '@virtualmachines/list/utils/utils';

import {
  GRID_NARROW_WIDE,
  GRID_THREE_EQUAL,
  GRID_TWO_EQUAL,
  OverviewSectionData,
} from '../../types';
import ClusterUtilizationWidget from '../ClusterUtilizationWidget/ClusterUtilizationWidget';
import OpenShiftVirtualizationWidget from '../OpenShiftVirtualizationWidget/OpenShiftVirtualizationWidget';
import OverviewSection from '../OverviewSection/OverviewSection';
import OverviewSectionRow from '../OverviewSection/OverviewSectionRow';

import ClusterResourcesCard from './components/ClusterResourcesCard/ClusterResourcesCard';
import ClustersLoadBalanceCard from './components/ClustersLoadBalanceCard/ClustersLoadBalanceCard';
import ClustersUtilizationCard from './components/ClustersUtilizationCard/ClustersUtilizationCard';
import NodeLoadDistributionCard from './components/NodeLoadDistributionCard/NodeLoadDistributionCard';
import useClusterUtilizationData from './hooks/useClusterUtilizationData';

const ClusterStatusWidget: FC<OverviewSectionData> = ({
  cluster,
  metricsUnavailable,
  title,
  vms,
}) => {
  const isAllClustersPage = useIsAllClustersPage();
  const {
    cpuLoad,
    loaded: utilizationLoaded,
    memoryLoad,
    storageLoad,
  } = useClusterUtilizationData();

  const clustersWithVMsCount = useMemo(() => getClustersWithVMsCount(vms), [vms]);
  const namespacesWithVMsCount = useMemo(
    () => getNamespacesWithVMsCount(vms, isAllClustersPage),
    [vms, isAllClustersPage],
  );

  return (
    <OverviewSection dataTestId="cluster-status-widget" title={title}>
      <OverviewSectionRow gridColumns={GRID_THREE_EQUAL}>
        <OpenShiftVirtualizationWidget
          cluster={cluster}
          isAllClustersPage={isAllClustersPage}
          metricsUnavailable={metricsUnavailable}
        />
        <ClusterResourcesCard
          clustersCount={clustersWithVMsCount}
          isAllClustersPage={isAllClustersPage}
          projectsCount={namespacesWithVMsCount}
          vmsCount={vms?.length || 0}
        />
      </OverviewSectionRow>
      {isAllClustersPage ? (
        <OverviewSectionRow gridColumns={GRID_TWO_EQUAL}>
          <ClustersUtilizationCard metricsUnavailable={metricsUnavailable} />
          <ClustersLoadBalanceCard metricsUnavailable={metricsUnavailable} />
        </OverviewSectionRow>
      ) : (
        <OverviewSectionRow
          className="overview-section__row--single-column-wide"
          gridColumns={GRID_NARROW_WIDE}
        >
          <ClusterUtilizationWidget
            cpuLoad={cpuLoad}
            isLoading={!utilizationLoaded}
            memoryLoad={memoryLoad}
            metricsUnavailable={metricsUnavailable}
            storageLoad={storageLoad}
          />
          <NodeLoadDistributionCard cluster={cluster} metricsUnavailable={metricsUnavailable} />
        </OverviewSectionRow>
      )}
    </OverviewSection>
  );
};

export default ClusterStatusWidget;
