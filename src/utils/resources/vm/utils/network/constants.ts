import { V1Interface, V1Network } from '@kubevirt-ui/kubevirt-api/kubevirt';

export type NetworkPresentation = {
  iface: V1Interface;
  network: V1Network;
};

export const interfacesTypes = {
  bridge: 'Bridge',
  masquerade: 'Masquerade',
  sriov: 'SR-IOV',
};
