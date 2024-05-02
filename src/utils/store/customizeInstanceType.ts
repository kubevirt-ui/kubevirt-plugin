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

type UpdateCustomizeInstanceTypeArgs = {
  data: any;
  merge?: boolean;
  path?: string;
}[];
type UpdateCustomizeInstanceType = (args: UpdateCustomizeInstanceTypeArgs) => V1VirtualMachine;

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
  });

  vmSignal.value = vm;
  return vmSignal.value;
};
