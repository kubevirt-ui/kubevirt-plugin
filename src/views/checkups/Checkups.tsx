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

  // Normalize path by removing trailing slash for comparison
  const normalizePath = (path: string): string => {
    return path.endsWith('/') ? path.slice(0, -1) : path;
  };

  // Extract the base checkups path by removing any tab URL segments
  const getBaseCheckupsPath = (path: string): string => {
    const normalized = normalizePath(path);
    // Remove any tab URLs from the path
    for (const tab of tabs) {
      const tabPattern = `/${tab.url}`;
      if (normalized.includes(tabPattern)) {
        // Remove the tab URL and everything after it
        const index = normalized.indexOf(tabPattern);
        return normalized.substring(0, index);
      }
    }
    // If no tab found, use trimLastHistoryPath as fallback
    return trimLastHistoryPath(path);
  };

  // Check if path is exactly the checkups base path (no tab selected)
  const isBaseCheckupsPath = (path: string): boolean => {
    const normalized = normalizePath(path);
    return (
      normalized.endsWith('/checkups') && !tabs.some((tab) => normalized.includes(`/${tab.url}`))
    );
  };

  const getInitialTabKey = () => {
    const currentPath = normalizePath(location?.pathname || '');
    if (isBaseCheckupsPath(currentPath)) {
      return 0; // Default to network latency tab
    }
    const activeTab = tabs.find((tab) => currentPath.includes(`/${tab.url}`));
    return activeTab?.eventKey ?? 0;
  };

  const [activeTabKey, setActiveTabKey] = useState<number | string>(() => getInitialTabKey());

  // Sync activeTabKey from URL (external navigation: back/forward, deep links)
  // Also redirect to default tab if URL is just /checkups
  useEffect(() => {
    const currentPath = normalizePath(location.pathname);

    // If we're at the base checkups path, redirect to default tab
    if (isBaseCheckupsPath(currentPath)) {
      const defaultTab = tabs[0]; // Network latency (eventKey 0)
      if (defaultTab) {
        const basePath = normalizePath(getBaseCheckupsPath(location.pathname));
        const targetUrl = normalizePath(createURL(defaultTab.url, basePath));
        navigate(targetUrl, { replace: true });
        setActiveTabKey(defaultTab.eventKey);
      }
      return;
    }

    // Otherwise, sync activeTabKey from URL
    const foundTab = tabs.find((tab) => currentPath.includes(`/${tab.url}`));
    const newTabKey = foundTab?.eventKey ?? 0;
    // Use functional updater to avoid stale closure issues
    setActiveTabKey((prev) => (prev === newTabKey ? prev : newTabKey));
  }, [location.pathname, tabs]);

  const handleTabSelect = (_: MouseEvent, tabIndex: number | string) => {
    const selectedTab = tabs.find((tab) => tab.eventKey === tabIndex);
    if (selectedTab) {
      setActiveTabKey(tabIndex);
      const basePath = normalizePath(getBaseCheckupsPath(location.pathname));
      const targetUrl = createURL(selectedTab.url, basePath);
      navigate(normalizePath(targetUrl));
    }
  };

  return (
    <>
      <DocumentTitle>{PageTitles.Checkups}</DocumentTitle>
      <ListPageHeader title={PageTitles.Checkups}>
        <CheckupsRunButton />
      </ListPageHeader>
      <Tabs activeKey={activeTabKey} className="co-horizontal-nav" onSelect={handleTabSelect}>
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
