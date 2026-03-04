import React, { FC } from 'react';

import useIsAllClustersPage from '@multicluster/hooks/useIsAllClustersPage';

import { GRID_VM_HEALTH, OverviewSectionData } from '../../types';
import OverviewSection from '../OverviewSection/OverviewSection';
import OverviewSectionRow from '../OverviewSection/OverviewSectionRow';

import GuestAgentIssues from './components/GuestAgentIssues';
import VMAlerts from './components/VMAlerts';
import VMStatuses from './components/VMStatuses';

const VirtualMachinesHealthWidget: FC<OverviewSectionData> = ({ title, vmis, vms }) => {
  const isAllClustersPage = useIsAllClustersPage();

  return (
    <OverviewSection dataTestId="vm-health-widget" title={title}>
      {/* TODO CNV-78882: pass onViewAll to VMAlerts once alerts navigation is implemented */}
      <OverviewSectionRow gridColumns={GRID_VM_HEALTH}>
        <VMAlerts />
        {!isAllClustersPage && (
          <>
            <VMStatuses vms={vms} />
            <GuestAgentIssues vmis={vmis} vms={vms} />
          </>
        )}
      </OverviewSectionRow>
    </OverviewSection>
  );
};

export default VirtualMachinesHealthWidget;
