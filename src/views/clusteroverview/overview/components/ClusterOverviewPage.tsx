import * as React from 'react';
import { Helmet } from 'react-helmet';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Overview, OverviewGrid } from '@openshift-console/dynamic-plugin-sdk';

import DetailsCard from './details-card/DetailsCard';
import GettingStartedCard from './getting-started-card/GettingStartedCard';
import RunningVMsPerTemplateCard from './getting-started-card/running-vms-per-template-card/RunningVMsPerTemplateCard';
import InventoryCard from './inventory-card/InventoryCard';
import PermissionsCard from './permissions-card/PermissionsCard';
import TopConsumersCard from './top-consumers-card/TopConsumersCard';
import PageHeader from './PageHeader';

const leftCards = [{ Card: DetailsCard }, { Card: RunningVMsPerTemplateCard }];
const mainCards = [{ Card: InventoryCard }];
const rightCards = [{ Card: PermissionsCard }];

const ClusterOverviewPage: React.FC = () => {
  const { t } = useKubevirtTranslation();
  const title = t('Virtualization Overview');

  return (
    <>
      <Helmet>
        <title>{title}</title>
      </Helmet>
      <PageHeader title={title} />
      <Overview>
        <GettingStartedCard />
        <OverviewGrid leftCards={leftCards} mainCards={mainCards} rightCards={rightCards} />
        <TopConsumersCard />
      </Overview>
    </>
  );
};

export default ClusterOverviewPage;
