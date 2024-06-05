import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
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
      kubevirtConsole.log('Error parsing vm session storage');
    }
  }
  return null;
};

export const mergeData = (seedData, appendData) => {
  return Array.isArray(seedData) || Array.isArray(appendData)
    ? [...(seedData || []), ...(appendData || [])]
    : { ...(seedData || {}), ...(appendData || {}) };
};
