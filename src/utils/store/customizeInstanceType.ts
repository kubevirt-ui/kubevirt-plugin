import produce from 'immer';

import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { effect, signal } from '@preact/signals-react';

import {
  getCustomizeInstanceTypeSessionStorage,
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

export const updateCustomizeInstanceType = ({ data, merge = false, path }): V1VirtualMachine => {
  vmSignal.value = produce(vmSignal.value, (vmDraft) => {
    const pathParts = path.split('.');
    let obj = vmDraft;

    pathParts.forEach((part: string, index: number) => {
      if (index < pathParts.length - 1) {
        obj = obj?.[part] ? obj[part] : Object.assign(obj, { [part]: {} })[part];
        return;
      }
      obj[part] = merge ? { ...obj[part], ...data } : data;
    });
  });

  return vmSignal.value;
};
