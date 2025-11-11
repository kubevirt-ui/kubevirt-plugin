import React from 'react';
import { TFunction } from 'react-i18next';

import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { getName, getNamespace } from '@kubevirt-utils/resources/shared';
import { getNetworks, POD_NETWORK } from '@kubevirt-utils/resources/vm';
import { interfaceTypesProxy } from '@kubevirt-utils/resources/vm/utils/network/constants';
import { getDNS1120LabelError } from '@kubevirt-utils/utils/validation';
import { HelperText, HelperTextItem, Label, SelectOptionProps } from '@patternfly/react-core';
import { InfoIcon } from '@patternfly/react-icons';

import { getNadType, getNetworkName, isPodNetworkName } from '../../utils/helpers';
import { NetworkAttachmentDefinition } from '../hooks/types';

import { NetworkSelectTypeaheadOptionProps } from './NetworkInterfaceNetworkSelect';

// ============================================================================
// Network Name Parsing Utilities
// ============================================================================

export type ParsedNetworkName = {
  fullName: string;
  isNamespaced: boolean;
  nameOnly: string;
  namespace: string;
};

/**
 * Parses a network name into its components
 * @param networkName - Network name (can be "name" or "namespace/name")
 * @param defaultNamespace - Default namespace to use if network name is not namespaced
 * @returns Parsed network name components
 */
export const parseNetworkName = (
  networkName: null | string | undefined,
  defaultNamespace: string,
): null | ParsedNetworkName => {
  if (!networkName) return null;

  const isNamespaced = networkName.includes('/');
  const nameOnly = isNamespaced ? networkName.split('/')[1] : networkName;
  const namespace = isNamespaced ? networkName.split('/')[0] : defaultNamespace;

  return {
    fullName: networkName,
    isNamespaced,
    nameOnly,
    namespace,
  };
};

/**
 * Gets the original network name from VM when editing
 * @param vm - VirtualMachine instance
 * @param nicName - Name of the network interface
 * @returns Original network name or null
 */
export const getOriginalNetworkName = (vm: V1VirtualMachine, nicName?: string): null | string => {
  if (!nicName) return null;
  const network = getNetworks(vm)?.find((net) => net.name === nicName);
  return network ? getNetworkName(network) : null;
};

/**
 * Gets currently used NAD names from VM
 * @param vm - VirtualMachine instance
 * @returns Array of currently used NAD names
 */
export const getCurrentlyUsedNADsNames = (vm: V1VirtualMachine): string[] =>
  getNetworks(vm)
    ?.map((network) => network?.multus?.networkName)
    .filter(Boolean) || [];

// ============================================================================
// NAD Filtering Utilities
// ============================================================================

/**
 * Checks if a NAD is currently used by the VM
 * @param nad - NetworkAttachmentDefinition
 * @param currentlyUsedNADsNames - Array of currently used NAD names
 * @param vmiNamespace - VM namespace
 * @returns True if NAD is currently used
 */
export const isNadCurrentlyUsed = (
  nad: NetworkAttachmentDefinition,
  currentlyUsedNADsNames: string[],
  vmiNamespace: string,
): boolean => {
  const nadFullName = `${getNamespace(nad)}/${getName(nad)}`;
  const nadNameOnly = getName(nad);
  const nadNamespace = getNamespace(nad);

  return (
    currentlyUsedNADsNames.includes(nadFullName) ||
    (nadNamespace === vmiNamespace && currentlyUsedNADsNames.includes(nadNameOnly))
  );
};

/**
 * Checks if a NAD should be included in the filter when editing
 * @param nad - NetworkAttachmentDefinition
 * @param currentNetworkName - Current network name being edited
 * @param originalNetworkName - Original network name
 * @returns True if NAD should be included
 */
