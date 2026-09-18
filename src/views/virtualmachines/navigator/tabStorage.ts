import { getSessionStorageItem, isEmpty, setSessionStorageItem } from '@kubevirt-utils/utils/utils';

import { OVERVIEW_TAB_INDEX, TAB_KEY_MAP, VM_LIST_TAB_PARAM } from './constants';

export const VM_LIST_TAB_SESSION_KEY = 'lastVMListTab';

export const getStoredNavigatorTab = (): string | null => {
  const storedTab = getSessionStorageItem(VM_LIST_TAB_SESSION_KEY);

  return !isEmpty(storedTab) && TAB_KEY_MAP[storedTab] !== undefined ? storedTab : null;
};

export const setStoredNavigatorTab = (tabValue: string): void => {
  if (TAB_KEY_MAP[tabValue] !== undefined) {
    setSessionStorageItem(VM_LIST_TAB_SESSION_KEY, tabValue);
  }
};

export const getNavigatorTabKeyFromSearch = (search: string): number => {
  const params = new URLSearchParams(search);
  const tabParam = params.get(VM_LIST_TAB_PARAM);

  if (!isEmpty(tabParam) && TAB_KEY_MAP[tabParam] !== undefined) {
    return TAB_KEY_MAP[tabParam];
  }

  const storedTab = getStoredNavigatorTab();

  return !isEmpty(storedTab) ? TAB_KEY_MAP[storedTab] : OVERVIEW_TAB_INDEX;
};

export const getNavigatorTabSearch = (search: string): string => {
  const params = new URLSearchParams(search);

  if (!params.has(VM_LIST_TAB_PARAM)) {
    const storedTab = getStoredNavigatorTab();

    if (!isEmpty(storedTab)) {
      params.set(VM_LIST_TAB_PARAM, storedTab);
    }
  }

  const queryString = params.toString();

  return !isEmpty(queryString) ? `?${queryString}` : search;
};
