import { NADTopology } from './constants';

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