export const shouldIncludeNadWhenEditing = (
  nad: NetworkAttachmentDefinition,
  currentNetworkName: null | ParsedNetworkName,
  originalNetworkName: null | ParsedNetworkName,
): boolean => {
  const nadFullName = `${getNamespace(nad)}/${getName(nad)}`;
  const nadNameOnly = getName(nad);
  const nadNamespace = getNamespace(nad);

  // Match current network name (if set)
  if (currentNetworkName) {
    if (nadFullName === currentNetworkName.fullName) return true;
    if (
      nadNamespace === currentNetworkName.namespace &&
      nadNameOnly === currentNetworkName.nameOnly
    )
      return true;
  }

  // Match original network name (even if current is cleared)
  if (originalNetworkName) {
    if (nadFullName === originalNetworkName.fullName) return true;
    if (
      nadNamespace === originalNetworkName.namespace &&
      nadNameOnly === originalNetworkName.nameOnly
    )
      return true;
  }

  return false;
};

/**
 * Filters NADs based on usage and editing state
 * @param nads - Array of NetworkAttachmentDefinitions
 * @param vm - VirtualMachine instance
 * @param isEditing - Whether we're editing an existing network interface
 * @param currentNetworkName - Current network name being edited
 * @param originalNetworkName - Original network name
 * @param vmiNamespace - VM namespace
 * @returns Filtered array of NADs
 */
export const filterNADs = (
  nads: NetworkAttachmentDefinition[] | undefined,
  vm: V1VirtualMachine,
  isEditing: boolean,
  currentNetworkName: null | ParsedNetworkName,
  originalNetworkName: null | ParsedNetworkName,
  vmiNamespace: string,
): NetworkAttachmentDefinition[] => {
  if (!nads) return [];

  const currentlyUsedNADsNames = getCurrentlyUsedNADsNames(vm);

  return nads.filter((nad) => {
    const isCurrentlyUsed = isNadCurrentlyUsed(nad, currentlyUsedNADsNames, vmiNamespace);

    // Include NAD if it's not currently used
    if (!isCurrentlyUsed) return true;

    // If editing, include the current network or original network
    if (isEditing) {
      return shouldIncludeNadWhenEditing(nad, currentNetworkName, originalNetworkName);
    }

    return false;
  });
};

// ============================================================================
// Network Option Creation Utilities
// ============================================================================

/**
 * Creates a network option from a NAD
 * @param nad - NetworkAttachmentDefinition
 * @param vmiNamespace - VM namespace
 * @returns Network option
 */
export const createNadOption = (
  nad: NetworkAttachmentDefinition,
  vmiNamespace: string,
): NetworkSelectTypeaheadOptionProps => {
  const { name, namespace: nadNamespace } = nad.metadata;
  const type = getNadType(nad);
  const displayedValue = `${nadNamespace}/${name}`;
  const value = nadNamespace === vmiNamespace ? name : displayedValue;

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
};

/**
 * Creates a Pod Networking option
 * @param podNetworkingText - Translated text for Pod Networking
 * @param podNetworkType - Type of pod network (masquerade or l2bridge)
 * @returns Pod Networking option
 */
