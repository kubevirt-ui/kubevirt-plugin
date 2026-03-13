import React, {
  createContext,
  FC,
  PropsWithChildren,
  useCallback,
  useContext,
  useState,
} from 'react';

import { OperatorsToInstall } from '@settings/tabs/ClusterTab/components/VirtualizationFeaturesSection/utils/types';
import {
  useVirtualizationFeatures,
  VirtualizationFeaturesResources,
} from '@settings/tabs/ClusterTab/components/VirtualizationFeaturesSection/utils/VirtualizationFeaturesContext/utils/hooks/useVirtualizationFeatures/useVirtualizationFeatures';
import { defaultOperatorsToInstall } from '@settings/tabs/ClusterTab/components/VirtualizationFeaturesSection/VirtualizationFeaturesWizard/utils/utils';

export const VirtualizationFeaturesContext = createContext<VirtualizationFeaturesResources>({});

export const VirtualizationFeaturesContextProvider: FC = ({ children }) => {
  const context = useVirtualizationFeatures();
  return (
    <VirtualizationFeaturesContext.Provider value={context}>
      {children}
    </VirtualizationFeaturesContext.Provider>
  );
};

type VirtualizationFeaturesWizardProviderProps = PropsWithChildren<{
  preloadedResources: Omit<
    VirtualizationFeaturesResources,
    'operatorsToInstall' | 'updateInstallRequests'
  >;
}>;

/**
 * Provides the wizard with operator resources for immediate display and live updates:
 *
 * 1. The preloaded snapshot (captured when the button is clicked) is used right away so
 *    the wizard opens instantly — no second fleet API fetch on modal open for spoke clusters.
 * 2. A fresh useVirtualizationFeatures() watch is started inside the wizard. Once it loads,
 *    its live data takes over, so the summary step reflects real-time install progress.
 *
 * Note: the modal is rendered at ModalProvider level (outside the page's
 * VirtualizationFeaturesContextProvider), so we cannot rely on the parent context here.
 */
export const VirtualizationFeaturesWizardProvider: FC<
  VirtualizationFeaturesWizardProviderProps
> = ({ children, preloadedResources }) => {
  const [operatorsToInstall, setOperatorsToInstall] =
    useState<OperatorsToInstall>(defaultOperatorsToInstall);

  const updateInstallRequests = useCallback((updates: OperatorsToInstall) => {
    setOperatorsToInstall((prev) => ({ ...prev, ...updates }));
  }, []);

  const liveResources = useVirtualizationFeatures();

  // Use the preloaded snapshot until the live watch is ready, then switch to live data.
  const resources = liveResources.operatorResourcesLoaded ? liveResources : preloadedResources;

  return (
    <VirtualizationFeaturesContext.Provider
      value={{ ...resources, operatorsToInstall, updateInstallRequests }}
    >
      {children}
    </VirtualizationFeaturesContext.Provider>
  );
};

export const useVirtualizationFeaturesContext = () => useContext(VirtualizationFeaturesContext);
