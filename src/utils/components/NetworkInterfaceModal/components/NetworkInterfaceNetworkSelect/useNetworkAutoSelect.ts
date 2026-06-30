import { type Dispatch, type SetStateAction, useCallback, useEffect } from 'react';

import { POD_NETWORK } from '@kubevirt-utils/resources/vm';

import { type NetworkSelectTypeaheadOptionProps } from './types';

type UseNetworkAutoSelectArgs = {
  canCreateNetworkInterface: boolean;
  isEditing?: boolean;
  loaded: boolean;
  loadError: unknown;
  networkName: string;
  networkOptions: NetworkSelectTypeaheadOptionProps[];
  podNetworkType: string;
  selectedFirstOnLoad: boolean;
  setInterfaceType: Dispatch<SetStateAction<string>>;
  setNetworkName: Dispatch<SetStateAction<string>>;
  setSelectedFirstOnLoad: (val: boolean) => void;
  setSubmitDisabled: Dispatch<SetStateAction<boolean>>;
};

export const useNetworkAutoSelect = ({
  canCreateNetworkInterface,
  isEditing,
  loaded,
  loadError,
  networkName,
  networkOptions,
  podNetworkType,
  selectedFirstOnLoad,
  setInterfaceType,
  setNetworkName,
  setSelectedFirstOnLoad,
  setSubmitDisabled,
}: UseNetworkAutoSelectArgs): ((value: string) => void) => {
  const handleChange = useCallback(
    (value: string) => {
      setNetworkName(value);
      setInterfaceType(
        value === POD_NETWORK
          ? podNetworkType
          : networkOptions.find((netOption) => value === netOption?.value)?.type,
      );
    },
    [setNetworkName, setInterfaceType, networkOptions, podNetworkType],
  );

  useEffect(() => {
    if (networkName && !isEditing) {
      setSubmitDisabled(false);
      return;
    }
    if (networkName || isEditing) return;

    if (loaded && !loadError && !selectedFirstOnLoad) {
      setSelectedFirstOnLoad(true);
      const networkToPreselect = networkOptions?.[0]?.value;
      if (networkToPreselect) handleChange(networkToPreselect);
      return;
    }

    if (loaded && (loadError || !canCreateNetworkInterface)) {
      setSubmitDisabled(true);
    }
  }, [
    loadError,
    canCreateNetworkInterface,
    isEditing,
    loaded,
    networkName,
    networkOptions,
    selectedFirstOnLoad,
    setSelectedFirstOnLoad,
    setSubmitDisabled,
    handleChange,
  ]);

  return handleChange;
};
