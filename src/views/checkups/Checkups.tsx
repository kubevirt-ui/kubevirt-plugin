import React, { FC, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom-v5-compat';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import useSetDefaultNonAdminUserProject from '@kubevirt-utils/hooks/useSetDefaultNonAdminUserProject/useSetDefaultNonAdminUserProject';
import { ListPageHeader } from '@openshift-console/dynamic-plugin-sdk';
import { Tab, Tabs, TabTitleText } from '@patternfly/react-core';
import { createURL } from '@virtualmachines/details/tabs/overview/utils/utils';

import CheckupsNetworkList from './network/list/CheckupsNetworkList';
import CheckupsStorageList from './storage/list/CheckupsStorageList';
import { trimLastHistoryPath } from './utils/utils';
import CheckupsRunButton from './CheckupsRunButton';

import './checkups.scss';

const CheckupsList: FC = () => {
  const { t } = useKubevirtTranslation();
  useSetDefaultNonAdminUserProject();
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTabKey, setActiveTabKey] = useState<number | string>(
    location?.pathname.endsWith('storage') ? 1 : 0,
  );

  useEffect(() => {
    navigate(
      createURL(activeTabKey === 0 ? 'network' : 'storage', trimLastHistoryPath(location.pathname)),
    );
  }, [activeTabKey, location.pathname, navigate]);

  return (
    <>
      <ListPageHeader title={t('Checkups')}>
        <CheckupsRunButton />
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
