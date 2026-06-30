import React from 'react';

import { POD_NETWORK } from '@kubevirt-utils/resources/vm';
import { interfaceTypesProxy } from '@kubevirt-utils/resources/vm/utils/network/constants';
import { Label } from '@patternfly/react-core';

import {
  getNadType,
  isNadFullName,
  isNADUsedInVM,
  isOvnOverlayNad,
  isPodNetworkName,
} from '../../utils/helpers';
import { NetworkAttachmentDefinition } from '../hooks/types';

import type {
  BuildNetworkSelectOptionsArgs,
  FilterNADsForSelectArgs,
  GetEditingNetworkOptionIfMissingArgs,
  GetSelectTypeaheadKeyArgs,
  GetShowPodNetworkingOptionArgs,
  NetworkSelectTypeaheadOptionProps,
} from './types';

export const getNadOptionValue = (
  nad: NetworkAttachmentDefinition,
  vmiNamespace: string,
): string => {
  const { name, namespace: nadNamespace } = nad.metadata;
  const fullName = `${nadNamespace}/${name}`;
  return nadNamespace === vmiNamespace ? name : fullName;
};

export const nadMatchesNetworkName = (
  nad: NetworkAttachmentDefinition,
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
  nads: NetworkAttachmentDefinition[],
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
    const [ns, name] = networkName.split('/');
    if (ns === vmiNamespace) {
      return name;
    }
  }

  return networkName;
};

const getNetworkOptionLabel = (networkName: string, vmiNamespace: string): string =>
  isNadFullName(networkName) ? networkName : `${vmiNamespace}/${networkName}`;

export const filterNADsForSelect = ({
  currentlyUsedNADFullNames,
  editInitValueNetworkName,
  isEditing,
  nads,
  vmiNamespace,
}: FilterNADsForSelectArgs): NetworkAttachmentDefinition[] =>
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
}: GetShowPodNetworkingOptionArgs): boolean =>
  !hasPodNetwork || (isEditing && isPodNetworkName(editInitValueNetworkName));

export const getSelectTypeaheadKey = ({
  isEditing,
  loaded,
  selectedFirstOnLoad,
}: GetSelectTypeaheadKeyArgs): string =>
  selectedFirstOnLoad || (isEditing && loaded)
    ? 'select-nad-with-preselect'
    : 'select-nad-without-preselect';

export const getEditingNetworkOptionIfMissing = ({
  editInitValueNetworkName,
  isEditing,
  options,
  selectNetworkName,
  vmiNamespace,
}: GetEditingNetworkOptionIfMissingArgs): NetworkSelectTypeaheadOptionProps | undefined => {
  if (
    !isEditing ||
    !editInitValueNetworkName ||
    !selectNetworkName ||
    isPodNetworkName(editInitValueNetworkName) ||
    options.some((option) => option.value === selectNetworkName)
  ) {
    return undefined;
  }

  const label = getNetworkOptionLabel(editInitValueNetworkName, vmiNamespace);

  return {
    label,
    optionProps: {
      children: (
        <>
          {label} <Label isCompact>{interfaceTypesProxy.bridge} Binding</Label>
        </>
      ),
      key: selectNetworkName,
    },
    type: interfaceTypesProxy.bridge,
    value: selectNetworkName,
  };
};

export const buildNetworkSelectOptions = ({
  createdNetworkOptions,
  editInitValueNetworkName,
  filteredNADs,
  isEditing,
  podNetworkingText,
  podNetworkType,
  selectNetworkName,
  showPodNetworkingOption,
  vmiNamespace,
}: BuildNetworkSelectOptionsArgs): NetworkSelectTypeaheadOptionProps[] => {
  const options: NetworkSelectTypeaheadOptionProps[] = filteredNADs.map((nad) => {
    const { name, namespace: nadNamespace } = nad.metadata;
    const type = getNadType(nad);
    const displayedValue = `${nadNamespace}/${name}`;
    const value = getNadOptionValue(nad, vmiNamespace);

    return {
      label: displayedValue,
      optionProps: {
        children: (
          <>
            {displayedValue} <Label isCompact>{getNadType(nad)} Binding</Label>
          </>
        ),
        key: value,
      },
      type,
      value,
    };
  });

  if (showPodNetworkingOption) {
    options.unshift({
      label: podNetworkingText,
      optionProps: {
        children: (
          <>
            {podNetworkingText} <Label isCompact>{podNetworkType} Binding</Label>
          </>
        ),
        key: POD_NETWORK,
      },
      type: podNetworkType,
      value: POD_NETWORK,
    });
  }

  const editingNetworkOption = getEditingNetworkOptionIfMissing({
    editInitValueNetworkName,
    isEditing,
    options,
    selectNetworkName,
    vmiNamespace,
  });

  if (editingNetworkOption) {
    options.push(editingNetworkOption);
  }

  return [
    ...options,
    ...createdNetworkOptions.filter(({ value }) =>
      options.every((option) => option.value !== value),
    ),
  ];
};
