import React, { useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom-v5-compat';

import { OVERVIEW_TAB_INDEX, TAB_INDEX_MAP, TAB_KEY_MAP, VM_LIST_TAB_PARAM } from './constants';

type UseNavigatorTabsResult = {
  activeTabKey: number;
  handleTabSelect: (event: React.MouseEvent<HTMLElement>, tabIndex: number | string) => void;
};

const useNavigatorTabs = (): UseNavigatorTabsResult => {
  const [searchParams, setSearchParams] = useSearchParams();

  const activeTabKey = useMemo(() => {
    const tabParam = searchParams.get(VM_LIST_TAB_PARAM);
    return tabParam && TAB_KEY_MAP[tabParam] !== undefined
      ? TAB_KEY_MAP[tabParam]
      : OVERVIEW_TAB_INDEX;
  }, [searchParams]);

  const handleTabSelect = useCallback(
    (_event: React.MouseEvent<HTMLElement>, tabIndex: number | string) => {
      const tabValue = TAB_INDEX_MAP[tabIndex as number];
      if (!tabValue) return;
      const newParams = new URLSearchParams(searchParams);
      newParams.set(VM_LIST_TAB_PARAM, tabValue);
      setSearchParams(newParams);
    },
    [searchParams, setSearchParams],
  );

  return { activeTabKey, handleTabSelect };
};

export default useNavigatorTabs;
