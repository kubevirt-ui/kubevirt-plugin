/* eslint-disable require-jsdoc */
import { V1Interface, V1Network } from '@kubevirt-ui/kubevirt-api/kubevirt';

import { UDN_BINDING_NAME } from '../constants';

export type NetworkPresentation = {
  iface: V1Interface;
  network: V1Network;
};

const typeHandler = {
  get(target: TypeMap, prop: string) {
    return target[prop] ?? target.bridge;
  },
};

const labelHandler = {
  get(target: LabelMap, prop: string) {
    return target[prop] ?? 'bridge';
  },
};

export type InterfaceTypes = 'bridge' | 'masquerade' | 'sriov' | typeof UDN_BINDING_NAME;
type LabelMap = { [key: string]: InterfaceTypes };
type TypeMap = { [key in InterfaceTypes]: string };

const types2labels: TypeMap = {
  bridge: 'Bridge',
  masquerade: 'Masquerade',
  sriov: 'SR-IOV',
  [UDN_BINDING_NAME]: 'L2 bridge',
};

const labels2types: LabelMap = Object.fromEntries(
  Object.entries(types2labels).map(
    ([type, label]: [InterfaceTypes, string]): [string, InterfaceTypes] => [label, type],
  ),
);

export const interfacesTypes = new Proxy<TypeMap>(types2labels, typeHandler);
export const interfaceLabels = new Proxy<LabelMap>(labels2types, labelHandler);

export const PRIMARY_UDN_BINDING = 'primary-udn-kubevirt-binding';
