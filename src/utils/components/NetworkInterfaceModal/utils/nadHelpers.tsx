import React from 'react';
import { type TFunction } from 'i18next';

import { type V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import TechPreviewBadge from '@kubevirt-utils/components/TechPreviewBadge/TechPreviewBadge';
import {
  type NetworkAttachmentDefinitionConfig,
  type NetworkAttachmentDefinitionKind,
} from '@kubevirt-utils/resources/nad/types';
import { getName, getNamespace } from '@kubevirt-utils/resources/shared';
import { getInterface, getInterfaces, getNetworks } from '@kubevirt-utils/resources/vm';
import { NAD_TYPE_OVN_K8S_CNI_OVERLAY } from '@kubevirt-utils/resources/vm/utils/constants';
import {
  interfaceTypesProxy,
  type NetworkPresentation,
} from '@kubevirt-utils/resources/vm/utils/network/constants';
import {
  patchVM,
  removeInterface,
  removeNetwork,
  updateInterface,
} from '@kubevirt-utils/resources/vm/utils/network/patch';
import { isPodNetwork } from '@kubevirt-utils/resources/vm/utils/network/selectors';
import { kubevirtConsole } from '@kubevirt-utils/utils/utils';
import { isStopped } from '@virtualmachines/utils';

import { markOneInterfaceAbsent } from './networkInterfaceHelpers';

export const parseNADConfig = (
  nad?: NetworkAttachmentDefinitionKind,
): NetworkAttachmentDefinitionConfig | null => {
  if (!nad?.spec?.config) return null;

  try {
    return JSON.parse(nad.spec.config) as NetworkAttachmentDefinitionConfig;
  } catch (error) {
    kubevirtConsole.log('Cannot parse NAD config: ', error);
    return null;
  }
};

const getRawNadConfigType = (nad: NetworkAttachmentDefinitionKind): string | undefined => {
  const config = parseNADConfig(nad);
  return config?.type ?? config?.plugins?.[0]?.type;
};

export const getNadType = (nad: NetworkAttachmentDefinitionKind): string =>
  interfaceTypesProxy?.[getRawNadConfigType(nad)];

export const getNADRole = (nad: NetworkAttachmentDefinitionKind): string | undefined => {
  const config = parseNADConfig(nad);
  return config?.role;
};

export const getNadFullName = ({ name, namespace }: { name: string; namespace: string }): string =>
  `${namespace}/${name}`;

export const getNameAndNs = (
  nad: NetworkAttachmentDefinitionKind,
): { name: string; namespace: string } => ({
  name: getName(nad) ?? '',
  namespace: getNamespace(nad) ?? '',
});

export const isNadFullName = (name: string): boolean => name?.split('/').length === 2;

export const isNADUsedInVM = (
  nad: NetworkAttachmentDefinitionKind,
  currentlyUsedNADsNames: string[],
): boolean => {
  const nadFullName = getNadFullName(getNameAndNs(nad));
  return currentlyUsedNADsNames.includes(nadFullName);
};

export const isOvnOverlayNad = (nad: NetworkAttachmentDefinitionKind): boolean =>
  getRawNadConfigType(nad) === NAD_TYPE_OVN_K8S_CNI_OVERLAY;

export const deleteNetworkInterface = (
  vm: V1VirtualMachine,
  nicName: string,
  nicPresentation: NetworkPresentation,
): Promise<V1VirtualMachine> | undefined => {
  const existingInterface = getInterface(vm, nicName);
  const existingNetwork = getNetworks(vm).find((net) => net.name === nicName);
  if (!existingInterface || !existingNetwork) {
    return;
  }

  const isHotUnPlug = Boolean(nicPresentation?.iface?.bridge);
  const canBeMarkedAbsent =
    isHotUnPlug && !isStopped(vm) && !isPodNetwork(nicPresentation?.network);

  if (canBeMarkedAbsent) {
    return patchVM(
      vm,
      updateInterface({
        currentValue: existingInterface,
        index: getInterfaces(vm).findIndex((iface) => iface.name === nicName),
        nextValue: markOneInterfaceAbsent(existingInterface),
      }),
    );
  }

  return patchVM(vm, [
    ...removeNetwork({
      index: getNetworks(vm).findIndex((net) => net.name === nicName),
      value: existingNetwork,
    }),
    ...removeInterface({
      index: getInterfaces(vm).findIndex((iface) => iface.name === nicName),
      value: existingInterface,
    }),
  ]);
};

export const getPASSTSelectableOptions = (
  t: TFunction,
): { description: string; id: string; title: React.ReactNode }[] => [
  {
    description: t(
      'The default binding. Extends the L2 domain of the user-defined network into the VirtualMachine',
    ),
    id: interfaceTypesProxy.l2bridge,
    title: interfaceTypesProxy.l2bridge,
  },
  {
    description: t(
      'User-space network binding offering a better integration with virtctl ssh and port-forward, network probes, and observability.',
    ),
    id: interfaceTypesProxy.passt,
    title: (
      <>
        {interfaceTypesProxy.passt} <TechPreviewBadge />
      </>
    ),
  },
];
