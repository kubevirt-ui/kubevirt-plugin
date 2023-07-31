/* eslint-disable require-jsdoc */
import { V1Interface, V1Network } from '@kubevirt-ui/kubevirt-api/kubevirt';

export type NetworkPresentation = {
  iface: V1Interface;
  network: V1Network;
};

const typeHandler = {
  get(target, prop) {
    return target[prop] ?? target.bridge;
  },
};

const types = {
  bridge: 'Bridge',
  masquerade: 'Masquerade',
  sriov: 'SR-IOV',
};

export const interfacesTypes = new Proxy(types, typeHandler);
