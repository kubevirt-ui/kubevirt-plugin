import { useEffect, useRef, useState } from 'react';

import useKubevirtUserSettings from '@kubevirt-utils/hooks/useKubevirtUserSettings/useKubevirtUserSettings';
import { USER_SETTINGS_KEYS } from '@kubevirt-utils/hooks/useKubevirtUserSettings/utils/const';
import { useSignals } from '@preact/signals-react/runtime';

import { AUTO_HIDE_NAV_DEFAULT, userExpandedNavSignal } from './constants';
import { collapseSidebar, expandSidebar, getNavToggleButton, isSidebarOpen } from './utils';

/**
 * Auto-hides the console left nav on all VirtualMachine pages.
 * The hamburger override persists only while the user stays within VirtualMachines pages;
 * navigating away and back resets the override so the nav auto-collapses again.
 * Returns whether the sidebar was auto-collapsed (for notification display).
 */
const useAutoHideNavigation = (): boolean => {
  useSignals();
  const [navigation, , loaded] = useKubevirtUserSettings(USER_SETTINGS_KEYS.navigation);
  const [wasCollapsed, setWasCollapsed] = useState(false);
  const mountedRef = useRef(false);

  const settingEnabled = loaded ? navigation?.autoHideNav ?? AUTO_HIDE_NAV_DEFAULT : false;
  const userOverrode = userExpandedNavSignal.value;

  useEffect(() => {
    if (!mountedRef.current) {
      mountedRef.current = true;
      userExpandedNavSignal.value = false;
    }

    return () => {
      userExpandedNavSignal.value = false;
      expandSidebar();
    };
  }, []);

  useEffect(() => {
    if (!settingEnabled || userOverrode) return;

    const frameId = requestAnimationFrame(() => {
      const didCollapse = collapseSidebar();
      if (didCollapse) setWasCollapsed(true);
    });

    return () => cancelAnimationFrame(frameId);
  }, [settingEnabled, userOverrode]);

  useEffect(() => {
    if (!settingEnabled) return;

    const handleNavToggleClick = () => {
      requestAnimationFrame(() => {
        if (isSidebarOpen()) {
          userExpandedNavSignal.value = true;
        }
      });
    };

    const navButton = getNavToggleButton();
    navButton?.addEventListener('click', handleNavToggleClick);

    return () => {
      navButton?.removeEventListener('click', handleNavToggleClick);
    };
  }, [settingEnabled]);

  return wasCollapsed && !userOverrode;
};

export default useAutoHideNavigation;
