import * as React from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
// import { NavPage } from '@openshift-console/dynamic-plugin-sdk';
import { Tab, Tabs, TabTitleText } from '@patternfly/react-core';

import MigrationsCard from './migrations-card/MigrationsCard';
import TopConsumersCard from './top-consumers-card/TopConsumersCard';

import './MonitoringTab.scss';

const MonitoringTab: React.FC = () => {
  const { t } = useKubevirtTranslation();
  const [activeKeyTab, setActiveKeyTab] = React.useState('');

  const onSelectActiveKey = (
    event: React.MouseEvent<HTMLElement, MouseEvent>,
    keyValue: string,
  ) => {
    event.preventDefault();
    setActiveKeyTab(keyValue);
  };

  // const MonitoringSubTabs: NavPage[] = [
  //   {
  //     href: '',
  //     name: t('Top consumers'),
  //     component: TopConsumersCard,
  //   },
  //   {
  //     href: 'migrations',
  //     name: t('Migrations'),
  //     component: MigrationsCard,
  //   },
  // ];
  return (
    <Tabs className="kv-sub-tabs" activeKey={activeKeyTab} onSelect={onSelectActiveKey}>
      <Tab
        className="kv-sub-tab-container"
        eventKey=""
        title={
          <TabTitleText
            className={
              activeKeyTab === '' ? 'kv-sub-tab-item kv-sub-tab-item--active' : 'kv-sub-tab-item'
            }
          >
            {t('Top consumers')}
          </TabTitleText>
        }
      >
        <TopConsumersCard />
      </Tab>
      <Tab
        className="kv-sub-tab-container"
        eventKey="migrations"
        title={
          <TabTitleText
            className={
              activeKeyTab === 'migrations'
                ? 'kv-sub-tab-item kv-sub-tab-item--active'
                : 'kv-sub-tab-item'
            }
          >
            {t('Migrations')}
          </TabTitleText>
        }
      >
        <MigrationsCard />
      </Tab>
    </Tabs>
  );
};

export default MonitoringTab;
