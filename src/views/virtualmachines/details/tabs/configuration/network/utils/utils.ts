import { V1VirtualMachine, V1VirtualMachineInstance } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { getInterfaces } from '@kubevirt-utils/resources/vm';
import { getVMIStatusInterfaces } from '@kubevirt-utils/resources/vmi';
import { isRunning } from '@virtualmachines/utils';

import { ABSENT } from './constants';

export const isActiveOnGuest = (vmi: V1VirtualMachineInstance, nicName: string) =>
  getVMIStatusInterfaces(vmi)?.some((iface) => iface?.name === nicName);

export const isAbsent = (vm: V1VirtualMachine, nicName: string) =>
  getInterfaces(vm)?.find((iface) => iface?.name === nicName)?.state === ABSENT;

export const isPendingHotPlugNIC = (
  vm: V1VirtualMachine,
  vmi: V1VirtualMachineInstance,
  nicName: string,
): boolean => isRunning(vm) && (!isActiveOnGuest(vmi, nicName) || isAbsent(vm, nicName));
