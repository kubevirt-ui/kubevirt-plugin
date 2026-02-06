import { isClusterUserDefinedNetwork } from '@kubevirt-utils/utils/typeGuards';

import {
  ClusterUserDefinedNetworkKind,
  UserDefinedNetworkKind,
  UserDefinedNetworkLocalnet,
  UserDefinedNetworkSpec,
} from './types';

export const getNetwork = (
  obj: ClusterUserDefinedNetworkKind | UserDefinedNetworkKind,
): UserDefinedNetworkSpec => {
  if (isClusterUserDefinedNetwork(obj)) {
    return obj?.spec?.network;
  }

  return obj?.spec;
};

export const getMTU = (udn: ClusterUserDefinedNetworkKind | UserDefinedNetworkKind): number => {
  if (isClusterUserDefinedNetwork(udn)) {
    return (
      udn?.spec?.network?.layer2?.mtu ||
      udn?.spec?.network?.layer3?.mtu ||
      udn?.spec?.network?.localnet?.mtu
    );
  }

  return udn?.spec?.layer2?.mtu || udn?.spec?.layer3?.mtu;
};

export const getLocalnet = (cudn: ClusterUserDefinedNetworkKind): UserDefinedNetworkLocalnet =>
  cudn?.spec?.network?.localnet;

export const getVLANID = (cudn: ClusterUserDefinedNetworkKind): number =>
  getLocalnet(cudn)?.vlan?.access?.id;
