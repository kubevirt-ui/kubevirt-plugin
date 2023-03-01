import produce from 'immer';
import { adjectives, animals, uniqueNamesGenerator } from 'unique-names-generator';

import { V1Interface, V1Network, V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { t } from '@kubevirt-utils/hooks/useKubevirtTranslation';

export const generateNicName = () => {
  return `nic-${uniqueNamesGenerator({
    dictionaries: [adjectives, animals],
    separator: '-',
  })}`;
};

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

export const updateVMNetworkInterface = (
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

export const createNetwork = (nicName: string, networkName: string): V1Network => {
  const network: V1Network = {
    name: nicName,
  };

  if (!networkNameStartWithPod(networkName) && networkName) {
    network.multus = { networkName };
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
    name: nicName,
    model: interfaceModel,
    macAddress: interfaceMACAddress,
    [interfaceType]: {},
  };
};
