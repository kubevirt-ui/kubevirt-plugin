import { V1Interface, V1Network } from '@kubevirt-ui/kubevirt-api/kubevirt';

export type InterfacesData = {
  iface: V1Interface;
  ipAddresses: string[];
  network: V1Network;
};
