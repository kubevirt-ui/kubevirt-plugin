import React, { FC, MouseEvent, useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom-v5-compat';

import { PageTitles } from '@kubevirt-utils/constants/page-constants';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { DocumentTitle, ListPageHeader } from '@openshift-console/dynamic-plugin-sdk';
import { Tab, Tabs, TabTitleText } from '@patternfly/react-core';
import { createURL } from '@virtualmachines/details/tabs/overview/utils/utils';

import { getCheckUpTabs } from './utils/getCheckUpsTabs';
import { trimLastHistoryPath } from './utils/utils';
import CheckupsRunButton from './CheckupsRunButton';

import './checkups.scss';

const CheckupsList: FC = () => {
  const { t } = useKubevirtTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  const tabs = useMemo(() => getCheckUpTabs(t), [t]);

  const getInitialTabKey = () => {
    const currentPath = location?.pathname;
    const activeTab = tabs.find((tab) => currentPath.includes(`/${tab.url}`));
    return activeTab?.eventKey ?? 0;
  };

  const [activeTabKey, setActiveTabKey] = useState<number | string>(getInitialTabKey);

  useEffect(() => {
    const selectedTab = tabs.find((tab) => tab.eventKey === activeTabKey);
    if (selectedTab) {
      navigate(createURL(selectedTab.url, trimLastHistoryPath(location.pathname)));
    }
  }, [activeTabKey, tabs, navigate, location.pathname]);

  return (
    <>
      <DocumentTitle>{PageTitles.Checkups}</DocumentTitle>
      <ListPageHeader title={PageTitles.Checkups}>
        <CheckupsRunButton />
      </ListPageHeader>
      <Tabs
        onSelect={(_: MouseEvent, tabIndex: number | string) => {
          setActiveTabKey(tabIndex);
        }}
        activeKey={activeTabKey}
        className="co-horizontal-nav"
      >
        {tabs.map(({ component, eventKey, title }) => (
          <Tab eventKey={eventKey} key={eventKey} title={<TabTitleText>{title}</TabTitleText>}>
            {activeTabKey === eventKey && component}
          </Tab>
        ))}
      </Tabs>
    </>
  );
};

export default CheckupsList;
