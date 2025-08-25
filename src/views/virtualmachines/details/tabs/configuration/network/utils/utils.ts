import produce from 'immer';

import VirtualMachineModel from '@kubevirt-ui/kubevirt-api/console/models/VirtualMachineModel';
import {
  V1Network,
  V1VirtualMachine,
  V1VirtualMachineInstance,
  V1VirtualMachineInstanceNetworkInterface,
} from '@kubevirt-ui/kubevirt-api/kubevirt';
import {
  getAutoAttachPodInterface,
  getInterface,
  getInterfaces,
} from '@kubevirt-utils/resources/vm';
import { DEFAULT_NETWORK_INTERFACE } from '@kubevirt-utils/resources/vm/utils/constants';
import { interfaceTypesProxy } from '@kubevirt-utils/resources/vm/utils/network/constants';
import {
  getNetworkInterface,
  getNetworkInterfaceState,
  getNetworkInterfaceType,
} from '@kubevirt-utils/resources/vm/utils/network/selectors';
import { NetworkInterfaceState } from '@kubevirt-utils/resources/vm/utils/network/types';
import { getVMIInterfaces, getVMIStatusInterfaces } from '@kubevirt-utils/resources/vmi';
import { isNetworkInterfaceState } from '@kubevirt-utils/utils/typeGuards';
import { ensurePath, kubevirtConsole } from '@kubevirt-utils/utils/utils';
import { k8sUpdate } from '@openshift-console/dynamic-plugin-sdk';
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

export const isPendingNICAdd = (
  vm: V1VirtualMachine,
  vmi: V1VirtualMachineInstance,
  nicName: string,
): boolean => {
  const vmRunning = isRunning(vm);
  const vmiAvailable = !!vmi;

  return (
    vmRunning &&
    vmiAvailable &&
    (!isActiveOnGuest(vmi, nicName, vmRunning) || isAbsent(vm, nicName))
  );
};

export const interfaceNotFound = (vm: V1VirtualMachine, nicName: string) =>
  !Boolean(getInterfaces(vm)?.find((iface) => iface?.name === nicName));

//special case - when u add ephemeral nic from vm console terminal
export const isInterfaceEphemeral = (
  network: V1Network,
  ifaceVMIStatus: V1VirtualMachineInstanceNetworkInterface,
) => {
  const ifaceVMI = !network && ifaceVMIStatus && ifaceVMIStatus?.infoSource === 'guest-agent';

  return ifaceVMI;
};

export const isPendingNICRemoval = (
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

export const isSRIOVNetworkByVM = (vm: V1VirtualMachine, nicName: string) => {
  const iface = getNetworkInterface(vm, nicName);
  return interfaceTypesProxy[getNetworkInterfaceType(iface)] === interfaceTypesProxy.sriov;
};

export const isSRIOVInterface = <T extends { sriov?: object }>(iface: T) => !!iface?.sriov;

export const getConfigInterfaceStateFromVM = (
  vm: V1VirtualMachine,
  nicName: string,
): NetworkInterfaceState =>
  getConfigInterfaceState(
    getNetworkInterface(vm, nicName),
    getNetworkInterfaceState(vm, nicName),
    isSRIOVNetworkByVM(vm, nicName),
  );

export const getConfigInterfaceState = (
  iface?: unknown,
  ifaceState?: string,
  isSRIOV?: boolean,
): NetworkInterfaceState => {
  if (!iface) {
    // no interface
    return NetworkInterfaceState.NONE;
  }
  if (isSRIOV) {
    return NetworkInterfaceState.UNSUPPORTED;
  }

  return isNetworkInterfaceState(ifaceState) ? ifaceState : NetworkInterfaceState.UP;
};

export const getRuntimeInterfaceState = (simpleIfaceState: string): NetworkInterfaceState => {
  return isNetworkInterfaceState(simpleIfaceState) ? simpleIfaceState : NetworkInterfaceState.NONE;
};

export const setNetworkInterfaceState = (
  vm: V1VirtualMachine,
  nicName: string,
  desiredState: NetworkInterfaceState,
): Promise<V1VirtualMachine | void> => {
  if (!getInterface(vm, nicName)) return undefined;

  const updatedVM = produce(vm, (draftVM) => {
    ensurePath(draftVM, ['spec.template.spec.domain.devices.interfaces']);
    const ifaceToUpdate = getInterface(draftVM, nicName);
    ifaceToUpdate.state = desiredState;
  });

  return k8sUpdate({
    data: updatedVM,
    model: VirtualMachineModel,
  }).catch((error) => kubevirtConsole.error(error));
};

export const isLinkStateEditable = (state: NetworkInterfaceState) =>
  state === NetworkInterfaceState.DOWN || state === NetworkInterfaceState.UP;
