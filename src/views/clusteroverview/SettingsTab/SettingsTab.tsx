import React, { FC } from 'react';

import ConfigurationSearch from '@kubevirt-utils/components/ConfigurationSearch/ConfigurationSearch';
import { Overview } from '@openshift-console/dynamic-plugin-sdk';
import { Card, Tab, Tabs, TabTitleText } from '@patternfly/react-core';

import { useSettingsTabs } from './hooks/useSettingsTabs';
import { createSettingsSearchURL, SEARCH_ITEMS } from './search/search';

import './settings-tab.scss';
import '@kubevirt-utils/styles/cursor.scss';

const SettingsTab: FC = () => {
  const { activeTab, redirectTab, tabs } = useSettingsTabs();

  return (
    <Overview>
      <ConfigurationSearch createSearchURL={createSettingsSearchURL} searchItems={SEARCH_ITEMS} />
      <Card className="settings-tab__card">
        <Tabs activeKey={activeTab} className="settings-tab__menu" isVertical>
          {tabs.map(({ Component, dataTest, name, title }) => (
            <Tab
              eventKey={name}
              key={name}
              onClick={() => redirectTab(name)}
              title={<TabTitleText>{title}</TabTitleText>}
            >
              {activeTab === name && (
                <div className="settings-tab__content" data-test={dataTest}>
                  <Component />
                </div>
              )}
            </Tab>
          ))}
        </Tabs>
      </Card>
    </Overview>
  );
};

export default SettingsTab;
