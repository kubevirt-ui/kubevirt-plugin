import React, { FC, useEffect, useState } from 'react';
import { RouteComponentProps } from 'react-router-dom';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { ListPageHeader } from '@openshift-console/dynamic-plugin-sdk';
import { Tab, Tabs, TabTitleText } from '@patternfly/react-core';
import { createURL } from '@virtualmachines/details/tabs/overview/utils/utils';

import CheckupsNetworkList from './network/list/CheckupsNetworkList';
import CheckupsStorageList from './storage/list/CheckupsStorageList';
import { trimLastHistoryPath } from './utils/utils';
import CheckupsRunButton from './CheckupsRunButton';

import './checkups.scss';

const CheckupsList: FC<RouteComponentProps> = ({ history }) => {
  const { t } = useKubevirtTranslation();
  const [activeTabKey, setActiveTabKey] = useState<number | string>(
    history?.location?.pathname.endsWith('storage') ? 1 : 0,
  );

  useEffect(() => {
    history.push(
      createURL(activeTabKey === 0 ? 'network' : 'storage', trimLastHistoryPath(history)),
    );
  }, [activeTabKey, history, history?.location?.pathname]);

  return (
    <>
      <ListPageHeader title={t('Checkups')}>
        <CheckupsRunButton history={history} />
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
          <CheckupsStorageList />
        </Tab>
      </Tabs>
    </>
  );
};

export default CheckupsList;
