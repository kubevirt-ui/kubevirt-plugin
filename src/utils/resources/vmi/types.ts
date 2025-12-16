import {
  V1Interface,
  V1Network,
  V1VirtualMachineInstanceNetworkInterface,
} from '@kubevirt-ui-ext/kubevirt-api/kubevirt';

export type VMINetworkPresentation = {
  iface?: V1Interface;
  network?: V1Network;
  status?: V1VirtualMachineInstanceNetworkInterface;
};
