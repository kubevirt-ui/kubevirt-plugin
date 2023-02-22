import { TFunction } from 'i18next';
import produce from 'immer';
import { adjectives, animals, uniqueNamesGenerator } from 'unique-names-generator';

import { V1Interface, V1Network, V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';

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

export const getNetworkName = (network: V1Network, t: TFunction): string =>
  network.pod ? t('Pod networking') : network.multus?.networkName;
