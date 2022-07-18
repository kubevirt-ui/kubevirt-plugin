import * as React from 'react';
import classNames from 'classnames';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Tab, Tabs, TabTitleText } from '@patternfly/react-core';

import MigrationsCard from './migrations-card/MigrationsCard';
import TopConsumersCard from './top-consumers-card/TopConsumersCard';

import './MonitoringTab.scss';

const MonitoringTab: React.FC = () => {
  const { t } = useKubevirtTranslation();
  const [activeKeyTab, setActiveKeyTab] = React.useState<string>('');

  const onSelectActiveKey = (
    event: React.MouseEvent<HTMLElement, MouseEvent>,
    keyValue: string,
  ) => {
    event.preventDefault();
    setActiveKeyTab(keyValue);
  };

  return (
    <Tabs className="kv-sub-tabs" activeKey={activeKeyTab} onSelect={onSelectActiveKey}>
      <Tab
        className="kv-sub-tab-container"
        eventKey=""
        title={
          <TabTitleText
            className={classNames('kv-sub-tab-item', {
              'kv-sub-tab-item--active': activeKeyTab === '',
            })}
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
            className={classNames('kv-sub-tab-item', {
              'kv-sub-tab-item--active': activeKeyTab === 'migrations',
            })}
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
