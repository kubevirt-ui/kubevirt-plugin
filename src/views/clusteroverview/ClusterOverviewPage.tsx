import React, { FC, useMemo } from 'react';
import { Helmet } from 'react-helmet';

import HorizontalNavbar from '@kubevirt-utils/components/HorizontalNavbar/HorizontalNavbar';
import { NavPageKubevirt } from '@kubevirt-utils/components/HorizontalNavbar/utils/utils';
import { useForceProjectSelection } from '@kubevirt-utils/hooks/useForceProjectSelection';
import { useIsAdmin } from '@kubevirt-utils/hooks/useIsAdmin';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { VIRTUALIZATION_PATHS } from '@virtualmachines/tree/utils/constants';

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

  useForceProjectSelection([VIRTUALIZATION_PATHS.OVERVIEW]);

  const overviewTabs: NavPageKubevirt[] = useMemo(() => {
    const adminPages: NavPageKubevirt[] = [
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
      {
        component: SettingsTab,
        href: 'settings/cluster',
        isHidden: true,
        name: 'settings/cluster',
      },
      {
        component: SettingsTab,
        href: 'settings/user',
        isHidden: true,
        name: 'settings/user',
      },
      {
        component: SettingsTab,
        href: 'settings/features',
        isHidden: true,
        name: 'settings/features',
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
      <HorizontalNavbar loaded={true} pages={overviewTabs} />
      <GuidedTour />
    </>
  );
};

export default ClusterOverviewPage;
