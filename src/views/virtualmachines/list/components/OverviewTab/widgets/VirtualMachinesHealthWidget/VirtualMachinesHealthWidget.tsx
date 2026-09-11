import type { FC } from 'react';
import React from 'react';

import useIsAllClustersPage from '@multicluster/hooks/useIsAllClustersPage';

import type { OverviewSectionData } from '../../types';
import { GRID_VM_HEALTH } from '../../types';
import OverviewSection from '../OverviewSection/OverviewSection';
import OverviewSectionRow from '../OverviewSection/OverviewSectionRow';
import GuestAgentIssues from './components/GuestAgentIssues';
import VMAlerts from './components/VMAlerts';
import VMAlertsCard from './components/VMAlertsCard';
import VMStatuses from './components/VMStatuses';
import useVMAlertsNavigation from './hooks/useVMAlertsNavigation';

const VirtualMachinesHealthWidget: FC<OverviewSectionData> = ({
  cluster,
  metricsUnavailable,
  title,
  vmNames,
  vms,
}) => {
  const isAllClustersPage = useIsAllClustersPage();
  const { alertsBaseHref, alertsBasePath } = useVMAlertsNavigation(cluster);

  return (
    <OverviewSection dataTestId="vm-health-widget" title={title}>
      <OverviewSectionRow
        className="overview-section__row--single-column-medium"
        gridColumns={GRID_VM_HEALTH}
      >
        {metricsUnavailable ? (
          <VMAlertsCard alertsBaseHref={alertsBaseHref} alertsBasePath={alertsBasePath} />
        ) : (
          <VMAlerts
            alertsBaseHref={alertsBaseHref}
            alertsBasePath={alertsBasePath}
            vmNames={vmNames}
          />
        )}
        {!isAllClustersPage && (
          <>
            <VMStatuses vms={vms} />
            <GuestAgentIssues vms={vms} />
          </>
        )}
      </OverviewSectionRow>
    </OverviewSection>
  );
};

export default VirtualMachinesHealthWidget;
