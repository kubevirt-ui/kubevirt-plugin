import { createContext, useContext } from 'react';

import {
  type AlternativeStateMap,
  type AutopilotStatusMap,
  type CapabilityFeature,
  CapabilityInstallState,
  type RecommendedCapabilityDetailsMap,
} from '../utils/types';

export type CapabilitiesDataValue = {
  alternativeState: AlternativeStateMap;
  autopilotEnabled: boolean;
  autopilotStatusMap: AutopilotStatusMap;
  detailsMap: RecommendedCapabilityDetailsMap;
  features: CapabilityFeature[];
  getCapabilityInstallState: (feature: CapabilityFeature) => CapabilityInstallState;
  loadErrors: unknown[];
  resourcesLoaded: boolean;
};

const defaultDataValue: CapabilitiesDataValue = {
  alternativeState: {},
  autopilotEnabled: false,
  autopilotStatusMap: {},
  detailsMap: {},
  features: [],
  getCapabilityInstallState: () => CapabilityInstallState.NotInstalled,
  loadErrors: [],
  resourcesLoaded: false,
};

const CapabilitiesDataContext = createContext<CapabilitiesDataValue>(defaultDataValue);

export const useCapabilitiesData = () => useContext(CapabilitiesDataContext);

export { CapabilitiesDataContext };
