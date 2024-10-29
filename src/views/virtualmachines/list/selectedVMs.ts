import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { getName, getNamespace } from '@kubevirt-utils/resources/shared';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { signal } from '@preact/signals-core';

export const selectedVMs = signal<V1VirtualMachine[]>([]);

export const selectVM = (vm: V1VirtualMachine) => {
  if (isEmpty(findVM(vm))) selectedVMs.value = [...selectedVMs.value, vm];
};

export const deselectVM = (vm: V1VirtualMachine) => {
  selectedVMs.value = selectedVMs.value.filter(
    (selectedVM) =>
      getName(selectedVM) !== getName(vm) || getNamespace(selectedVM) !== getNamespace(vm),
  );
};

export const selectAll = (vms: V1VirtualMachine[]) => {
  selectedVMs.value = Array.from(new Set([...selectedVMs.value, ...vms]));
};

export const deselectAll = () => (selectedVMs.value = []);

export const findVM = (vm: V1VirtualMachine) =>
  selectedVMs.value.find(
    (selectedVM) =>
      getName(selectedVM) === getName(vm) && getNamespace(selectedVM) === getNamespace(vm),
  );

export const isVMSelected = (vm: V1VirtualMachine): boolean => !isEmpty(findVM(vm));
