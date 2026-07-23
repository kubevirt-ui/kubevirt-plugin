import { K8sResourceKind } from '@openshift-console/dynamic-plugin-sdk';

import { NADTopology } from './constants';

// The config is a JSON object with the NetworkAttachmentDefinitionConfig type stored as a string
export type NetworkAttachmentDefinitionSpec = {
  config: string;
};

export type NetworkAttachmentDefinitionKind = {
  spec?: NetworkAttachmentDefinitionSpec;
} & K8sResourceKind;

type IPAMConfig = {
  dataDir?: string;
  subnet?: string;
  type?: string;
};

type NetworkAttachmentDefinitionPlugin = {
  [key: string]: any;
};

export type NetworkAttachmentDefinitionConfig = {
  bridge?: string;
  cniVersion: string;
  excludeSubnets?: string;
  ipam?: IPAMConfig;
  isGateway?: true;
  macspoofchk?: boolean;
  mtu?: number;
  name: string;
  netAttachDefName?: string;
  plugins?: NetworkAttachmentDefinitionPlugin[];
  preserveDefaultVlan?: boolean;
  role?: string;
  subnets?: string;
  topology?: NADTopology;
  type?: string;
  vlan?: number;
  vlanID?: number;
};
