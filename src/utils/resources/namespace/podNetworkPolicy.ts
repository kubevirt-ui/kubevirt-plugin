import produce from 'immer';

import { type V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { getPodNetworkName } from '@kubevirt-utils/resources/vm/utils/network/selectors';
import { removePodNetworkFromVM } from '@kubevirt-utils/resources/vm/utils/network/utils';
import {
  getAutoAttachPodInterface,
  getInterfaces,
  getNetworks,
} from '@kubevirt-utils/resources/vm/utils/selectors';
import { type Patch } from '@openshift-console/dynamic-plugin-sdk';

const getRemovalPatch = (
  entries: { name: string }[] | undefined,
  nameToRemove: string | undefined,
  path: string,
): Patch[] => {
  if (nameToRemove === undefined) return [];

  const removalIndex = entries?.findIndex((entry) => entry.name === nameToRemove) ?? -1;
  const hasEntryToRemove = removalIndex >= 0;

  if (!hasEntryToRemove) return [];

  return [
    {
      op: 'test',
      path: `${path}/${removalIndex}/name`,
      value: nameToRemove,
    },
    { op: 'remove', path: `${path}/${removalIndex}` },
  ];
};

export const applyProjectPodNetworkPolicy = (
  vm: V1VirtualMachine,
  isPodNetworkAllowed: boolean,
): V1VirtualMachine => {
  if (isPodNetworkAllowed) return vm;

  const isPodNetworkRemoved = !getPodNetworkName(vm) && getAutoAttachPodInterface(vm) === false;

  if (isPodNetworkRemoved) return vm;

  return produce(vm, (draft) => removePodNetworkFromVM(draft));
};

export const getProjectPodNetworkPatches = (
  vm: V1VirtualMachine,
  isPodNetworkAllowed: boolean,
): Patch[] => {
  if (isPodNetworkAllowed) return [];

  const podNetworkName = getPodNetworkName(vm);
  const networkPatches = getRemovalPatch(
    getNetworks(vm),
    podNetworkName,
    '/spec/template/spec/networks',
  );
  const interfacePatches = getRemovalPatch(
    getInterfaces(vm),
    podNetworkName,
    '/spec/template/spec/domain/devices/interfaces',
  );
  const autoAttachPodInterface = getAutoAttachPodInterface(vm);
  const autoAttachPatch: Patch[] =
    autoAttachPodInterface === false
      ? []
      : [
          {
            op: autoAttachPodInterface === undefined ? 'add' : 'replace',
            path: '/spec/template/spec/domain/devices/autoattachPodInterface',
            value: false,
          },
        ];

  return [...networkPatches, ...interfacePatches, ...autoAttachPatch];
};
