import React, { FC, useState } from 'react';
import { RouteComponentProps } from 'react-router-dom';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { ListPageHeader } from '@openshift-console/dynamic-plugin-sdk';
import { Tab, Tabs, TabTitleText } from '@patternfly/react-core';

import CheckupsNetworkList from './network/list/CheckupsNetworkList';
import CheckupsRunButton from './CheckupsRunButton';

import './checkups.scss';

const CheckupsList: FC<RouteComponentProps> = (props) => {
  const { t } = useKubevirtTranslation();
  const [activeTabKey, setActiveTabKey] = useState<number | string>(0);

  return (
    <>
      <ListPageHeader title={t('Checkups')}>
        <CheckupsRunButton {...props} />
      </ListPageHeader>
      <Tabs
        onSelect={(_, tabIndex: number | string) => {
          setActiveTabKey(tabIndex);
        }}
        activeKey={activeTabKey}
      >
        <Tab eventKey={0} title={<TabTitleText>{t('Network latency')}</TabTitleText>}>
          <CheckupsNetworkList />
        </Tab>
        <Tab eventKey={1} title={<TabTitleText>{t('Storage')}</TabTitleText>}>
          Place holder
        </Tab>
      </Tabs>
    </>
  );
};

export default CheckupsList;
