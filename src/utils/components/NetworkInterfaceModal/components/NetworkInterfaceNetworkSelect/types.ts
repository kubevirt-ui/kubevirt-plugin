import { SelectTypeaheadOptionProps } from '@kubevirt-utils/components/SelectTypeahead/SelectTypeahead';

import { NetworkAttachmentDefinition } from '../hooks/types';

export type NetworkSelectTypeaheadOptionProps = SelectTypeaheadOptionProps & {
  type: string;
};

export type GetShowPodNetworkingOptionArgs = {
  editInitValueNetworkName?: string;
  hasPodNetwork: boolean;
  isEditing?: boolean;
};

export type FilterNADsForSelectArgs = {
  currentlyUsedNADFullNames: string[];
  editInitValueNetworkName?: string;
  isEditing?: boolean;
  nads: NetworkAttachmentDefinition[];
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
  vmiNamespace: string;
};

export type BuildNetworkSelectOptionsArgs = {
  createdNetworkOptions: NetworkSelectTypeaheadOptionProps[];
  editInitValueNetworkName?: string;
  filteredNADs: NetworkAttachmentDefinition[];
  isEditing?: boolean;
  podNetworkingText: string;
  podNetworkType: string;
  selectNetworkName: string;
  showPodNetworkingOption: boolean;
  vmiNamespace: string;
};
