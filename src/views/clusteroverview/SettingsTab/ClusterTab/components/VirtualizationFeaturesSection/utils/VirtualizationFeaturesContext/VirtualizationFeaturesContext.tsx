import React, { createContext, FC, useContext } from 'react';

import {
  useVirtualizationFeatures,
  VirtualizationFeaturesResources,
} from '@overview/SettingsTab/ClusterTab/components/VirtualizationFeaturesSection/utils/VirtualizationFeaturesContext/utils/hooks/useVirtualizationFeatures/useVirtualizationFeatures';

export const VirtualizationFeaturesContext = createContext<VirtualizationFeaturesResources>({});

type VirtualizationFeaturesContextProviderProps = {
  cluster?: string;
};

export const VirtualizationFeaturesContextProvider: FC<
  VirtualizationFeaturesContextProviderProps
> = ({ children, cluster }) => {
  const context = useVirtualizationFeatures(cluster);
  return (
    <VirtualizationFeaturesContext.Provider value={context}>
      {children}
    </VirtualizationFeaturesContext.Provider>
  );
};

export const useVirtualizationFeaturesContext = () => useContext(VirtualizationFeaturesContext);
