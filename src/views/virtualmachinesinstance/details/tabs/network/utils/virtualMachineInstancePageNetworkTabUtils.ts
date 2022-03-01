import { V1Interface, V1Network } from '@kubevirt-ui/kubevirt-api/kubevirt';

export type NetworkPresentation = {
  iface: V1Interface;
  network: V1Network;
};
