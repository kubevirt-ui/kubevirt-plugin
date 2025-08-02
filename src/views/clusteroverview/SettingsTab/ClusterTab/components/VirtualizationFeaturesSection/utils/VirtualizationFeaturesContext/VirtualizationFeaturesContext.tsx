import React, { createContext, FC, useCallback, useContext, useState } from 'react';

import {
  OperatorsToInstall,
  UpdateInstallRequest,
  VirtualizationFeatureOperators,
} from '@overview/SettingsTab/ClusterTab/components/VirtualizationFeaturesSection/utils/types';
import { defaultOperatorsToInstall } from '@overview/SettingsTab/ClusterTab/components/VirtualizationFeaturesSection/VirtualizationFeaturesWizard/utils/utils';

import useVirtualizationOperators from '../hooks/useVirtualizationOperators/useVirtualizationOperators';
import {
  OperatorDetailsMap,
  VirtFeatureOperatorItemsMap,
} from '../hooks/useVirtualizationOperators/utils/types';

export type VirtualizationFeaturesContextType = {
  operatorDetailsMap?: OperatorDetailsMap;
  operatorItemsMap?: VirtFeatureOperatorItemsMap;
  operatorsDataLoaded?: boolean;
  operatorsToInstall?: OperatorsToInstall;
  updateInstallRequest?: UpdateInstallRequest;
};

export const useVirtualizationFeatures = (): VirtualizationFeaturesContextType => {
  const { loaded, operatorDetailsMap, operatorItemsMap } = useVirtualizationOperators();

  const [operatorsToInstall, setOperatorsToInstall] =
    useState<OperatorsToInstall>(defaultOperatorsToInstall);

  const updateInstallRequest = useCallback(
    (operatorName: VirtualizationFeatureOperators, newSwitchState: boolean) => {
      setOperatorsToInstall({ ...operatorsToInstall, [operatorName]: newSwitchState });
    },
    [operatorsToInstall],
  );

  return {
    operatorDetailsMap,
    operatorItemsMap,
    operatorsDataLoaded: loaded,
    operatorsToInstall,
    updateInstallRequest,
  };
};

export const VirtualizationFeaturesContext = createContext<VirtualizationFeaturesContextType>({});

export const VirtualizationFeaturesContextProvider: FC = ({ children }) => {
  const context = useVirtualizationFeatures();
  return (
    <VirtualizationFeaturesContext.Provider value={context}>
      {children}
    </VirtualizationFeaturesContext.Provider>
  );
};

export const useVirtualizationFeaturesContext = () => useContext(VirtualizationFeaturesContext);
