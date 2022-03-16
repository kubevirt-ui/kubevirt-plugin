import { TFunction } from 'i18next';
import { adjectives, animals, uniqueNamesGenerator } from 'unique-names-generator';

import { V1Network, V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';

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

export const getNetworkName = (network: V1Network, t: TFunction): string =>
  network.pod ? t('Pod networking') : network.multus?.networkName;
