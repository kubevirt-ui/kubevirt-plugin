import {
  V1VirtualMachine,
  V1VirtualMachineInstance,
  V1VirtualMachineInstanceMigration,
} from '@kubevirt-ui/kubevirt-api/kubevirt';
import { getName, getNamespace } from '@kubevirt-utils/resources/shared';

export type VMIMapper = {
  mapper: { [key: string]: { [key: string]: V1VirtualMachineInstance } };
  nodeNames: { [key: string]: { id: string; title: string } };
};

export type VMIMMapper = { [key: string]: { [key: string]: V1VirtualMachineInstanceMigration } };

export const getVMIFromMapper = (VMIMapper: VMIMapper, vm: V1VirtualMachine) =>
  VMIMapper?.mapper?.[getNamespace(vm)]?.[getName(vm)];

export const getVMIMFromMapper = (VMIMMapper: VMIMMapper, name: string, namespace: string) =>
  VMIMMapper?.mapper?.[namespace]?.[name];
