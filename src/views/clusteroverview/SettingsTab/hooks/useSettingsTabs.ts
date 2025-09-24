import { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom-v5-compat';

import { useIsAdmin } from '@kubevirt-utils/hooks/useIsAdmin';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';

import { getTabs, SETTINGS_TABS, SETTINGS_TABS_ARRAY } from '../tabs';

export const useSettingsTabs = () => {
  const { t } = useKubevirtTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const isAdmin = useIsAdmin();

  const getActiveTabFromURL = useCallback(() => {
    for (const tab of SETTINGS_TABS_ARRAY) {
      const regex = new RegExp(`/settings/${tab}/?$`);
      if (regex.test(location.pathname)) {
        if (tab === SETTINGS_TABS.CLUSTER && !isAdmin) {
          return SETTINGS_TABS.USER;
        }
        return tab;
      }
    }
    return isAdmin ? SETTINGS_TABS.CLUSTER : SETTINGS_TABS.USER;
  }, [isAdmin, location.pathname]);

  const [activeTab, setActiveTab] = useState<string>(getActiveTabFromURL());

  const tabs = useMemo(() => getTabs(isAdmin, t), [isAdmin, t]);

  const redirectTab = useCallback(
    (name: string) => {
      setActiveTab(name);
      const basePath = location.pathname.replace(/\/settings.*$/, '/settings');
      const redirectPath = `${basePath}/${name}`;
      navigate(redirectPath);
    },
    [location.pathname, navigate],
  );

  useEffect(() => {
    const tabFromURL = getActiveTabFromURL();
    setActiveTab(tabFromURL);
  }, [getActiveTabFromURL]);

  return { activeTab, redirectTab, tabs };
};
