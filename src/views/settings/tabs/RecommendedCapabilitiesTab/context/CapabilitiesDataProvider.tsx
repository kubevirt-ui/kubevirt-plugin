import React, { type FC, type ReactNode, useCallback, useMemo, useState } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getValidNamespace } from '@kubevirt-utils/utils/utils';
import { useActiveNamespace } from '@openshift-console/dynamic-plugin-sdk';
import { useDataViewSelection } from '@patternfly/react-data-view';
import useOperatorResources from '../hooks/useOperatorResources/useOperatorResources';

import useAutopilotStatus from '../hooks/useAutopilotStatus';
import useInstallFeature from '../hooks/useInstallFeature';
import { getAutopilotCapabilities, getManualCapabilities } from '../utils/autopilotUtils';
import { getRecommendedCapabilityFeatures } from '../utils/capabilityFeatures';
import { buildRecommendedDetailsMap } from '../utils/detailsMap';
import { RECOMMENDED_OPERATOR_PACKAGE_NAMES } from '../utils/operatorNames';
import {
  type AlternativeStateMap,
  type CapabilityFeature,
  type RecommendedCapabilityDetailsMap,
} from '../utils/types';
import { computeCapabilityInstallState } from '../utils/installState';
import {
  CapabilitiesActionsContext,
  type CapabilitiesActionsValue,
} from './useCapabilitiesActions';
import { CapabilitiesDataContext, type CapabilitiesDataValue } from './useCapabilitiesData';

export const CapabilitiesDataProvider: FC<{ children?: ReactNode }> = ({ children }) => {
  const { t } = useKubevirtTranslation();
  const [activeNamespace] = useActiveNamespace();
  const validNamespace = getValidNamespace(activeNamespace);

  const { autopilotFeatures, features, manualFeatures } = useMemo(
    () => ({
      autopilotFeatures: getAutopilotCapabilities(t),
      features: getRecommendedCapabilityFeatures(t),
      manualFeatures: getManualCapabilities(t),
    }),
    [t],
  );

  const { autopilotEnabled, autopilotLoaded, autopilotStatusMap } = useAutopilotStatus();

  const [alternativeState, setAlternativeState] = useState<AlternativeStateMap>({});

  const setAlternative = useCallback((packageName: string, inUse: boolean) => {
    setAlternativeState((prev) => ({ ...prev, [packageName]: inUse }));
  }, []);

  const {
    clusterServiceVersions,
    filteredPackageManifests,
    loadErrors,
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
    (feature: CapabilityFeature) => computeCapabilityInstallState(feature, detailsMap),
    [detailsMap],
  );

  const { installFeature, installingFeatures } = useInstallFeature({
    detailsMap,
    features,
    filteredPackageManifests,
    operatorGroups,
    subscriptions,
  });

  const capabilitySelection = useDataViewSelection({
    matchOption: (a: { id: string }, b: { id: string }) => a.id === b.id,
  });

  const dataValue: CapabilitiesDataValue = useMemo(
    () => ({
      alternativeState,
      autopilotEnabled,
      autopilotFeatures,
      autopilotStatusMap,
      detailsMap,
      features,
      getCapabilityInstallState,
      loadErrors,
      manualFeatures,
      resourcesLoaded: operatorResourcesLoaded && autopilotLoaded,
    }),
    [
      alternativeState,
      autopilotEnabled,
      autopilotFeatures,
      autopilotLoaded,
      autopilotStatusMap,
      detailsMap,
      features,
      getCapabilityInstallState,
      loadErrors,
      manualFeatures,
      operatorResourcesLoaded,
    ],
  );

  const actionsValue: CapabilitiesActionsValue = useMemo(
    () => ({
      capabilitySelection,
      installFeature,
      installingFeatures,
      setAlternative,
    }),
    [capabilitySelection, installFeature, installingFeatures, setAlternative],
  );

  return (
    <CapabilitiesDataContext.Provider value={dataValue}>
      <CapabilitiesActionsContext.Provider value={actionsValue}>
        {children}
      </CapabilitiesActionsContext.Provider>
    </CapabilitiesDataContext.Provider>
  );
};
