import { VirtualMachineModel } from 'src/views/dashboard-extensions/utils';

import { V1Interface, V1Network, V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { k8sPatch } from '@openshift-console/dynamic-plugin-sdk';

import { BRIDGE, MASQUERADE, SRIOV } from '../constants';

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
  const patches: PatchItem<unknown>[] = [
    {
      op: 'test',
      path: `${NETWORK_PATH}/${index}`,
      value: currentValue,
    },
  ];

  // If switching network types (multus <-> pod), remove the old type first
  const isCurrentPod = Boolean(currentValue.pod);
  const isNextPod = Boolean(nextValue.pod);
  const isCurrentMultus = Boolean(currentValue.multus);
  const isNextMultus = Boolean(nextValue.multus);

  // Create a clean network object with only the new type property
  const cleanNextValue: V1Network = {
    name: nextValue.name,
  };

  if (isNextPod) {
    cleanNextValue.pod = nextValue.pod;
  } else if (isNextMultus) {
    cleanNextValue.multus = nextValue.multus;
  }

  if (isCurrentPod && isNextMultus) {
    // Switching from pod to multus - remove pod property
    patches.push({
      op: 'remove',
      path: `${NETWORK_PATH}/${index}/pod`,
      value: undefined,
    });
  } else if (isCurrentMultus && isNextPod) {
    // Switching from multus to pod - remove multus property
    patches.push({
      op: 'remove',
      path: `${NETWORK_PATH}/${index}/multus`,
      value: undefined,
    });
  }

  // Replace the network with the clean new value
  patches.push({
    op: 'replace',
    path: `${NETWORK_PATH}/${index}`,
    value: cleanNextValue,
  });

  return patches as PatchItem<V1Network>[];
};

/**
 * Removes all interface type properties (bridge, masquerade, sriov) and binding property
 * from an interface object. This is used when updating interfaces to prevent conflicts
 * when switching between different interface types.
 * @param iface - Interface to clean
 * @returns Cleaned interface without type properties
 */
const removeInterfaceTypeProperties = (iface: V1Interface): V1Interface => {
  const cleaned = { ...iface };
  const interfaceTypeProperties = [BRIDGE, MASQUERADE, SRIOV];

  for (const prop of interfaceTypeProperties) {
    delete cleaned[prop];
  }

  delete cleaned.binding;

  return cleaned;
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
  // Remove all old interface type properties from currentValue before merging
  const cleanedCurrentValue = removeInterfaceTypeProperties(currentValue);

  // Test against original currentValue, but replace with merged cleaned value
  return [
    {
      op: 'test',
      path: `${INTERFACE_PATH}/${index}`,
      value: currentValue,
    },
    {
      op: 'replace',
      path: `${INTERFACE_PATH}/${index}`,
      value: { ...cleanedCurrentValue, ...nextValue },
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
  k8sPatch({
    data: items,
    model: VirtualMachineModel,
    resource: vm,
  });
