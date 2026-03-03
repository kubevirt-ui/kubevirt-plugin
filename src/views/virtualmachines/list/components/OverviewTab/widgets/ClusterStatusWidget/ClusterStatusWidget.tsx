import React, { FC, useMemo } from 'react';

import DurationOption from '@kubevirt-utils/components/DurationOption/DurationOption';
import useIsAllClustersPage from '@multicluster/hooks/useIsAllClustersPage';
import useMigrationCardDataAndFilters from '@overview/MigrationsTab/hooks/useMigrationCardData';
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
import MigrationsWidget from '../MigrationsWidget/MigrationsWidget';
import OpenShiftVirtualizationWidget from '../OpenShiftVirtualizationWidget/OpenShiftVirtualizationWidget';
import OverviewSection from '../OverviewSection/OverviewSection';
import OverviewSectionRow from '../OverviewSection/OverviewSectionRow';

import ClusterResourcesCard from './components/ClusterResourcesCard/ClusterResourcesCard';
import ClustersLoadBalanceCard from './components/ClustersLoadBalanceCard/ClustersLoadBalanceCard';
import ClustersUtilizationCard from './components/ClustersUtilizationCard/ClustersUtilizationCard';
import NodeLoadDistributionCard from './components/NodeLoadDistributionCard/NodeLoadDistributionCard';
import useClusterUtilizationData from './hooks/useClusterUtilizationData';

const MIGRATIONS_DURATION = DurationOption.ONE_DAY.toString();

const ClusterStatusWidget: FC<OverviewSectionData> = ({ cluster, title, vms }) => {
  const isAllClustersPage = useIsAllClustersPage();
  const { filteredVMIMS, loaded: migrationsLoaded } =
    useMigrationCardDataAndFilters(MIGRATIONS_DURATION);
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
        <OpenShiftVirtualizationWidget cluster={cluster} isAllClustersPage={isAllClustersPage} />
        <ClusterResourcesCard
          clustersCount={clustersWithVMsCount}
          isAllClustersPage={isAllClustersPage}
          projectsCount={namespacesWithVMsCount}
          vmsCount={vms?.length || 0}
        />
        <MigrationsWidget
          isAllClustersPage={isAllClustersPage}
          isLoading={!migrationsLoaded}
          vmims={filteredVMIMS}
        />
      </OverviewSectionRow>
      {isAllClustersPage ? (
        <OverviewSectionRow gridColumns={GRID_TWO_EQUAL}>
          <ClustersUtilizationCard />
          <ClustersLoadBalanceCard />
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
            storageLoad={storageLoad}
          />
          <NodeLoadDistributionCard />
        </OverviewSectionRow>
      )}
    </OverviewSection>
  );
};

export default ClusterStatusWidget;
