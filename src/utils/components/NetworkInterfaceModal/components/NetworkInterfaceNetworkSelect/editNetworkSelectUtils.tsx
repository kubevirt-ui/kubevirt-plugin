import { type V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { type NetworkAttachmentDefinitionKind } from '@kubevirt-utils/resources/nad/types';
import { getNamespace } from '@kubevirt-utils/resources/shared';
import { getNetworks } from '@kubevirt-utils/resources/vm';

import {
  getNadFullName,
  isNadFullName,
  isNADUsedInVM,
  isOvnOverlayNad,
  isPodNetworkName,
} from '../../utils/helpers';
import type {
  FilterNADsForSelectArgs,
  GetSelectTypeaheadKeyArgs,
  GetShowPodNetworkingOptionArgs,
} from './types';

export const getNadOptionValue = (
  nad: NetworkAttachmentDefinitionKind,
  vmiNamespace: string,
): string => {
  const { name, namespace: nadNamespace } = nad.metadata;
  const fullName = `${nadNamespace}/${name}`;
  return nadNamespace === vmiNamespace ? name : fullName;
};

export const nadMatchesNetworkName = (
  nad: NetworkAttachmentDefinitionKind,
  networkName: string,
  vmiNamespace: string,
): boolean => {
  if (!networkName) {
    return false;
  }

  const { name, namespace: nadNamespace } = nad.metadata;
  const fullName = `${nadNamespace}/${name}`;
  const optionValue = getNadOptionValue(nad, vmiNamespace);

  return (
    networkName === optionValue ||
    networkName === fullName ||
    (networkName === name && nadNamespace === vmiNamespace)
  );
};

export const getSelectNetworkName = (
  networkName: string,
  nads: NetworkAttachmentDefinitionKind[],
  vmiNamespace: string,
): string => {
  if (!networkName) {
    return networkName;
  }

  const matchingNad = nads?.find((nad) => nadMatchesNetworkName(nad, networkName, vmiNamespace));
  if (matchingNad) {
    return getNadOptionValue(matchingNad, vmiNamespace);
  }

  if (isNadFullName(networkName)) {
    const [nadNamespace, name] = networkName.split('/');
    if (nadNamespace === vmiNamespace) {
      return name;
    }
  }

  return networkName;
};

export const filterNADsForSelect = ({
  currentlyUsedNADFullNames,
  editInitValueNetworkName,
  isEditing,
  nads,
  vmiNamespace,
}: FilterNADsForSelectArgs): NetworkAttachmentDefinitionKind[] =>
  nads?.filter((nad) => {
    if (
      isEditing &&
      editInitValueNetworkName &&
      nadMatchesNetworkName(nad, editInitValueNetworkName, vmiNamespace)
    ) {
      return true;
    }

    const isNADInUse = isNADUsedInVM(nad, currentlyUsedNADFullNames);
    return !isNADInUse || !isOvnOverlayNad(nad);
  }) ?? [];

export const getShowPodNetworkingOption = ({
  editInitValueNetworkName,
  hasPodNetwork,
  isEditing,
  isIPv6SingleStack,
  isPodNetworkAllowed = true,
}: GetShowPodNetworkingOptionArgs): boolean => {
  if (isIPv6SingleStack || !isPodNetworkAllowed) {
    return false;
  }

  return !hasPodNetwork || (isEditing && isPodNetworkName(editInitValueNetworkName));
};

export const getSelectTypeaheadKey = ({
  isEditing,
  loaded,
  selectedFirstOnLoad,
}: GetSelectTypeaheadKeyArgs): string =>
  selectedFirstOnLoad || (isEditing && loaded)
    ? 'select-nad-with-preselect'
    : 'select-nad-without-preselect';

export const getCurrentlyUsedNADFullNames = (vm: V1VirtualMachine): string[] =>
  getNetworks(vm)
    ?.map((network) => network?.multus?.networkName)
    .filter((name): name is string => Boolean(name))
    .map((name) =>
      isNadFullName(name) ? name : getNadFullName({ name, namespace: getNamespace(vm) }),
    ) ?? [];

export { buildNetworkSelectOptions, getEditingNetworkOptionIfMissing } from './buildNetworkOptions';
