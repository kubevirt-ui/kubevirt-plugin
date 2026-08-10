import { type V1Interface, type V1Network } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';

import {
  BRIDGE,
  type MASQUERADE,
  type PASST_BINDING_NAME,
  type SRIOV,
  type UDN_BINDING_NAME,
} from '../constants';

export type NetworkPresentation = {
  iface: V1Interface;
  metadata?: { name?: string };
  network: V1Network;
};

const typeHandler = {
  get(target: TypeMap, prop: string): string {
    return target[prop as keyof TypeMap] ?? target.bridge;
  },
};

const labelHandler = {
  get(target: LabelMap, prop: string): InterfaceTypes {
    return target[prop] ?? BRIDGE;
  },
};

export type InterfaceTypes =
  | typeof BRIDGE
  | typeof MASQUERADE
  | typeof PASST_BINDING_NAME
  | typeof SRIOV
  | typeof UDN_BINDING_NAME;

type LabelMap = { [key: string]: InterfaceTypes };
type TypeMap = { [key in InterfaceTypes]: string };

const types2labels: TypeMap = {
  bridge: 'Bridge',
  l2bridge: 'L2 bridge',
  masquerade: 'Masquerade',
  passt: 'Passt',
  sriov: 'SR-IOV',
};

const labels2types: LabelMap = Object.fromEntries(
  Object.entries(types2labels).map(
    ([type, label]: [InterfaceTypes, string]): [string, InterfaceTypes] => [label, type],
  ),
);

export const interfaceTypesProxy = new Proxy<TypeMap>(types2labels, typeHandler);
export const interfaceLabelsProxy = new Proxy<LabelMap>(labels2types, labelHandler);

export const POD_NETWORK_SORT_KEY = 'pod-network';
