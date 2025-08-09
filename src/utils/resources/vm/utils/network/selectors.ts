import { V1Interface, V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { getInterfaces } from '@kubevirt-utils/resources/vm';
import { isNetworkInterfaceState } from '@kubevirt-utils/utils/typeGuards';

import { NO_DATA_DASH, PASST_BINDING_NAME, UDN_BINDING_NAME } from '../constants';

import { interfaceTypesProxy } from './constants';
import { NetworkInterfaceState } from './types';

/**
 * function to get network interface type
 * @param {V1Interface} iface interface
 * @returns interface type
 */
export const getNetworkInterfaceType = (iface: V1Interface): string => {
  if (iface?.binding?.name === UDN_BINDING_NAME) return UDN_BINDING_NAME;
  if (iface?.binding?.name === PASST_BINDING_NAME) return PASST_BINDING_NAME;

  const drive = Object.keys(interfaceTypesProxy)?.find((ifaceType: string) => iface?.[ifaceType]);
  return drive ?? NO_DATA_DASH;
};

/**
 * function to get printable network interface type
 * @param {V1Interface} iface interface
 * @returns interface type
 */
export const getPrintableNetworkInterfaceType = (iface: V1Interface): string =>
  interfaceTypesProxy[getNetworkInterfaceType(iface)];

/**
 * function to get a specific network interface by name
 * @param {V1VirtualMachine} vm the VirtualMachine whose interface is to be returned
 * @param {string} interfaceName the name of the interface to be returned
 * @returns {V1Interface} interface type
 */
export const getNetworkInterface = (
  vm: V1VirtualMachine,
  interfaceName: string,
): undefined | V1Interface => getInterfaces(vm)?.find((iface) => iface?.name === interfaceName);

/**
 * function to get the state of a specific network interface
 * @param {V1VirtualMachine} vm the VirtualMachine whose interface state is to be returned
 * @param {string} interfaceName the name of the interface whose state is to be returned
 * @returns {string} interface state
 */
export const getNetworkInterfaceState = (
  vm: V1VirtualMachine,
  interfaceName: string,
): string | undefined => getNetworkInterface(vm, interfaceName)?.state;

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
