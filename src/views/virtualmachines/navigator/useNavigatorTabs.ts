import type { MouseEvent } from 'react';
import { useCallback, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router';

import { TAB_INDEX_MAP, VM_LIST_TAB_PARAM } from './constants';
import { getNavigatorTabKeyFromSearch, setStoredNavigatorTab } from './tabStorage';

type UseNavigatorTabsResult = {
  activeTabKey: number;
  handleTabSelect: (event: MouseEvent<HTMLElement>, tabIndex: number | string) => void;
};

const useNavigatorTabs = (): UseNavigatorTabsResult => {
  const location = useLocation();
  const navigate = useNavigate();

  const [activeTabKey, setActiveTabKey] = useState<number>(() =>
    getNavigatorTabKeyFromSearch(location.search),
  );

  useEffect(() => {
    setActiveTabKey(getNavigatorTabKeyFromSearch(location.search));
  }, [location.search]);

  const handleTabSelect = useCallback(
    (_event: MouseEvent<HTMLElement>, tabIndex: number | string) => {
      const tabValue = TAB_INDEX_MAP[tabIndex as number];
      if (!tabValue) return;

      setActiveTabKey(tabIndex as number);
      setStoredNavigatorTab(tabValue);

      const params = new URLSearchParams(location.search);
      params.set(VM_LIST_TAB_PARAM, tabValue);
      navigate({ search: params.toString() }, { replace: true });
    },
    [location.search, navigate],
  );

  return { activeTabKey, handleTabSelect };
};

export default useNavigatorTabs;
