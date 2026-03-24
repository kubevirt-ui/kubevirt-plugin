import React, { FC } from 'react';

import useIsAllClustersPage from '@multicluster/hooks/useIsAllClustersPage';

import { GRID_VM_HEALTH, OverviewSectionData } from '../../types';
import OverviewSection from '../OverviewSection/OverviewSection';
import OverviewSectionRow from '../OverviewSection/OverviewSectionRow';

import GuestAgentIssues from './components/GuestAgentIssues';
import VMAlerts from './components/VMAlerts';
import VMStatuses from './components/VMStatuses';
import useVMAlertsNavigation from './hooks/useVMAlertsNavigation';

const VirtualMachinesHealthWidget: FC<OverviewSectionData> = ({ cluster, title, vms }) => {
  const isAllClustersPage = useIsAllClustersPage();
  const { alertsBaseHref, alertsBasePath } = useVMAlertsNavigation(cluster);

  return (
    <OverviewSection dataTestId="vm-health-widget" title={title}>
      <OverviewSectionRow gridColumns={GRID_VM_HEALTH}>
        <VMAlerts alertsBaseHref={alertsBaseHref} alertsBasePath={alertsBasePath} />
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