export const createPodNetworkOption = (
  podNetworkingText: string,
  podNetworkType: string,
): NetworkSelectTypeaheadOptionProps => ({
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

/**
 * Creates an option for the original network when editing
 * @param originalNetworkName - Original network name
 * @returns Original network option
 */
export const createOriginalNetworkOption = (
  originalNetworkName: string,
): NetworkSelectTypeaheadOptionProps => ({
  label: originalNetworkName,
  optionProps: {
    children: (
      <>
        {originalNetworkName} <Label isCompact>{interfaceTypesProxy.bridge} Binding</Label>
      </>
    ),
    key: originalNetworkName,
  },
  type: interfaceTypesProxy.bridge,
  value: originalNetworkName,
});

type BuildNetworkOptionsParams = {
  createdNetworkOptions: NetworkSelectTypeaheadOptionProps[];
  filteredNADs: NetworkAttachmentDefinition[];
  isEditing: boolean;
  isPodNetworkingOptionExists: boolean;
  originalNetworkName: null | string;
  podNetworkingText: string;
  podNetworkType: string;
  vmiNamespace: string;
};

/**
 * Builds the complete list of network options
 * @param params - Parameters for building network options
 * @param params.createdNetworkOptions
 * @param params.filteredNADs
 * @param params.isEditing
 * @param params.isPodNetworkingOptionExists
 * @param params.originalNetworkName
 * @param params.podNetworkType
 * @param params.podNetworkingText
 * @param params.vmiNamespace
 * @returns Complete array of network options
 */
export const buildNetworkOptions = ({
  createdNetworkOptions,
  filteredNADs,
  isEditing,
  isPodNetworkingOptionExists,
  originalNetworkName,
  podNetworkingText,
  podNetworkType,
  vmiNamespace,
}: BuildNetworkOptionsParams): NetworkSelectTypeaheadOptionProps[] => {
  const options = filteredNADs.map((nad) => createNadOption(nad, vmiNamespace));

  // Add Pod Networking option if needed
  if (isPodNetworkingOptionExists) {
    options.unshift(createPodNetworkOption(podNetworkingText, podNetworkType));
  }

  // When editing, ensure the original network name is in options even if NAD doesn't exist
  // This ensures the original network stays available even if user clears networkName
  if (isEditing && originalNetworkName && !isPodNetworkName(originalNetworkName)) {
    const isOriginalNetworkInOptions = options.some((opt) => opt.value === originalNetworkName);
    if (!isOriginalNetworkInOptions) {
      options.push(createOriginalNetworkOption(originalNetworkName));
    }
  }

  // Add user-created network options that aren't already in the list
  return [
    ...options,
    ...createdNetworkOptions.filter(({ value }) =>
      options.every((option) => option.value !== value),
    ),
  ];
};

/**
 * Gets the interface type from a selected network value
 * @param value - Selected network value
 * @param networkOptions - Array of network options
 * @param podNetworkType - Type of pod network
 * @returns Interface type or undefined
 */
export const getInterfaceTypeFromValue = (
  value: string | undefined,
  networkOptions: NetworkSelectTypeaheadOptionProps[],
  podNetworkType: string,
): string | undefined => {
  if (!value) return undefined;
  if (value === POD_NETWORK) return podNetworkType;
  return networkOptions.find((netOption) => value === netOption?.value)?.type;
};

export const createNewNetworkOption = (value): NetworkSelectTypeaheadOptionProps => ({
  optionProps: {
    children: (
      <>
        {value}
        <Label isCompact>{interfaceTypesProxy.bridge} Binding</Label>
      </>
    ),
  },
  type: interfaceTypesProxy.bridge,
  value,
});

export const getCreateNetworkOption = (input: string, t: TFunction): SelectOptionProps => {
  const parts = input?.split('/');
  if (!input || parts?.length !== 2 || parts.some((part) => !part)) {
    return {
      children: (
        <HelperText>
          <HelperTextItem icon={<InfoIcon />} variant="indeterminate">
            {t('Type namespace/network-name to use a different network')}
          </HelperTextItem>
        </HelperText>
      ),
      isDisabled: true,
    };
  }

  const getErrorMsg =
    // both namespace and NAD name are DNS labels
    input
      .split('/')
      .map((part) => getDNS1120LabelError(part))
      .find(Boolean);
  if (getErrorMsg) {
    return {
      children: (
        <HelperText>
          <HelperTextItem variant="error">{getErrorMsg(t)}</HelperTextItem>
        </HelperText>
      ),
      isDisabled: true,
    };
  }

  return {
    children: (
      <>
        {t('Use "{{inputValue}}"', { inputValue: input })}{' '}
        <Label isCompact>{interfaceTypesProxy.bridge} Binding</Label>
      </>
    ),
  };
};
