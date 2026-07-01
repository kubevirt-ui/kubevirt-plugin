import React, {
  createContext,
  type FC,
  type ReactNode,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';

import { getValidNamespace } from '@kubevirt-utils/utils/utils';
import { useActiveNamespace } from '@openshift-console/dynamic-plugin-sdk';
import useOperatorResources from '@settings/tabs/ClusterTab/components/VirtualizationFeaturesSection/utils/hooks/useOperatorResources/useOperatorResources';

import { RECOMMENDED_OPERATOR_PACKAGE_NAMES } from '../utils/operatorNames';
import {
  type AlternativeStateMap,
  type CapabilityFeature,
  type CapabilityInstallState,
  type RecommendedCapabilityDetailsMap,
} from '../utils/types';
import { buildRecommendedDetailsMap, computeCapabilityInstallState } from '../utils/utils';

type RecommendedCapabilitiesContextValue = {
  alternativeState: AlternativeStateMap;
  detailsMap: RecommendedCapabilityDetailsMap;
  getCapabilityInstallState: (feature: CapabilityFeature) => CapabilityInstallState;
  resourcesLoaded: boolean;
  setAlternative: (packageName: string, inUse: boolean) => void;
};

const RecommendedCapabilitiesContext = createContext<RecommendedCapabilitiesContextValue>(
  {} as RecommendedCapabilitiesContextValue,
);

export const RecommendedCapabilitiesContextProvider: FC<{ children?: ReactNode }> = ({
  children,
}) => {
  const [activeNamespace] = useActiveNamespace();
  const validNamespace = getValidNamespace(activeNamespace);

  const [alternativeState, setAlternativeState] = useState<AlternativeStateMap>({});

  const setAlternative = useCallback((packageName: string, inUse: boolean) => {
    setAlternativeState((prev) => ({ ...prev, [packageName]: inUse }));
  }, []);

  const {
    clusterServiceVersions,
    filteredPackageManifests,
    operatorGroups,
    operatorResourcesLoaded,
    subscriptions,
  } = useOperatorResources(RECOMMENDED_OPERATOR_PACKAGE_NAMES);

  const detailsMap = useMemo<RecommendedCapabilityDetailsMap>(
    () =>
      buildRecommendedDetailsMap(
        clusterServiceVersions,
        filteredPackageManifests,
        operatorGroups,
        operatorResourcesLoaded,
        subscriptions,
        validNamespace,
      ),
    [
      clusterServiceVersions,
      filteredPackageManifests,
      operatorGroups,
      operatorResourcesLoaded,
      subscriptions,
      validNamespace,
    ],
  );

  const getCapabilityInstallState = useCallback(
    (feature: CapabilityFeature) =>
      computeCapabilityInstallState(feature, detailsMap, alternativeState),
    [alternativeState, detailsMap],
  );

  return (
    <RecommendedCapabilitiesContext.Provider
      value={{
        alternativeState,
        detailsMap,
        getCapabilityInstallState,
        resourcesLoaded: operatorResourcesLoaded,
        setAlternative,
      }}
    >
      {children}
    </RecommendedCapabilitiesContext.Provider>
  );
};

export const useRecommendedCapabilitiesContext = (): RecommendedCapabilitiesContextValue =>
  useContext(RecommendedCapabilitiesContext);
