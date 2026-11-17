import { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router';

import useCanManageClusterSettings from '@kubevirt-utils/hooks/useCanManageClusterSettings';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';

import { getTabs, type SettingsTabConfig } from '../tabs';

import { useSettingsCluster } from '../context/SettingsClusterContext';
import { buildSettingsTabPath, getSettingsTabFromPathname } from '../utils/settingsTabPaths';

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

  const getActiveTabFromURL = useCallback(
    () =>
      getSettingsTabFromPathname(
        location.pathname,
        tabs.map((tab) => tab.name),
      ),
    [location.pathname, tabs],
  );

  const [activeTab, setActiveTab] = useState<string>(() => {
    const tabFromURL = getActiveTabFromURL();
    return tabFromURL ?? tabs[0]?.name ?? '';
  });

  const redirectTab = useCallback(
    (name: string, replace = false) => {
      setActiveTab(name);
      navigate(buildSettingsTabPath(location.pathname, name), { replace });
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
