import React, { FC, useMemo } from 'react';
import { Helmet } from 'react-helmet';

import { useIsAdmin } from '@kubevirt-utils/hooks/useIsAdmin';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { HorizontalNav, NavPage } from '@openshift-console/dynamic-plugin-sdk';

import GuidedTour from '../../utils/components/GuidedTour/GuidedTour';
import WelcomeModal from '../welcome/WelcomeModal';

import ClusterOverviewPageHeader from './Header/ClusterOverviewPageHeader';
import MigrationsTab from './MigrationsTab/MigrationsTab';
import OverviewTab from './OverviewTab/OverviewTab';
import SettingsTab from './SettingsTab/SettingsTab';
import TopConsumersTab from './TopConsumersTab/TopConsumersTab';

const ClusterOverviewPage: FC = () => {
  const { t } = useKubevirtTranslation();
  const isAdmin = useIsAdmin();
  // useSetDefaultNonAdminUserProject();

  const overviewTabs: NavPage[] = useMemo(() => {
    const adminPages: NavPage[] = [
      {
        component: TopConsumersTab,
        href: 'top-consumers',
        name: t('Top consumers'),
      },
    ];

    return [
      {
        component: OverviewTab,
        href: '',
        name: t('Overview'),
      },
      ...(isAdmin ? [...adminPages] : []),
      {
        component: MigrationsTab,
        href: 'migrations',
        name: t('Migrations'),
      },
      {
        component: SettingsTab,
        href: 'settings',
        name: t('Settings'),
      },
    ];
  }, [isAdmin, t]);

  return (
    <>
      <Helmet>
        <title>{t('Virtualization')}</title>
      </Helmet>
      <WelcomeModal />
      <ClusterOverviewPageHeader />
      <HorizontalNav pages={overviewTabs} />
      <GuidedTour />
    </>
  );
};

export default ClusterOverviewPage;
