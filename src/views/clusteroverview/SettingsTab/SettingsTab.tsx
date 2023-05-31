import * as React from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Overview } from '@openshift-console/dynamic-plugin-sdk';
import { Alert, Card, Tab, Tabs, TabTitleText } from '@patternfly/react-core';

import ClusterTab from './ClusterTab/ClusterTab';
import GeneralTab from './GeneralTab/GeneralTab';
import PermissionsTab from './PermissionsTab/PermissionsTab';

import './settings-tab.scss';

const SettingsTab: React.FC = () => {
  const { t } = useKubevirtTranslation();
  const [activeTab, setActiveTab] = React.useState<number>(0);
  return (
    <Overview>
      <Alert
        variant="info"
        isInline
        className="settings-tab__scope-message"
        title={t('All settings are effective across the entire cluster.')}
      />
      <Card className="settings-tab__card">
        <Tabs
          activeKey={activeTab}
          onSelect={(_, activeKey) => setActiveTab(+activeKey)}
          isVertical
          className="settings-tab__menu"
        >
          <Tab eventKey={0} title={<TabTitleText>{t('General')}</TabTitleText>}>
            <div className="settings-tab__content">
              <GeneralTab />
            </div>
          </Tab>
          <Tab eventKey={1} title={<TabTitleText>{t('Cluster settings')}</TabTitleText>}>
            <div className="settings-tab__content">
              <ClusterTab />
            </div>
          </Tab>
          <Tab eventKey={2} title={<TabTitleText>{t('User permissions')}</TabTitleText>}>
            <div className="settings-tab__content">
              <PermissionsTab />
            </div>
          </Tab>
        </Tabs>
      </Card>
    </Overview>
  );
};

export default SettingsTab;
