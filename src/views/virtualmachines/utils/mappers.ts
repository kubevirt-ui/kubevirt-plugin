import {
  V1VirtualMachine,
  V1VirtualMachineInstance,
  V1VirtualMachineInstanceMigration,
} from '@kubevirt-ui/kubevirt-api/kubevirt';
import { getName, getNamespace } from '@kubevirt-utils/resources/shared';

export type VmiMapper = {
  mapper: { [key: string]: { [key: string]: V1VirtualMachineInstance } };
  nodeNames: { [key: string]: { id: string; title: string } };
};

export type VmimMapper = { [key: string]: { [key: string]: V1VirtualMachineInstanceMigration } };

export const getVMIFromMapper = (vmiMapper: VmiMapper, vm: V1VirtualMachine) =>
  vmiMapper?.mapper?.[getNamespace(vm)]?.[getName(vm)];
