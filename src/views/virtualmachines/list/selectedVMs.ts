import { V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { getName, getNamespace } from '@kubevirt-utils/resources/shared';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { getCluster } from '@multicluster/helpers/selectors';
import { signal } from '@preact/signals-core';

export const selectedVMs = signal<{ cluster?: string; name: string; namespace: string }[]>([]);

export const selectVM = (vm: V1VirtualMachine) => {
  const vmIdentifier = { cluster: getCluster(vm), name: getName(vm), namespace: getNamespace(vm) };
  if (isEmpty(findVM(vm))) {
    selectedVMs.value = [...selectedVMs.value, vmIdentifier];
  }
};

export const deselectVM = (vm: V1VirtualMachine) => {
  const vmIdentifier = { cluster: getCluster(vm), name: getName(vm), namespace: getNamespace(vm) };
  selectedVMs.value = selectedVMs.value.filter(
    (selectedVM) =>
      selectedVM.name !== vmIdentifier.name || selectedVM.namespace !== vmIdentifier.namespace,
  );
};

export const selectAll = (vms: V1VirtualMachine[]) => {
  const vmIdentifiers = vms.map((vm) => ({
    cluster: getCluster(vm),
    name: getName(vm),
    namespace: getNamespace(vm),
  }));
  selectedVMs.value = [...vmIdentifiers];
};

export const deselectAll = () => {
  selectedVMs.value = [];
};

export const findVM = (vm: V1VirtualMachine) => {
  const vmIdentifier = { cluster: getCluster(vm), name: getName(vm), namespace: getNamespace(vm) };
  return selectedVMs.value.find(
    (selectedVM) =>
      selectedVM.name === vmIdentifier.name &&
      selectedVM.namespace === vmIdentifier.namespace &&
      selectedVM.cluster === vmIdentifier.cluster,
  );
};

export const isVMSelected = (vm: V1VirtualMachine): boolean => !isEmpty(findVM(vm));
