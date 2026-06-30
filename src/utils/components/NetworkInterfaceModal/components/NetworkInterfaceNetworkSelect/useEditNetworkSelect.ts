import { Dispatch, SetStateAction, useEffect, useMemo, useState } from 'react';

import { NetworkAttachmentDefinition } from '../hooks/types';

import {
  filterNADsForSelect,
  getSelectNetworkName,
  getSelectTypeaheadKey,
} from './editNetworkSelectUtils';

type UseEditNetworkSelectArgs = {
  currentlyUsedNADFullNames: string[];
  editInitValueNetworkName?: string;
  isEditing?: boolean;
  loaded: boolean;
  nads: NetworkAttachmentDefinition[];
  networkName: string;
  setSubmitDisabled: Dispatch<SetStateAction<boolean>>;
  vmiNamespace: string;
};

const useEditNetworkSelect = ({
  currentlyUsedNADFullNames,
  editInitValueNetworkName,
  isEditing,
  loaded,
  nads,
  networkName,
  setSubmitDisabled,
  vmiNamespace,
}: UseEditNetworkSelectArgs) => {
  const [selectedFirstOnLoad, setSelectedFirstOnLoad] = useState(Boolean(isEditing));

  const filteredNADs = useMemo(
    () =>
      filterNADsForSelect({
        currentlyUsedNADFullNames,
        editInitValueNetworkName,
        isEditing,
        nads,
        vmiNamespace,
      }),
    [currentlyUsedNADFullNames, editInitValueNetworkName, isEditing, nads, vmiNamespace],
  );

  const selectNetworkName = useMemo(
    () => getSelectNetworkName(networkName, nads, vmiNamespace),
    [networkName, nads, vmiNamespace],
  );

  const selectTypeaheadKey = getSelectTypeaheadKey({ isEditing, loaded, selectedFirstOnLoad });

  useEffect(() => {
    if (!isEditing) {
      return;
    }

    setSubmitDisabled(!networkName);
  }, [isEditing, networkName, setSubmitDisabled]);

  return {
    filteredNADs,
    selectedFirstOnLoad,
    selectNetworkName,
    selectTypeaheadKey,
    setSelectedFirstOnLoad,
  };
};

export default useEditNetworkSelect;
