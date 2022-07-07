import * as React from 'react';
import { Helmet } from 'react-helmet';

import { useIsAdmin } from '@kubevirt-utils/hooks/useIsAdmin';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { HorizontalNav, NavPage } from '@openshift-console/dynamic-plugin-sdk';

import MonitoringTab from './MonitoringTab/MonitoringTab';
import OverviewTab from './OverviewTab/OverviewTab';
import SettingsTab from './SettingsTab/SettingsTab';
import { KUBEVIRT_QUICK_START_USER_SETTINGS_KEY } from './utils/constants';
import PageHeader from './utils/PageHeader';
import RestoreGettingStartedButton from './utils/RestoreGettingStartedButton';

const ClusterOverviewPage: React.FC = () => {
  const { t } = useKubevirtTranslation();
  const title = t('Virtualization');
  const isAdmin = useIsAdmin();
  const badge = (
    <RestoreGettingStartedButton userSettingsKey={KUBEVIRT_QUICK_START_USER_SETTINGS_KEY} />
  );

  const overviewTabs: NavPage[] = [
    {
      href: '',
      name: t('Overview'),
      component: OverviewTab,
    },
    {
      href: 'monitoring',
      name: t('Monitoring'),
      component: MonitoringTab,
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
        <title>{title}</title>
      </Helmet>
      <PageHeader title={title} badge={badge} />
      {isAdmin ? <HorizontalNav pages={overviewTabs} /> : <OverviewTab />}
    </>
  );
};

export default ClusterOverviewPage;
