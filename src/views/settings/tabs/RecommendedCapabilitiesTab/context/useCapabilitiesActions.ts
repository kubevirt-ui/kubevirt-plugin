import { createContext, useContext } from 'react';

export type CapabilitiesActionsValue = {
  installBundle: () => Promise<void>;
  installResourcesLoaded: boolean;
  isInstalling: boolean;
  setAlternative: (packageName: string, inUse: boolean) => void;
};

const defaultActionsValue: CapabilitiesActionsValue = {
  installBundle: () => Promise.resolve(),
  installResourcesLoaded: false,
  isInstalling: false,
  setAlternative: () => undefined,
};

const CapabilitiesActionsContext = createContext<CapabilitiesActionsValue>(defaultActionsValue);

export const useCapabilitiesActions = () => useContext(CapabilitiesActionsContext);

export { CapabilitiesActionsContext };
