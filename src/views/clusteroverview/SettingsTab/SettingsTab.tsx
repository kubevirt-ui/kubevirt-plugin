import * as React from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Overview } from '@openshift-console/dynamic-plugin-sdk';
import { Alert, Card, Tab, Tabs, TabTitleText } from '@patternfly/react-core';

import ClusterTab from './ClusterTab/ClusterTab';
import PermissionsTab from './PermissionsTab/PermissionsTab';

import './settings-tab.scss';

const SettingsTab: React.FC = () => {
  const { t } = useKubevirtTranslation();
  const [activeTab, setActiveTab] = React.useState<number>(0);
  return (
    <Overview>
      <Alert
        className="settings-tab__scope-message"
        isInline
        title={t('All settings are effective across the entire cluster.')}
        variant="info"
      />
      <Card className="settings-tab__card">
        <Tabs
          activeKey={activeTab}
          className="settings-tab__menu"
          isVertical
          onSelect={(_, activeKey) => setActiveTab(+activeKey)}
        >
          <Tab eventKey={0} title={<TabTitleText>{t('Cluster')}</TabTitleText>}>
            <div className="settings-tab__content">
              <ClusterTab />
            </div>
          </Tab>
          <Tab eventKey={1} title={<TabTitleText>{t('User')}</TabTitleText>}>
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
