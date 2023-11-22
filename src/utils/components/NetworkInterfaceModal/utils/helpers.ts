import produce from 'immer';

import { V1Interface, V1Network, V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { t } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getInterfaces } from '@kubevirt-utils/resources/vm';
import { interfacesTypes } from '@kubevirt-utils/resources/vm/utils/network/constants';
import { kubevirtConsole } from '@kubevirt-utils/utils/utils';
import { ABSENT } from '@virtualmachines/details/tabs/configuration/network/utils/constants';

import { NetworkAttachmentDefinition } from '../components/hooks/types';

export const podNetworkExists = (vm: V1VirtualMachine): boolean =>
  !!vm?.spec?.template?.spec?.networks?.find((network) => typeof network.pod === 'object');

export const networkNameStartWithPod = (networkName: string): boolean =>
  networkName?.startsWith('Pod');

export const getNetworkName = (network: V1Network): string => {
  if (network) {
    return network?.pod ? t('Pod networking') : network?.multus?.networkName;
  }
  return null;
};

export const updateVMNetworkInterfaces = (
  vm: V1VirtualMachine,
  updatedNetworks: V1Network[],
  updatedInterfaces: V1Interface[],
) => {
  const updatedVM = produce<V1VirtualMachine>(vm, (vmDraft: V1VirtualMachine) => {
    vmDraft.spec.template.spec.networks = updatedNetworks;
    vmDraft.spec.template.spec.domain.devices.interfaces = updatedInterfaces;
  });
  return updatedVM;
};

const getInterface = (interfaces: V1Interface[], nicName: string) =>
  interfaces.find((iface) => iface?.name === nicName);

/**
 * To delete a hot plug NIC the state of the interface is set to 'absent'. The
 * NIC will then be removed when the VM is live migrated or restarted.
 * @param interfaces {V1Interface[]}
 * @param nicName {string}
 * @return the virtual machine's interfaces with the hot plug NIC's state set to 'absent;
 */
export const markInterfaceAbsent = (interfaces: V1Interface[], nicName: string) => {
  if (!getInterface(interfaces, nicName)) return null;

  return produce<V1Interface[]>(interfaces, (draftInterfaces: V1Interface[]) => {
    const ifaceToDelete = getInterface(draftInterfaces, nicName);
    ifaceToDelete.state = ABSENT;
  });
};

const removeInterfaceToBeDeleted = (nicName: string, vm: V1VirtualMachine) =>
  getInterfaces(vm)?.filter(({ name }) => name !== nicName);

export const updateInterfacesForDeletion = (
  isHotPlug: boolean,
  nicName: string,
  vm: V1VirtualMachine,
): V1Interface[] => {
  return isHotPlug
    ? markInterfaceAbsent(getInterfaces(vm), nicName)
    : removeInterfaceToBeDeleted(nicName, vm);
};

export const createNetwork = (nicName: string, networkName: string): V1Network => {
  const network: V1Network = {
    name: nicName,
  };

  if (!networkNameStartWithPod(networkName) && networkName) {
    network.multus = { networkName: networkName?.split('/')?.[1] || networkName };
  } else {
    network.pod = {};
  }

  return network;
};

export const createInterface = (
  nicName: string,
  interfaceModel: string,
  interfaceMACAddress: string,
  interfaceType: string,
): V1Interface => {
  return {
    [interfaceType.toLowerCase()]: {},
    macAddress: interfaceMACAddress,
    model: interfaceModel,
    name: nicName,
  };
};

export const getNadType = (nad: NetworkAttachmentDefinition): string => {
  try {
    const config = JSON.parse(nad?.spec?.config);
    //can be config.type or config.plugin first element only!'
    return interfacesTypes?.[config?.type] || interfacesTypes?.[config?.plugins?.[0]?.type];
  } catch (e) {
    kubevirtConsole.log('Cannot convert NAD config: ', e);
  }
};
