import * as React from 'react';

import { Overview, OverviewGrid } from '@openshift-console/dynamic-plugin-sdk';

import ActivityCard from './activity-card/ActivityCard';
import GettingStartedCard from './getting-started-card/GettingStartedCard';
import InventoryCard from './inventory-card/InventoryCard';
import PermissionsCard from './permissions-card/PermissionsCard';
import RunningVMsPerTemplateCard from './running-vms-per-template-card/RunningVMsPerTemplateCard';
import StatusCard from './status-card/StatusCard';

const leftCards = [{ Card: RunningVMsPerTemplateCard }];
const mainCards = [{ Card: StatusCard }, { Card: InventoryCard }];
const rightCards = [{ Card: ActivityCard }, { Card: PermissionsCard }];

const OverviewTab: React.FC = () => {
  return (
    <Overview>
      <GettingStartedCard />
      <OverviewGrid leftCards={leftCards} mainCards={mainCards} rightCards={rightCards} />
    </Overview>
  );
};

export default OverviewTab;
