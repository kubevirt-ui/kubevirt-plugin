import produce from 'immer';

import { V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { ensurePath } from '@kubevirt-utils/utils/utils';
import { UpdateWizardVM } from '@virtualmachines/creation-wizard/state/vm-signal/types';
import {
  saveWizardVMToSessionStorage,
  wizardVMSignal,
} from '@virtualmachines/creation-wizard/state/vm-signal/vmStore';

export const mergeData = (seedData, appendData) => {
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

export const clearWizardVM = () => {
  wizardVMSignal.value = null;
  saveWizardVMToSessionStorage(null);
};

export const updateWizardVM: UpdateWizardVM = (updateValues): null | V1VirtualMachine => {
  let vm = wizardVMSignal.value ? produce(wizardVMSignal.value, (draft) => draft) : null;

  updateValues.forEach(({ data, merge = false, path }) => {
    // Replace complete vm obj when path is undefined (no path property)
    if (path === undefined) {
      vm = data;
      return;
    }

    if (!vm) {
      return;
    }

    if (path === '') {
      // Skip update when path is empty string
      return;
    }

    vm = produce(vm, (vmDraft) => {
      const pathParts = typeof path === 'string' ? path.split('.') : path;
      // Filter out empty strings to prevent corruption
      const validPathParts = pathParts.filter((part) => part !== '');

      if (validPathParts.length === 0) {
        return;
      }
      ensurePath(vmDraft, validPathParts.join('.'));
      let obj = vmDraft;
      validPathParts.forEach((part, index) => {
        if (index < validPathParts.length - 1) {
          obj = obj[part];
        } else {
          obj[part] = merge ? mergeData(obj[part], data) : data;
        }
      });
    });
  });

  wizardVMSignal.value = vm;

  return wizardVMSignal.value;
};

export const setWizardVM = (vm: V1VirtualMachine) =>
  Promise.resolve(updateWizardVM([{ data: vm }]));
