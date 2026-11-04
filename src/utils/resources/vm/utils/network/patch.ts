import { type V1Interface, type V1Network } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { type Patch } from '@openshift-console/dynamic-plugin-sdk';

export const NETWORK_PATH = '/spec/template/spec/networks';
export const INTERFACE_PATH = '/spec/template/spec/domain/devices/interfaces';

export const addNetwork = ({ index, value }: { index: number; value: V1Network }): Patch[] =>
  appendWithIndex({ index, path: NETWORK_PATH, value });

export const addInterface = ({ index, value }: { index: number; value: V1Interface }): Patch[] =>
  appendWithIndex({ index, path: INTERFACE_PATH, value });

export const appendWithIndex = <T>({
  index,
  path,
  value,
}: {
  index: number;
  path: string;
  value: T;
}): Patch[] => [
  ...(index === 0
    ? [
        { op: 'test', path, value: null },
        { op: 'add', path, value: [] },
      ]
    : []),
  { op: 'add', path: `${path}/-`, value },
];

export const updateNetwork = ({
  currentValue,
  index,
  nextValue,
}: {
  currentValue: V1Network;
  index: number;
  nextValue: V1Network;
}): Patch[] => {
  const replaceValue: V1Network = { ...currentValue, ...nextValue };
  if (!nextValue.pod) delete replaceValue.pod;
  if (!nextValue.multus) delete replaceValue.multus;
  return [
    { op: 'test', path: `${NETWORK_PATH}/${index}`, value: currentValue },
    { op: 'replace', path: `${NETWORK_PATH}/${index}`, value: replaceValue },
  ];
};

export const updateInterface = ({
  currentValue,
  index,
  nextValue,
}: {
  currentValue: V1Interface;
  index: number;
  nextValue: V1Interface;
}): Patch[] => {
  const replaceValue: V1Interface = { ...currentValue, ...nextValue };
  if (!nextValue.bridge) delete replaceValue.bridge;
  if (!nextValue.masquerade) delete replaceValue.masquerade;
  if (!nextValue.sriov) delete replaceValue.sriov;
  if (!nextValue.binding) delete replaceValue.binding;
  if (!nextValue.passtBinding) delete replaceValue.passtBinding;
  return [
    { op: 'test', path: `${INTERFACE_PATH}/${index}`, value: currentValue },
    { op: 'replace', path: `${INTERFACE_PATH}/${index}`, value: replaceValue },
  ];
};

export const removeNetwork = ({ index, value }: { index: number; value: V1Network }): Patch[] =>
  removeAtIndex({ index, path: NETWORK_PATH, value });

export const removeInterface = ({ index, value }: { index: number; value: V1Interface }): Patch[] =>
  removeAtIndex({ index, path: INTERFACE_PATH, value });

export const removeAtIndex = <T>({
  index,
  path,
  value,
}: {
  index: number;
  path: string;
  value: T;
}): Patch[] => [
  { op: 'test', path: `${path}/${index}`, value },
  { op: 'remove', path: `${path}/${index}`, value: undefined },
];
