/* eslint-disable require-jsdoc */
import { V1Interface, V1Network } from '@kubevirt-ui/kubevirt-api/kubevirt';

import { UDN_BINDING_NAME } from '../constants';

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
  [UDN_BINDING_NAME]: 'L2 bridge',
};

export const interfacesTypes = new Proxy(types, typeHandler);
