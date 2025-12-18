import React from 'react';
import { TFunction } from 'react-i18next';

import { V1Interface, V1Network, V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import TechPreviewBadge from '@kubevirt-utils/components/TechPreviewBadge/TechPreviewBadge';
import { getInterface, getInterfaces, getNetworks } from '@kubevirt-utils/resources/vm';
import {
  PASST_BINDING_NAME,
  POD_NETWORK,
  UDN_BINDING_NAME,
} from '@kubevirt-utils/resources/vm/utils/constants';
import {
  interfaceLabelsProxy,
  interfaceTypesProxy,
  NetworkPresentation,
} from '@kubevirt-utils/resources/vm/utils/network/constants';
import {
  patchVM,
  removeInterface,
  removeNetwork,
  updateInterface,
} from '@kubevirt-utils/resources/vm/utils/network/patch';
import {
  hasAutoAttachedPodNetwork,
  isPodNetwork,
} from '@kubevirt-utils/resources/vm/utils/network/selectors';
import { NetworkInterfaceState } from '@kubevirt-utils/resources/vm/utils/network/types';
import { kubevirtConsole } from '@kubevirt-utils/utils/utils';
import { ABSENT } from '@virtualmachines/details/tabs/configuration/network/utils/constants';
import { isStopped } from '@virtualmachines/utils';

import { NetworkAttachmentDefinition } from '../components/hooks/types';

export const hasExplicitlyDefinedPodNetwork = (vm: V1VirtualMachine): boolean =>
  !!getNetworks(vm)?.find(isPodNetwork);

export const podNetworkExists = (vm: V1VirtualMachine): boolean =>
  hasExplicitlyDefinedPodNetwork(vm) || hasAutoAttachedPodNetwork(vm);

export const isPodNetworkName = (networkName: string): boolean => networkName === POD_NETWORK;

export const getNetworkName = (network: V1Network): string => {
  if (network) {
    return isPodNetwork(network) ? POD_NETWORK : network?.multus?.networkName;
  }
  return null;
};

/**
 * To delete a hot plug NIC the state of the interface is set to 'absent'. The
 * NIC will then be removed when the VM is live migrated or restarted.
 * @param iface {V1Interface} - the interface to mark as absent
 * @return an interface with the state set to 'absent';
 */
export const markOneInterfaceAbsent = (iface: V1Interface) => ({ ...iface, state: ABSENT });

export const createNetwork = (nicName: string, networkName: string): V1Network => {
  const network: V1Network = {
    name: nicName,
  };

  if (!isPodNetworkName(networkName) && networkName) {
    network.multus = { networkName };
  } else {
    network.pod = {};
  }

  return network;
};

type CreateInterfaceOptions = {
  interfaceLinkState?: NetworkInterfaceState;
  interfaceMACAddress: string;
  interfaceModel: string;
  interfaceType: string;
  nicName: string;
};

export const createInterface = ({
  interfaceLinkState,
  interfaceMACAddress,
  interfaceModel,
  interfaceType = interfaceTypesProxy.bridge,
  nicName,
}: CreateInterfaceOptions): V1Interface => {
  const resolvedInterfaceProp = interfaceLabelsProxy[interfaceType];
  const isBinding =
    resolvedInterfaceProp === UDN_BINDING_NAME || resolvedInterfaceProp === PASST_BINDING_NAME;

  const createdInterface: V1Interface = {
    macAddress: interfaceMACAddress,
    model: interfaceModel,
    name: nicName,
  };

  if (isBinding) {
    createdInterface.binding = { name: resolvedInterfaceProp };
  } else {
    createdInterface.state = interfaceLinkState;
    createdInterface[resolvedInterfaceProp] = {};
  }

  return createdInterface;
};

export const getNadType = (nad: NetworkAttachmentDefinition): string => {
  try {
    const config = JSON.parse(nad?.spec?.config);
    //can be config.type or config.plugin first element only!
    const interfaceType = config?.type || config?.plugins?.[0]?.type;
    return interfaceTypesProxy?.[interfaceType];
  } catch (e) {
    kubevirtConsole.log('Cannot convert NAD config: ', e);
  }
};

export const getNADRole = (nad: NetworkAttachmentDefinition): string => {
  try {
    const config = JSON.parse(nad?.spec?.config);
    return config?.role;
  } catch (e) {
    kubevirtConsole.log('Cannot convert NAD config: ', e);
  }
};

export const deleteNetworkInterface = (
  vm: V1VirtualMachine,
  nicName: string,
  nicPresentation: NetworkPresentation,
) => {
  const existingInterface = getInterface(vm, nicName);
  const existingNetwork = getNetworks(vm).find((net) => net.name === nicName);
  if (!existingInterface || !existingNetwork) {
    return;
  }

  const isHotUnPlug = Boolean(nicPresentation?.iface?.bridge);
  const canBeMarkedAbsent =
    isHotUnPlug && !isStopped(vm) && !isPodNetwork(nicPresentation?.network);

  if (canBeMarkedAbsent) {
    return patchVM(
      vm,
      updateInterface({
        currentValue: existingInterface,
        index: getInterfaces(vm).findIndex((iface) => iface.name === nicName),
        nextValue: markOneInterfaceAbsent(existingInterface),
      }),
    );
  }

  return patchVM(vm, [
    ...removeNetwork({
      index: getNetworks(vm).findIndex((net) => net.name === nicName),
      value: existingNetwork,
    }),
    ...removeInterface({
      index: getInterfaces(vm).findIndex((iface) => iface.name === nicName),
      value: existingInterface,
    }),
  ]);
};

export const getPASSTSelectableOptions = (t: TFunction) => [
  {
    description: t(
      'The default binding. Extends the L2 domain of the user-defined network into the VirtualMachine',
    ),
    id: interfaceTypesProxy.l2bridge,
    title: interfaceTypesProxy.l2bridge,
  },
  {
    description: t(
      'User-space network binding offering a better integration with virtctl ssh and port-forward, network probes, and observability.',
    ),
    id: interfaceTypesProxy.passt,
    title: (
      <>
        {interfaceTypesProxy.passt} <TechPreviewBadge />
      </>
    ),
  },
];
