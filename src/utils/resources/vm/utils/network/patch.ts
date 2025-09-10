import { VirtualMachineModel } from 'src/views/dashboard-extensions/utils';

import { V1Interface, V1Network, V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { k8sPatch } from '@openshift-console/dynamic-plugin-sdk';

export type PatchItem<T> = {
  op: 'add' | 'remove' | 'replace' | 'test';
  path: string;
  value: T;
};

export const NETWORK_PATH = '/spec/template/spec/networks';
export const INTERFACE_PATH = '/spec/template/spec/domain/devices/interfaces';

export const addNetwork = ({
  index,
  value,
}: {
  index: number;
  value: V1Network;
}): PatchItem<V1Network>[] => appendWithIndex({ index, path: NETWORK_PATH, value });

export const addInterface = ({
  index,
  value,
}: {
  index: number;
  value: V1Interface;
}): PatchItem<V1Interface>[] => appendWithIndex({ index, path: INTERFACE_PATH, value });

export const appendWithIndex = <T>({
  index,
  path,
  value,
}: {
  index: number;
  path: string;
  value: T;
}): PatchItem<T>[] => [
  ...(index === 0
    ? [
        // index based add will fail if array does not exist
        {
          op: 'test',
          path,
          value: null,
        } as PatchItem<T>,
        {
          op: 'add',
          path,
          value: [],
        } as PatchItem<T>,
      ]
    : []),
  {
    op: 'add',
    path: `${path}/-`,
    value,
  },
];

export const updateNetwork = ({
  currentValue,
  index,
  nextValue,
}: {
  currentValue: V1Network;
  index: number;
  nextValue: V1Network;
}): PatchItem<V1Network>[] =>
  mergeAndUpdateAtIndex({ currentValue, index, nextValue, path: NETWORK_PATH });

export const updateInterface = ({
  currentValue,
  index,
  nextValue,
}: {
  currentValue: V1Interface;
  index: number;
  nextValue: V1Interface;
}): PatchItem<V1Interface>[] =>
  mergeAndUpdateAtIndex({ currentValue, index, nextValue, path: INTERFACE_PATH });

export const mergeAndUpdateAtIndex = <T>({
  currentValue,
  index,
  nextValue,
  path,
}: {
  currentValue: T;
  index: number;
  nextValue: T;
  path: string;
}): PatchItem<T>[] => [
  {
    op: 'test',
    path: `${path}/${index}`,
    value: currentValue,
  },
  {
    op: 'replace',
    path: `${path}/${index}`,
    value: { ...currentValue, ...nextValue },
  },
];

export const removeNetwork = ({
  index,
  value,
}: {
  index: number;
  value: V1Network;
}): PatchItem<V1Network>[] => removeAtIndex({ index, path: NETWORK_PATH, value });

export const removeInterface = ({
  index,
  value,
}: {
  index: number;
  value: V1Interface;
}): PatchItem<V1Interface>[] => removeAtIndex({ index, path: INTERFACE_PATH, value });

export const removeAtIndex = <T>({
  index,
  path,
  value,
}: {
  index: number;
  path: string;
  value: T;
}): PatchItem<T>[] => [
  {
    op: 'test',
    path: `${path}/${index}`,
    value,
  },
  {
    op: 'remove',
    path: `${path}/${index}`,
    value: undefined,
  },
];

export const patchVM = (vm: V1VirtualMachine, items: PatchItem<unknown>[]) =>
  k8sPatch({
    data: items,
    model: VirtualMachineModel,
    resource: vm,
  });
