import { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom-v5-compat';

import { VIRTUALIZATION_PATHS } from '@kubevirt-utils/constants/constants';
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
    const settingsPath = VIRTUALIZATION_PATHS.SETTINGS;
    const isExactSettingsPath = new RegExp(`/${settingsPath}/?$`).test(location.pathname);
    if (isExactSettingsPath) {
      return null;
    }

    const matchedTab = tabs.find((tab) => {
      const tabRegex = new RegExp(`/${settingsPath}/${tab.name}/?$`);
      return tabRegex.test(location.pathname);
    });

    if (matchedTab) {
      return matchedTab.name;
    }

    return null;
  }, [location.pathname, tabs]);

  const [activeTab, setActiveTab] = useState<string>(() => {
    const tabFromURL = getActiveTabFromURL();
    return tabFromURL || tabs[0]?.name || '';
  });

  const redirectTab = useCallback(
    (name: string, replace = false) => {
      setActiveTab(name);
      const settingsPath = VIRTUALIZATION_PATHS.SETTINGS;
      const basePath = location.pathname.replace(
        new RegExp(`/${settingsPath}.*$`),
        `/${settingsPath}`,
      );
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
      redirectTab(tabs[0]?.name, true);
    }
  }, [getActiveTabFromURL, redirectTab, tabs]);

  return { activeTab, redirectTab, tabs };
};
