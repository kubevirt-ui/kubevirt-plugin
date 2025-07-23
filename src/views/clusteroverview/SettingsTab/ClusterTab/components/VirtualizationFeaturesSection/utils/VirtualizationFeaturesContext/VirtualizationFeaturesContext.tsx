import React, { createContext, FC, useContext } from 'react';

import useVirtualizationOperators from '../hooks/useVirtualizationOperators/useVirtualizationOperators';
import {
  OperatorDetailsMap,
  VirtFeatureOperatorItemsMap,
} from '../hooks/useVirtualizationOperators/utils/types';

export type VirtualizationFeaturesContextType = {
  operatorDetailsMap?: OperatorDetailsMap;
  operatorItemsMap?: VirtFeatureOperatorItemsMap;
};

export const useVirtualizationFeatures = (): VirtualizationFeaturesContextType => {
  const { operatorDetailsMap, operatorItemsMap } = useVirtualizationOperators();

  return {
    operatorDetailsMap,
    operatorItemsMap,
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
