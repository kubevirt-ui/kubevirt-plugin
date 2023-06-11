import React, { FC, useState } from 'react';
import { Helmet } from 'react-helmet';

import { useIsAdmin } from '@kubevirt-utils/hooks/useIsAdmin';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import useKubevirtUserSettings from '@kubevirt-utils/hooks/useKubevirtUserSettings/useKubevirtUserSettings';
import { HorizontalNav, NavPage } from '@openshift-console/dynamic-plugin-sdk';

import WelcomeModal from '../welcome/WelcomeModal';

import ClusterOverviewPageHeader from './Header/ClusterOverviewPageHeader';
import MigrationsTab from './MigrationsTab/MigrationsTab';
import OverviewTab from './OverviewTab/OverviewTab';
import SettingsTab from './SettingsTab/SettingsTab';
import TopConsumersTab from './TopConsumersTab/TopConsumersTab';

const ClusterOverviewPage: FC = () => {
  const { t } = useKubevirtTranslation();
  const isAdmin = useIsAdmin();
  const [quickStarts, , loaded] = useKubevirtUserSettings('quickStart');
  const [isOpen, setIsOpen] = useState<boolean>(true);

  const overviewTabs: NavPage[] = [
    {
      component: OverviewTab,
      href: '',
      name: t('Overview'),
    },
    {
      component: TopConsumersTab,
      href: 'top-consumers',
      name: t('Top consumers'),
    },
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

  return (
    <>
      <Helmet>
        <title>{t('Virtualization')}</title>
      </Helmet>
      {loaded && !quickStarts?.dontShowWelcomeModal && (
        <WelcomeModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
      )}
      <ClusterOverviewPageHeader />
      {isAdmin ? <HorizontalNav pages={overviewTabs} /> : <OverviewTab />}
    </>
  );
};

export default ClusterOverviewPage;
