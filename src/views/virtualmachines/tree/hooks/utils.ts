import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { getLabel, getName, getNamespace } from '@kubevirt-utils/resources/shared';

import { VM_FOLDER_LABEL } from '../utils/constants';
import { vmsSignal } from '../utils/signals';

export const getVMFromElementID = (elementID: string): V1VirtualMachine => {
  const [namespace, name] = elementID.split('/');

  return vmsSignal?.value?.find(
    (resource) => getNamespace(resource) === namespace && getName(resource) === name,
  );
};

export const isVMAloneInFolder = (draggingVM: V1VirtualMachine) => {
  const draggingVMFolder = getLabel(draggingVM, VM_FOLDER_LABEL);

  return (
    vmsSignal?.value?.filter((vm) => draggingVMFolder === getLabel(vm, VM_FOLDER_LABEL)).length ===
    1
  );
};
