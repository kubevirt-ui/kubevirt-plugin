import { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom-v5-compat';

import { useIsAdmin } from '@kubevirt-utils/hooks/useIsAdmin';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';

import { getTabs } from '../tabs';

export const useSettingsTabs = () => {
  const { t } = useKubevirtTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const isAdmin = useIsAdmin();

  const tabs = useMemo(() => getTabs(isAdmin, t).filter((tab) => tab.isEnabled), [isAdmin, t]);

  const getActiveTabFromURL = useCallback(() => {
    // Check if pathname is exactly /settings (should redirect to first tab)
    const isExactSettingsPath = /\/settings\/?$/.test(location.pathname);
    if (isExactSettingsPath) {
      return null; // Signal that we need to redirect
    }

    // Check if current pathname matches a valid enabled tab
    const matchedTab = tabs.find((tab) => {
      const tabRegex = new RegExp(`/settings/${tab.name}/?$`);
      return tabRegex.test(location.pathname);
    });

    if (matchedTab) {
      return matchedTab.name;
    }

    // Invalid tab path - return null to trigger redirect
    return null;
  }, [location.pathname, tabs]);

  const [activeTab, setActiveTab] = useState<string>(() => {
    const tabFromURL = getActiveTabFromURL();
    return tabFromURL || tabs[0].name;
  });

  const redirectTab = useCallback(
    (name: string, replace = false) => {
      setActiveTab(name);
      const basePath = location.pathname.replace(/\/settings.*$/, '/settings');
      const redirectPath = `${basePath}/${name}`;
      navigate(redirectPath, { replace });
    },
    [location.pathname, navigate],
  );

  useEffect(() => {
    const tabFromURL = getActiveTabFromURL();

    if (tabFromURL) {
      setActiveTab(tabFromURL);
    } else {
      redirectTab(tabs[0].name, true);
    }
  }, [getActiveTabFromURL, redirectTab, tabs]);

  return { activeTab, redirectTab, tabs };
};
