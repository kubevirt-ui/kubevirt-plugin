import { type V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { getLabel } from '@kubevirt-utils/resources/shared';
import { VM_FOLDER_LABEL } from '@virtualmachines/tree/utils/constants';

export const isVMInGroup =
  (group: string) =>
  (vm: V1VirtualMachine): boolean =>
    getLabel(vm, VM_FOLDER_LABEL) === group;
