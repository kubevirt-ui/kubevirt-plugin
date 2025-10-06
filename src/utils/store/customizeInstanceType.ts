import produce from 'immer';

import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { ensurePath } from '@kubevirt-utils/utils/utils';
import { effect, signal } from '@preact/signals-react';

import { isEmpty } from '../utils/utils';

import {
  getCustomizeInstanceTypeSessionStorage,
  mergeData,
  saveCustomizeInstanceTypeSessionStorage,
} from './customizeInstanceType/utils/utils';

export const vmSignal = signal<V1VirtualMachine>(null);

effect(() => {
  if (!isEmpty(vmSignal.value)) {
    saveCustomizeInstanceTypeSessionStorage(vmSignal.value);
    return;
  }
  const vmSessionStorage = getCustomizeInstanceTypeSessionStorage();
  vmSignal.value = vmSessionStorage;
});

type UpdateCustomizeInstanceTypeArgs = {
  data: any;
  merge?: boolean;
  path?: string | string[];
}[];

export type UpdateCustomizeInstanceType = (
  args: UpdateCustomizeInstanceTypeArgs,
) => V1VirtualMachine;

export const clearCustomizeInstanceType = () => {
  vmSignal.value = null;
  saveCustomizeInstanceTypeSessionStorage(null);
};

export const updateCustomizeInstanceType: UpdateCustomizeInstanceType = (
  updateValues,
): V1VirtualMachine => {
  // Handle null/undefined signal value
  if (!vmSignal.value) {
    return undefined;
  }

  // Create a deep copy for each update to prevent reference mutation
  let vm = produce(vmSignal.value, (draft) => draft);

  updateValues.forEach(({ data, merge = false, path }) => {
    // Replace complete vm obj when path is undefined (no path property)
    if (path === undefined) {
      vm = data;
      return;
    }

    // Skip update when path is empty string
    if (path === '') {
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

  vmSignal.value = vm;

  return vmSignal.value;
};

export const updateVMCustomizeIT = (vm: V1VirtualMachine) =>
  Promise.resolve(updateCustomizeInstanceType([{ data: vm }]));
