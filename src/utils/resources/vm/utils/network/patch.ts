import { VirtualMachineModel } from 'src/views/dashboard-extensions/utils';

import { V1Interface, V1Network, V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { getCluster } from '@multicluster/helpers/selectors';
import { kubevirtK8sPatch } from '@multicluster/k8sRequests';

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
}): PatchItem<V1Network>[] => {
  const replaceValue: V1Network = { ...currentValue, ...nextValue };

  if (!nextValue.pod) delete replaceValue.pod;
  if (!nextValue.multus) delete replaceValue.multus;

  return [
    {
      op: 'test',
      path: `${NETWORK_PATH}/${index}`,
      value: currentValue,
    },
    {
      op: 'replace',
      path: `${NETWORK_PATH}/${index}`,
      value: replaceValue,
    },
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
}): PatchItem<V1Interface>[] => {
  const replaceValue: V1Interface = { ...currentValue, ...nextValue };

  if (!nextValue.bridge) delete replaceValue.bridge;
  if (!nextValue.masquerade) delete replaceValue.masquerade;
  if (!nextValue.sriov) delete replaceValue.sriov;

  return [
    {
      op: 'test',
      path: `${INTERFACE_PATH}/${index}`,
      value: currentValue,
    },
    {
      op: 'replace',
      path: `${INTERFACE_PATH}/${index}`,
      value: replaceValue,
    },
  ];
};

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
  kubevirtK8sPatch({
    cluster: getCluster(vm),
    data: items,
    model: VirtualMachineModel,
    resource: vm,
  });
