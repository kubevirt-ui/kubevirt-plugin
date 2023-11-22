import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';

import { TabsData } from './tabs-data';

const VM_CACHE_KEY = 'wizard-vm-cache';
const TABS_DATA_CACHE_KEY = 'wizard-tabs-data-cache';

export const setSessionStorageVM = (value: V1VirtualMachine) => {
  try {
    window.sessionStorage.setItem(VM_CACHE_KEY, JSON.stringify(value));
  } catch (e) {}
};

export const getSessionStorageVM = (): undefined | V1VirtualMachine => {
  try {
    const value = window.sessionStorage.getItem(VM_CACHE_KEY);
    return value ? JSON.parse(value) : undefined;
  } catch (e) {
    return undefined;
  }
};

export const setSessionStorageTabsData = (value: TabsData) => {
  try {
    window.sessionStorage.setItem(TABS_DATA_CACHE_KEY, JSON.stringify(value));
  } catch (e) {}
};

export const getSessionStorageTabsData = (): TabsData => {
  try {
    const value = window.sessionStorage.getItem(TABS_DATA_CACHE_KEY);
    return value ? JSON.parse(value) : {};
  } catch (e) {
    return {};
  }
};

export const clearSessionStorageVM = () => {
  try {
    window.sessionStorage.removeItem(VM_CACHE_KEY);
    window.sessionStorage.removeItem(TABS_DATA_CACHE_KEY);
  } catch (e) {}
};
