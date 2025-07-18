import { V1Interface, V1Network, V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';

export type InterfacesData = {
  iface: V1Interface;
  ipAddresses: IpAddresses;
  network: V1Network;
  vm?: V1VirtualMachine;
};

export type IpAddresses = { interfaceName: string; ip: string }[];
