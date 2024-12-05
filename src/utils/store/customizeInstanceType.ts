import produce from 'immer';

import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { effect, signal } from '@preact/signals-react';

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
  let vm = vmSignal.value;

  updateValues.forEach(({ data, merge = false, path }) => {
    //replace complete vm obj
    if (isEmpty(path)) {
      vm = data;
      return;
    }

    vm = produce(vm, (vmDraft) => {
      const pathParts = typeof path === 'string' ? path.split('.') : path;
      let obj = vmDraft;

      pathParts.forEach((part: string, index: number) => {
        if (index < pathParts.length - 1) {
          obj = obj?.[part] ? obj[part] : Object.assign(obj, { [part]: {} })[part];
          return;
        }

        obj[part] = merge ? mergeData(obj[part], data) : data;
      });
    });
  });

  vmSignal.value = vm;

  return vmSignal.value;
};

export const updateVMCustomizeIT = (vm: V1VirtualMachine) =>
  Promise.resolve(updateCustomizeInstanceType([{ data: vm }]));
