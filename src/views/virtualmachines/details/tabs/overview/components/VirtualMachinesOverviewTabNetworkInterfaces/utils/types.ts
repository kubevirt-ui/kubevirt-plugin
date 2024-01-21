import { V1Interface, V1Network } from '@kubevirt-ui/kubevirt-api/kubevirt';

export type InterfacesData = {
  iface: V1Interface;
  ipAddresses: IpAddresses;
  network: V1Network;
};

export type IpAddresses = { interfaceName: string; ip: string }[];
