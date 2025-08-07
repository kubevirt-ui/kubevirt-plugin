import React, { createContext, FC, useCallback, useContext, useState } from 'react';

import { OperatorsToInstall } from '@overview/SettingsTab/ClusterTab/components/VirtualizationFeaturesSection/utils/types';
import { defaultOperatorsToInstall } from '@overview/SettingsTab/ClusterTab/components/VirtualizationFeaturesSection/VirtualizationFeaturesWizard/utils/utils';

import useVirtualizationOperators from '../hooks/useVirtualizationOperators/useVirtualizationOperators';
import {
  OperatorDetailsMap,
  OperatorResources,
  VirtFeatureOperatorItemsMap,
} from '../hooks/useVirtualizationOperators/utils/types';

export type VirtualizationFeaturesContextType = {
  operatorDetailsMap?: OperatorDetailsMap;
  operatorItemsMap?: VirtFeatureOperatorItemsMap;
  operatorResources?: OperatorResources;
  operatorResourcesLoaded?: boolean;
  operatorsToInstall?: OperatorsToInstall;
  updateInstallRequests?: (updates: OperatorsToInstall) => void;
};

export const useVirtualizationFeatures = (): VirtualizationFeaturesContextType => {
  const { operatorDetailsMap, operatorItemsMap, operatorResources, operatorResourcesLoaded } =
    useVirtualizationOperators();

  const [operatorsToInstall, setOperatorsToInstall] =
    useState<OperatorsToInstall>(defaultOperatorsToInstall);

  const updateInstallRequests = useCallback((updates: OperatorsToInstall) => {
    setOperatorsToInstall({ ...operatorsToInstall, ...updates });
  }, []);

  return {
    operatorDetailsMap,
    operatorItemsMap,
    operatorResources,
    operatorResourcesLoaded,
    operatorsToInstall,
    updateInstallRequests,
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
