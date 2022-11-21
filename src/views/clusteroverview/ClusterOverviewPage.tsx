import * as React from 'react';
import { Helmet } from 'react-helmet';

import { useIsAdmin } from '@kubevirt-utils/hooks/useIsAdmin';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { HorizontalNav, NavPage } from '@openshift-console/dynamic-plugin-sdk';

import ClusterOverviewPageHeader from './Header/ClusterOverviewPageHeader';
import MigrationsTab from './MigrationsTab/MigrationsTab';
import OverviewTab from './OverviewTab/OverviewTab';
import SettingsTab from './SettingsTab/SettingsTab';
import TopConsumersTab from './TopConsumersTab/TopConsumersTab';

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
      component: TopConsumersTab,
    },
    {
      href: 'migrations',
      name: t('Migrations'),
      component: MigrationsTab,
    },
    {
      href: 'settings',
      name: t('Settings'),
      component: SettingsTab,
    },
  ];

  return (
    <>
      <Helmet>
        <title>{t('Virtualization')}</title>
      </Helmet>
      <ClusterOverviewPageHeader />
      {isAdmin ? <HorizontalNav pages={overviewTabs} /> : <OverviewTab />}
    </>
  );
};

export default ClusterOverviewPage;
