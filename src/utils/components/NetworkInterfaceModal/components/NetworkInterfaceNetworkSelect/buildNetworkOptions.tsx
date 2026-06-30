import React from 'react';

import { POD_NETWORK } from '@kubevirt-utils/resources/vm';
import { interfaceTypesProxy } from '@kubevirt-utils/resources/vm/utils/network/constants';
import { Label } from '@patternfly/react-core';

import { getNadType, isNadFullName, isPodNetworkName } from '../../utils/helpers';
import { getNadOptionValue } from './editNetworkSelectUtils';
import type {
  BuildNetworkSelectOptionsArgs,
  GetEditingNetworkOptionIfMissingArgs,
  NetworkSelectTypeaheadOptionProps,
} from './types';

const getNetworkOptionLabel = (networkName: string, vmiNamespace: string): string =>
  isNadFullName(networkName) ? networkName : `${vmiNamespace}/${networkName}`;

export const getEditingNetworkOptionIfMissing = ({
  editInitValueNetworkName,
  isEditing,
  options,
  selectNetworkName,
  t,
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
          {label}{' '}
          <Label isCompact>
            {interfaceTypesProxy.bridge} {t('Binding')}
          </Label>
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
  t,
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
            {displayedValue}{' '}
            <Label isCompact>
              {getNadType(nad)} {t('Binding')}
            </Label>
          </>
        ),
        key: value,
      },
      type,
      value,
    };
  });

  options.sort((a, b) =>
    (a.label ?? '').localeCompare(b.label ?? '', undefined, { numeric: true }),
  );

  if (showPodNetworkingOption) {
    options.unshift({
      label: podNetworkingText,
      optionProps: {
        children: (
          <>
            {podNetworkingText}{' '}
            <Label isCompact>
              {podNetworkType} {t('Binding')}
            </Label>
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
    t,
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
