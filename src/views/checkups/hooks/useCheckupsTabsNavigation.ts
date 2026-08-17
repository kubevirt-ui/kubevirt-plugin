import { useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router';

import usePreserveTabDisplay from '@kubevirt-utils/hooks/usePreserveTabDisplay';

const LAST_CHECKUPS_TAB = 'lastCheckupsTab';

const useCheckupsTabsNavigation = (defaultTab: string): void => {
  const location = useLocation();
  const navigate = useNavigate();
  const isInitialMountRef = useRef(true);

  usePreserveTabDisplay({
    basePath: 'checkups',
    storageKey: LAST_CHECKUPS_TAB,
  });

  useEffect(() => {
    // Remove trailing slash if present
    if (location.pathname.endsWith('/')) {
      navigate(location.pathname.slice(0, -1), { replace: true });
      return;
    }

    // Redirect to default tab if URL is just /checkups (initial mount)
    // On namespace change, keep the same tab (from session storage)
    if (location.pathname.endsWith('/checkups')) {
      const targetTab = isInitialMountRef.current
        ? defaultTab
        : sessionStorage.getItem(LAST_CHECKUPS_TAB);

      if (targetTab) {
        navigate(`${location.pathname}/${targetTab}`, { replace: true });
      }
    }

    isInitialMountRef.current = false;
  }, [location.pathname, navigate, defaultTab]);
};

export default useCheckupsTabsNavigation;
