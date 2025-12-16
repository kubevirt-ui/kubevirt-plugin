import { V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { isEmpty, kubevirtConsole } from '@kubevirt-utils/utils/utils';

import { CUSTOMIZE_INSTANCE_TYPE_SESSION_STORAGE_KEY } from './const';

export const saveCustomizeInstanceTypeSessionStorage = (vm: V1VirtualMachine): void => {
  sessionStorage.setItem(CUSTOMIZE_INSTANCE_TYPE_SESSION_STORAGE_KEY, JSON.stringify(vm));
};

export const getCustomizeInstanceTypeSessionStorage = (): V1VirtualMachine => {
  const vmString = sessionStorage.getItem(CUSTOMIZE_INSTANCE_TYPE_SESSION_STORAGE_KEY);
  if (!isEmpty(vmString)) {
    try {
      const vm = JSON.parse(vmString);
      return vm;
    } catch (error) {
      kubevirtConsole.log('Error parsing vm session storage:', error);
    }
  }
  return null;
};

export const mergeData = (seedData, appendData) => {
  // Handle null/undefined cases
  if (seedData == null && appendData == null) {
    return {};
  }

  if (seedData == null) {
    return appendData;
  }

  if (appendData == null) {
    return seedData;
  }

  // Handle array merging
  if (Array.isArray(seedData) || Array.isArray(appendData)) {
    const seedArray = Array.isArray(seedData) ? seedData : [];
    const appendArray = Array.isArray(appendData) ? appendData : [];
    return [...seedArray, ...appendArray];
  }

  // Handle object merging
  if (typeof seedData === 'object' && typeof appendData === 'object') {
    return { ...seedData, ...appendData };
  }

  // For primitive values, return the appendData
  return appendData;
};
