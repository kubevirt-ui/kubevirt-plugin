import React, { FC, useState } from 'react';

import { useIsAdmin } from '@kubevirt-utils/hooks/useIsAdmin';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Overview } from '@openshift-console/dynamic-plugin-sdk';
import { Card, Tab, Tabs, TabTitleText } from '@patternfly/react-core';

import ClusterTab from './ClusterTab/ClusterTab';
import UserTab from './UserTab/UserTab';

import './settings-tab.scss';

const SettingsTab: FC = () => {
  const { t } = useKubevirtTranslation();
  const isAdmin = useIsAdmin();
  const [activeTab, setActiveTab] = useState<number>(isAdmin ? 0 : 1);

  return (
    <Overview>
      <Card className="settings-tab__card">
        <Tabs
          activeKey={activeTab}
          className="settings-tab__menu"
          isVertical
          onSelect={(_, activeKey) => setActiveTab(+activeKey)}
        >
          {isAdmin && (
            <Tab eventKey={0} title={<TabTitleText>{t('Cluster')}</TabTitleText>}>
              <div className="settings-tab__content">
                <ClusterTab />
              </div>
            </Tab>
          )}
          <Tab eventKey={1} title={<TabTitleText>{t('User')}</TabTitleText>}>
            <div className="settings-tab__content">
              <UserTab />
            </div>
          </Tab>
          {/*<Tab eventKey={2} title={<TabTitleText>{t('Preview features')}</TabTitleText>}>*/}
          {/*  <div className="settings-tab__content">*/}
          {/*    <PreviewFeaturesTab />*/}
          {/*  </div>*/}
          {/*</Tab>*/}
        </Tabs>
      </Card>
    </Overview>
  );
};

export default SettingsTab;
