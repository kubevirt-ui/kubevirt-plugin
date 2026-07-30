import React, { type FC, type ReactNode, useCallback, useMemo, useState } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getValidNamespace } from '@kubevirt-utils/utils/utils';
import { useActiveNamespace } from '@openshift-console/dynamic-plugin-sdk';
import { useDataViewSelection } from '@patternfly/react-data-view';
import useOperatorResources from '../hooks/useOperatorResources/useOperatorResources';

import useInstallBundle from '../hooks/useInstallBundle';
import useInstallFeature from '../hooks/useInstallFeature';
import { getRecommendedCapabilityFeatures } from '../utils/capabilityFeatures';
import { buildRecommendedDetailsMap } from '../utils/detailsMap';
import { RECOMMENDED_OPERATOR_PACKAGE_NAMES } from '../utils/operatorNames';
import {
  type AlternativeStateMap,
  type CapabilityFeature,
  type RecommendedCapabilityDetailsMap,
} from '../utils/types';
import { computeCapabilityInstallState } from '../utils/utils';
import {
  CapabilitiesActionsContext,
  type CapabilitiesActionsValue,
} from './useCapabilitiesActions';
import { CapabilitiesDataContext, type CapabilitiesDataValue } from './useCapabilitiesData';

export const CapabilitiesDataProvider: FC<{ children?: ReactNode }> = ({ children }) => {
  const { t } = useKubevirtTranslation();
  const [activeNamespace] = useActiveNamespace();
  const validNamespace = getValidNamespace(activeNamespace);

  const features = useMemo(() => getRecommendedCapabilityFeatures(t), [t]);

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

  const { installBundle, installResourcesLoaded, isInstalling } = useInstallBundle({
    detailsMap,
    features,
    filteredPackageManifests,
    operatorGroups,
    subscriptions,
  });

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
      detailsMap,
      features,
      getCapabilityInstallState,
      loadErrors,
      resourcesLoaded: operatorResourcesLoaded,
    }),
    [
      alternativeState,
      detailsMap,
      features,
      getCapabilityInstallState,
      loadErrors,
      operatorResourcesLoaded,
    ],
  );

  const actionsValue: CapabilitiesActionsValue = useMemo(
    () => ({
      capabilitySelection,
      installBundle,
      installFeature,
      installingFeatures,
      installResourcesLoaded,
      isInstalling,
      setAlternative,
    }),
    [
      capabilitySelection,
      installBundle,
      installFeature,
      installingFeatures,
      installResourcesLoaded,
      isInstalling,
      setAlternative,
    ],
  );

  return (
    <CapabilitiesDataContext.Provider value={dataValue}>
      <CapabilitiesActionsContext.Provider value={actionsValue}>
        {children}
      </CapabilitiesActionsContext.Provider>
    </CapabilitiesDataContext.Provider>
  );
};
