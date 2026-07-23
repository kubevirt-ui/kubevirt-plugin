import { type Dispatch, type ReactNode, type SetStateAction } from 'react';
import { type TFunction } from 'i18next';

import { type V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { type SelectTypeaheadOptionProps } from '@kubevirt-utils/components/SelectTypeahead/SelectTypeahead';
import { type ValidatedOptions } from '@patternfly/react-core';

import { type NetworkAttachmentDefinitionKind } from '@kubevirt-utils/resources/nad/types';

export type NetworkSelectTypeaheadOptionProps = SelectTypeaheadOptionProps & {
  type: string;
};

export type NetworkInterfaceNetworkSelectProps = {
  editInitValueNetworkName?: string | undefined;
  isEditing?: boolean | undefined;
  namespace?: string;
  networkName: string;
  setInterfaceType: Dispatch<SetStateAction<string>>;
  setNetworkName: Dispatch<SetStateAction<string>>;
  setSubmitDisabled: Dispatch<SetStateAction<boolean>>;
  vm: V1VirtualMachine;
};

export type UseNetworkInterfaceDataReturn = {
  handleChange: (value: string) => void;
  loaded: boolean;
  networkOptions: NetworkSelectTypeaheadOptionProps[];
  selectNetworkName: string;
  selectTypeaheadKey: string;
  setCreatedNetworkOptions: Dispatch<SetStateAction<NetworkSelectTypeaheadOptionProps[]>>;
  t: TFunction;
  validated: ValidatedOptions;
  validators: ((fullName: string) => ReactNode)[];
};

export type GetShowPodNetworkingOptionArgs = {
  editInitValueNetworkName?: string;
  hasPodNetwork: boolean;
  isEditing?: boolean;
  isIPv6SingleStack: boolean;
  isPodNetworkAllowed?: boolean;
};

export type FilterNADsForSelectArgs = {
  currentlyUsedNADFullNames: string[];
  editInitValueNetworkName?: string;
  isEditing?: boolean;
  nads: NetworkAttachmentDefinitionKind[];
  vmiNamespace: string;
};

export type GetSelectTypeaheadKeyArgs = {
  isEditing?: boolean;
  loaded: boolean;
  selectedFirstOnLoad: boolean;
};

export type GetEditingNetworkOptionIfMissingArgs = {
  editInitValueNetworkName?: string;
  isEditing?: boolean;
  options: NetworkSelectTypeaheadOptionProps[];
  selectNetworkName: string;
  t: TFunction;
  vmiNamespace: string;
};

export type BuildNetworkSelectOptionsArgs = {
  createdNetworkOptions: NetworkSelectTypeaheadOptionProps[];
  editInitValueNetworkName?: string;
  filteredNADs: NetworkAttachmentDefinitionKind[];
  isEditing?: boolean;
  podNetworkingText: string;
  podNetworkType: string;
  selectNetworkName: string;
  showPodNetworkingOption: boolean;
  t: TFunction;
  vmiNamespace: string;
};
