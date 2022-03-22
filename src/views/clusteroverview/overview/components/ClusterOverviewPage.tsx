import * as React from 'react';
import { Helmet } from 'react-helmet';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Overview, OverviewGrid } from '@openshift-console/dynamic-plugin-sdk';

import ActivityCard from './activity-card/ActivityCard';
import DetailsCard from './details-card/DetailsCard';
import GettingStartedCard from './getting-started-card/GettingStartedCard';
import InventoryCard from './inventory-card/InventoryCard';
import PermissionsCard from './permissions-card/PermissionsCard';
import RunningVMsPerTemplateCard from './running-vms-per-template-card/RunningVMsPerTemplateCard';
import StatusCard from './status-card/StatusCard';
import TopConsumersCard from './top-consumers-card/TopConsumersCard';
import { KUBEVIRT_QUICK_START_USER_SETTINGS_KEY } from './utils/constants';
import PageHeader from './utils/PageHeader';
import RestoreGettingStartedButton from './utils/RestoreGettingStartedButton';

const leftCards = [{ Card: DetailsCard }, { Card: RunningVMsPerTemplateCard }];
const mainCards = [{ Card: StatusCard }, { Card: InventoryCard }];
const rightCards = [{ Card: ActivityCard }, { Card: PermissionsCard }];

const ClusterOverviewPage: React.FC = () => {
  const { t } = useKubevirtTranslation();
  const title = t('Virtualization Overview');
  const badge = (
    <RestoreGettingStartedButton userSettingsKey={KUBEVIRT_QUICK_START_USER_SETTINGS_KEY} />
  );

  return (
    <>
      <Helmet>
        <title>{title}</title>
      </Helmet>
      <PageHeader title={title} badge={badge} />
      <Overview>
        <GettingStartedCard />
        <OverviewGrid leftCards={leftCards} mainCards={mainCards} rightCards={rightCards} />
        <TopConsumersCard />
      </Overview>
    </>
  );
};

export default ClusterOverviewPage;
