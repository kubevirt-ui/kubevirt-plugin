import { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router';

import { VIRTUALIZATION_PATHS } from '@kubevirt-utils/constants/constants';
import useCanManageClusterSettings from '@kubevirt-utils/hooks/useCanManageClusterSettings';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';

import { getTabs, type SettingsTabConfig } from '../tabs';

import { useSettingsCluster } from '../context/SettingsClusterContext';

export const useSettingsTabs = (): {
  activeTab: string;
  redirectTab: (name: string, replace?: boolean) => void;
  tabs: SettingsTabConfig[];
} => {
  const { t } = useKubevirtTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const settingsCluster = useSettingsCluster();
  const [canManageClusterSettings, canManageClusterSettingsLoading] =
    useCanManageClusterSettings(settingsCluster);

  const tabs = useMemo(
    () => getTabs(canManageClusterSettings, t).filter((tab) => tab.isEnabled),
    [canManageClusterSettings, t],
  );

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
    return tabFromURL ?? tabs[0]?.name ?? '';
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
    if (canManageClusterSettingsLoading) {
      return;
    }

    const defaultTabName = tabs[0]?.name;
    if (!defaultTabName) {
      return;
    }

    const tabFromURL = getActiveTabFromURL();
    const enabledUrlTab = tabs.find((tab) => tab.name === tabFromURL)?.name;

    if (enabledUrlTab) {
      setActiveTab(enabledUrlTab);
      return;
    }

    redirectTab(defaultTabName, true);
  }, [canManageClusterSettingsLoading, getActiveTabFromURL, redirectTab, tabs]);

  return { activeTab, redirectTab, tabs };
};
