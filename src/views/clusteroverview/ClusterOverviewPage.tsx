import * as React from 'react';
import { Helmet } from 'react-helmet';

import { useIsAdmin } from '@kubevirt-utils/hooks/useIsAdmin';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { HorizontalNav, NamespaceBar, NavPage } from '@openshift-console/dynamic-plugin-sdk';

import ClusterOverviewPageHeader from './Header/ClusterOverviewPageHeader';
import MigrationsCard from './MonitoringTab/migrations-card/MigrationsCard';
import TopConsumersCard from './MonitoringTab/top-consumers-card/TopConsumersCard';
import OverviewTab from './OverviewTab/OverviewTab';
import SettingsTab from './SettingsTab/SettingsTab';

const ClusterOverviewPage: React.FC = () => {
  const { t } = useKubevirtTranslation();
  const isAdmin = useIsAdmin();

  const overviewTabs: NavPage[] = [
    {
      href: '',
      name: t('Overview'),
      component: OverviewTab,
    },
    {
      href: 'top-consumers',
      name: t('Top consumers'),
      component: TopConsumersCard,
    },
    {
      href: 'migrations',
      name: t('Migrations'),
      component: MigrationsCard,
    },
    {
      href: 'settings',
      name: t('Settings'),
      component: SettingsTab,
    },
  ];

  return (
    <>
      <NamespaceBar />
      <Helmet>
        <title>{t('Virtualization')}</title>
      </Helmet>
      <ClusterOverviewPageHeader />
      {isAdmin ? <HorizontalNav pages={overviewTabs} /> : <OverviewTab />}
    </>
  );
};

export default ClusterOverviewPage;
