import * as React from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { HorizontalNav, NavPage } from '@openshift-console/dynamic-plugin-sdk';

import TopConsumersCard from './top-consumers-card/TopConsumersCard';

const MonitoringTab: React.FC = () => {
  const { t } = useKubevirtTranslation();

  const MonitoringSubTabs: NavPage[] = [
    {
      href: '',
      name: t('Top consumers'),
      component: TopConsumersCard,
    },
  ];
  return <HorizontalNav pages={MonitoringSubTabs} />;
};

export default MonitoringTab;
