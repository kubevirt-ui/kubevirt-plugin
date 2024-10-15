import produce from 'immer';

import VirtualMachineModel from '@kubevirt-ui/kubevirt-api/console/models/VirtualMachineModel';
import { V1Interface, V1Network, V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { DEFAULT_NAMESPACE } from '@kubevirt-utils/constants/constants';
import { t } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import {
  getAutoAttachPodInterface,
  getInterfaces,
  getNetworks,
} from '@kubevirt-utils/resources/vm';
import {
  interfacesTypes,
  NetworkPresentation,
} from '@kubevirt-utils/resources/vm/utils/network/constants';
import { isEmpty, kubevirtConsole } from '@kubevirt-utils/utils/utils';
import { k8sPatch } from '@openshift-console/dynamic-plugin-sdk';
import { ABSENT } from '@virtualmachines/details/tabs/configuration/network/utils/constants';
import { isStopped } from '@virtualmachines/utils';

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
) =>
  k8sPatch({
    data: [
      {
        op: 'replace',
        path: '/spec/template/spec/networks',
        value: updatedNetworks,
      },
      {
        op: 'replace',
        path: '/spec/template/spec/domain/devices/interfaces',
        value: updatedInterfaces,
      },
      ...(isEmpty(updatedInterfaces)
        ? [
            {
              op: getAutoAttachPodInterface(vm) === undefined ? 'add' : 'replace',
              path: '/spec/template/spec/domain/devices/autoattachPodInterface',
              value: false,
            },
          ]
        : []),
    ],
    model: VirtualMachineModel,
    resource: vm,
  });

const getInterface = (interfaces: V1Interface[], nicName: string) =>
  interfaces?.find((iface) => iface?.name === nicName);

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

const removeInterfaceToBeDeleted = (nicName: string, vm: V1VirtualMachine): V1Interface[] =>
  getInterfaces(vm)?.filter(({ name }) => name !== nicName);

export const updateInterfacesForDeletion = (
  nicName: string,
  vm: V1VirtualMachine,
  canBeMarkedAbsent: boolean,
): V1Interface[] => {
  return canBeMarkedAbsent
    ? markInterfaceAbsent(getInterfaces(vm), nicName)
    : removeInterfaceToBeDeleted(nicName, vm);
};

const removeNetworkToBeDeleted = (nicName: string, vm: V1VirtualMachine): V1Network[] =>
  getNetworks(vm)?.filter(({ name }) => name !== nicName);

export const updateNetworksForDeletion = (
  nicName: string,
  vm: V1VirtualMachine,
  canBeMarkedAbsent: boolean,
): V1Network[] => {
  return canBeMarkedAbsent ? getNetworks(vm) : removeNetworkToBeDeleted(nicName, vm);
};

export const createNetwork = (nicName: string, networkName: string): V1Network => {
  const network: V1Network = {
    name: nicName,
  };

  if (!networkNameStartWithPod(networkName) && networkName) {
    const [namespace, name] = networkName?.split('/');
    network.multus = { networkName: namespace === DEFAULT_NAMESPACE ? networkName : name };
  } else {
    network.pod = {};
  }

  return network;
};

export const createInterface = (
  nicName: string,
  interfaceModel: string,
  interfaceMACAddress: string,
  interfaceType = interfacesTypes.bridge,
): V1Interface => {
  return {
    [interfaceType?.replace('-', '')?.toLowerCase()]: {},
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

export const deleteNetworkInterface = (
  vm: V1VirtualMachine,
  nicName: string,
  nicPresentation: NetworkPresentation,
) => {
  const vmInterfaces = getInterfaces(vm);
  const noAutoAttachPodInterface = getAutoAttachPodInterface(vm) === false;
  const isDefaultInterface = noAutoAttachPodInterface && vmInterfaces?.[0]?.name === nicName;

  const isHotPlug = Boolean(nicPresentation?.iface?.bridge);

  const canBeMarkedAbsent = isHotPlug && !isStopped(vm) && !isDefaultInterface;
  const networks = updateNetworksForDeletion(nicName, vm, canBeMarkedAbsent);
  const interfaces = updateInterfacesForDeletion(nicName, vm, canBeMarkedAbsent);

  return updateVMNetworkInterfaces(vm, networks, interfaces);
};
