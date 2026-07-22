import React, { FC } from 'react';

import { Card, Tab, Tabs, TabTitleText } from '@patternfly/react-core';

import { useSettingsTabs } from './hooks/useSettingsTabs';

import './settings-tab.scss';
import '@kubevirt-utils/styles/cursor.scss';
import classNames from 'classnames';

const SettingsTab: FC = () => {
  const { activeTab, redirectTab, tabs } = useSettingsTabs();

  return (
    <div className="settings-tab__layout">
      <div className="settings-tab__tabs-wrapper">
        <Tabs activeKey={activeTab} className="settings-tab__tabs">
          {tabs.map(({ name, title }) => (
            <Tab
              data-test={`settings-tab-${name}`}
              eventKey={name}
              key={name}
              onClick={() => redirectTab(name)}
              title={<TabTitleText>{title}</TabTitleText>}
            />
          ))}
        </Tabs>
      </div>
      <div className="settings-tab__scrollable">
        <Card className="settings-tab__card">
          {tabs.map(({ Component, dataTest, isFullWidth, name }) =>
            activeTab === name ? (
              <div
                className={classNames('settings-tab__content', {
                  'settings-tab__content--full-width': isFullWidth,
                })}
                data-test={dataTest}
                key={name}
              >
                <Component />
              </div>
            ) : null,
          )}
        </Card>
      </div>
    </div>
  );
};

export default SettingsTab;
