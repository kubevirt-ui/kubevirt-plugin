import { V1VirtualMachine, V1VirtualMachineInstance } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { getAutoAttachPodInterface, getInterfaces } from '@kubevirt-utils/resources/vm';
import { DEFAULT_NETWORK_INTERFACE } from '@kubevirt-utils/resources/vm/utils/constants';
import { getVMIInterfaces, getVMIStatusInterfaces } from '@kubevirt-utils/resources/vmi';
import { isRunning, isStopped } from '@virtualmachines/utils';

import { ABSENT } from './constants';

export const isActiveOnGuest = (
  vmi: V1VirtualMachineInstance,
  nicName: string,
  isVMRunning?: boolean,
) =>
  (isVMRunning ? getVMIStatusInterfaces(vmi) : getVMIInterfaces(vmi))?.some(
    (iface) => iface?.name === nicName,
  );

export const isAbsent = (vm: V1VirtualMachine, nicName: string) =>
  getInterfaces(vm)?.find((iface) => iface?.name === nicName)?.state === ABSENT;

export const isPendingHotPlugNIC = (
  vm: V1VirtualMachine,
  vmi: V1VirtualMachineInstance,
  nicName: string,
): boolean => {
  const vmRunning = isRunning(vm);

  return vmRunning && (!isActiveOnGuest(vmi, nicName, vmRunning) || isAbsent(vm, nicName));
};

export const interfaceNotFound = (vm: V1VirtualMachine, nicName: string) =>
  !Boolean(getInterfaces(vm)?.find((iface) => iface?.name === nicName));

export const isPendingRemoval = (
  vm: V1VirtualMachine,
  vmi: V1VirtualMachineInstance,
  nicName: string,
): boolean => {
  if (!vmi || isStopped(vm)) return false;

  const isVMRunning = isRunning(vm);

  const autoAttachPodInterface = getAutoAttachPodInterface(vm) !== false;

  if (
    autoAttachPodInterface &&
    nicName === DEFAULT_NETWORK_INTERFACE.name &&
    isActiveOnGuest(vmi, nicName, isVMRunning)
  )
    return false;

  return interfaceNotFound(vm, nicName) && isActiveOnGuest(vmi, nicName, isVMRunning);
};
