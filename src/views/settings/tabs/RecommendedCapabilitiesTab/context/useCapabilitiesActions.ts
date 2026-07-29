import { createContext, useContext } from 'react';

import { type CapabilityFeature, type CapabilitySelectionState } from '../utils/types';

export type CapabilitiesActionsValue = {
  capabilitySelection: CapabilitySelectionState;
  installBundle: () => Promise<void>;
  installFeature: (feature: CapabilityFeature) => Promise<void>;
  installingFeatures: Set<string>;
  installResourcesLoaded: boolean;
  isInstalling: boolean;
  setAlternative: (packageName: string, inUse: boolean) => void;
};

const EMPTY_SET = new Set<string>();

const defaultActionsValue: CapabilitiesActionsValue = {
  capabilitySelection: {
    isSelected: () => false,
    onSelect: () => undefined,
    selected: [],
  },
  installBundle: () => Promise.resolve(),
  installFeature: () => Promise.resolve(),
  installingFeatures: EMPTY_SET,
  installResourcesLoaded: false,
  isInstalling: false,
  setAlternative: () => undefined,
};

const CapabilitiesActionsContext = createContext<CapabilitiesActionsValue>(defaultActionsValue);

export const useCapabilitiesActions = () => useContext(CapabilitiesActionsContext);

export { CapabilitiesActionsContext };
