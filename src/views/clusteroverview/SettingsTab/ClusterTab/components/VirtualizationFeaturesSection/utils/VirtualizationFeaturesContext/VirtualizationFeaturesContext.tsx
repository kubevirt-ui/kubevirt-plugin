import React, { createContext, FC, useContext } from 'react';

import {
  useVirtualizationFeatures,
  VirtualizationFeaturesResources,
} from '@overview/SettingsTab/ClusterTab/components/VirtualizationFeaturesSection/utils/VirtualizationFeaturesContext/utils/hooks/useVirtualizationFeatures/useVirtualizationFeatures';

export const VirtualizationFeaturesContext = createContext<VirtualizationFeaturesResources>({});

export const VirtualizationFeaturesContextProvider: FC = ({ children }) => {
  const context = useVirtualizationFeatures();
  return (
    <VirtualizationFeaturesContext.Provider value={context}>
      {children}
    </VirtualizationFeaturesContext.Provider>
  );
};

export const useVirtualizationFeaturesContext = () => useContext(VirtualizationFeaturesContext);
