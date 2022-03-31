import { V1Interface, V1Network } from '@kubevirt-ui/kubevirt-api/kubevirt';

export type InterfacesData = {
  iface: V1Interface;
  network: V1Network;
  ipAddresses: string[];
};
