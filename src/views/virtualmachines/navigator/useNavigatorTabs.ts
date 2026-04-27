import { MouseEvent, useCallback, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router';

import { OVERVIEW_TAB_INDEX, TAB_INDEX_MAP, TAB_KEY_MAP, VM_LIST_TAB_PARAM } from './constants';

type UseNavigatorTabsResult = {
  activeTabKey: number;
  handleTabSelect: (event: MouseEvent<HTMLElement>, tabIndex: number | string) => void;
};

const getTabKeyFromSearch = (search: string): number => {
  const params = new URLSearchParams(search);
  const tabParam = params.get(VM_LIST_TAB_PARAM);
  return tabParam && TAB_KEY_MAP[tabParam] !== undefined
    ? TAB_KEY_MAP[tabParam]
    : OVERVIEW_TAB_INDEX;
};

const useNavigatorTabs = (): UseNavigatorTabsResult => {
  const location = useLocation();
  const navigate = useNavigate();

  const [activeTabKey, setActiveTabKey] = useState<number>(() =>
    getTabKeyFromSearch(location.search),
  );

  useEffect(() => {
    setActiveTabKey(getTabKeyFromSearch(location.search));
  }, [location.search]);

  const handleTabSelect = useCallback(
    (_event: MouseEvent<HTMLElement>, tabIndex: number | string) => {
      const tabValue = TAB_INDEX_MAP[tabIndex as number];
      if (!tabValue) return;

      setActiveTabKey(tabIndex as number);

      const params = new URLSearchParams(location.search);
      params.set(VM_LIST_TAB_PARAM, tabValue);
      navigate({ search: params.toString() }, { replace: true });
    },
    [location.search, navigate],
  );

  return { activeTabKey, handleTabSelect };
};

export default useNavigatorTabs;
