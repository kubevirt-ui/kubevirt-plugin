import React from 'react';
import { TFunction } from 'react-i18next';

import { V1Interface, V1Network, V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import TechPreviewBadge from '@kubevirt-utils/components/TechPreviewBadge/TechPreviewBadge';
import { getName, getNamespace } from '@kubevirt-utils/resources/shared';
import { getInterface, getInterfaces, getNetworks } from '@kubevirt-utils/resources/vm';
import {
  NAD_TYPE_OVN_K8S_CNI_OVERLAY,
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
import { NetworkAttachmentDefinitionKind } from '@overview/OverviewTab/inventory-card/utils/types';
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

type NADTypes = NetworkAttachmentDefinition | NetworkAttachmentDefinitionKind;

export const parseNADConfig = (nad?: NADTypes): Record<string, any> => {
  if (!nad?.spec?.config) return {};

  try {
    return JSON.parse(nad.spec.config);
  } catch (e) {
    kubevirtConsole.log('Cannot parse NAD config: ', e);
    return {};
  }
};

const getRawNadConfigType = (nad: NetworkAttachmentDefinition): string | undefined => {
  const config = parseNADConfig(nad);
  //can be config.type or config.plugin first element only!
  return config?.type || config?.plugins?.[0]?.type;
};

export const getNadType = (nad: NetworkAttachmentDefinition): string => {
  const rawType = getRawNadConfigType(nad);
  return interfaceTypesProxy?.[rawType];
};

export const getNADRole = (nad: NetworkAttachmentDefinition): string => {
  const config = parseNADConfig(nad);
  return config?.role;
};

export const getNadFullName = ({ name, namespace }: { name: string; namespace: string }) =>
  `${namespace}/${name}`;

export const getNameAndNs = (nad: NetworkAttachmentDefinition) => ({
  name: getName(nad) ?? '',
  namespace: getNamespace(nad) ?? '',
});

export const isNadFullName = (name: string) => name?.split('/').length === 2;

export const isNADUsedInVM = (
  nad: NetworkAttachmentDefinition,
  currentlyUsedNADsNames: string[],
): boolean => {
  const nadFullName = getNadFullName(getNameAndNs(nad));
  return currentlyUsedNADsNames.includes(nadFullName);
};

export const isOvnOverlayNad = (nad: NetworkAttachmentDefinition): boolean => {
  const rawType = getRawNadConfigType(nad);
  return rawType === NAD_TYPE_OVN_K8S_CNI_OVERLAY;
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
