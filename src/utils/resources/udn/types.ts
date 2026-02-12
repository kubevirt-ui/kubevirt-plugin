import { K8sResourceKind, Selector } from '@openshift-console/dynamic-plugin-sdk';

import { IPAM_MODE_DISABLED, UDNRole, VLAN_MODE_ACCESS } from './constants';

export type UserDefinedNetworkAnnotations = {
  description?: string;
};

export type UserDefinedNetworkLocalnet = {
  ipam?: {
    lifecycle?: string;
    mode: typeof IPAM_MODE_DISABLED;
  };
  mtu?: number;
  physicalNetworkName: string;
  role: UDNRole;
  subnets?: UserDefinedNetworkSubnet[];
  vlan?: {
    access?: { id?: number };
    mode?: typeof VLAN_MODE_ACCESS;
  };
};

export type UserDefinedNetworkLayer2 = {
  ipam?: {
    lifecycle?: string;
    mode: typeof IPAM_MODE_DISABLED;
  };
  joinSubnets?: string[];
  mtu?: number;
  role: UDNRole;
  subnets?: string[];
};

export type UserDefinedNetworkLayer3Subnet = {
  cidr: string;
  hostSubnet?: number;
};

export type UserDefinedNetworkSubnet = string | UserDefinedNetworkLayer3Subnet;

export type UserDefinedNetworkLayer3 = {
  joinSubnets?: string[];
  mtu?: number;
  role: string;
  subnets?: UserDefinedNetworkLayer3Subnet[];
};

export type ClusterUserDefinedNetworkSpec = {
  namespaceSelector?: Selector;
  network?: UserDefinedNetworkSpec;
};

export type UserDefinedNetworkSpec = {
  layer2?: UserDefinedNetworkLayer2;
  layer3?: UserDefinedNetworkLayer3;
  localnet?: UserDefinedNetworkLocalnet;
  topology: string;
};

export type ClusterUserDefinedNetworkKind = {
  spec?: ClusterUserDefinedNetworkSpec;
} & K8sResourceKind;

export type UserDefinedNetworkKind = {
  spec?: UserDefinedNetworkSpec;
} & K8sResourceKind;
