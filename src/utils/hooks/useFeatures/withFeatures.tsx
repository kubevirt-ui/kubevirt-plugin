import React, { FC, useMemo } from 'react';

import { AUTOMATIC_UPDATE_FEATURE_NAME, defaultFeatures } from './constants';
import { FeatureContext, FeaturesContextType } from './FeatureContext';
import { FeaturesType } from './types';
import useFeaturesConfigMap from './useFeaturesConfigMap';

const withFeatures = <P,>(Component: FC) => {
  const EnhancedComponent: FC<P> = (props) => {
    const {
      featuresConfigMapData: [featuresMap, loaded, loadError],
    } = useFeaturesConfigMap();
    const loading = !featuresMap && !loaded && !loadError;
    const {
      advancedSearch,
      [AUTOMATIC_UPDATE_FEATURE_NAME]: autoUpdate,
      automaticSubscriptionActivationKey,
      automaticSubscriptionOrganizationId,
      confirmVMActions,
      disabledGuestSystemLogsAccess,
      kubevirtApiserverProxy,
      loadBalancerEnabled,
      nodePortAddress,
      nodePortEnabled,
      persistentReservationHCO,
      treeViewFolders,
    } = (featuresMap?.data ?? defaultFeatures) as FeaturesType;

    const memoFeatures: FeaturesContextType = useMemo(
      () => ({
        data: {
          advancedSearch,
          [AUTOMATIC_UPDATE_FEATURE_NAME]: autoUpdate,
          automaticSubscriptionActivationKey,
          automaticSubscriptionOrganizationId,
          confirmVMActions,
          disabledGuestSystemLogsAccess,
          kubevirtApiserverProxy,
          loadBalancerEnabled,
          nodePortAddress,
          nodePortEnabled,
          persistentReservationHCO,
          treeViewFolders,
        },
        isLoading: loading,
      }),
      [
        autoUpdate,
        persistentReservationHCO,
        advancedSearch,
        automaticSubscriptionActivationKey,
        automaticSubscriptionOrganizationId,
        confirmVMActions,
        disabledGuestSystemLogsAccess,
        kubevirtApiserverProxy,
        loadBalancerEnabled,
        nodePortAddress,
        nodePortEnabled,
        treeViewFolders,
        loading,
      ],
    );
    return (
      <FeatureContext.Provider value={memoFeatures}>
        <Component {...props} />
      </FeatureContext.Provider>
    );
  };
  EnhancedComponent.displayName = `${
    Component.displayName || Component.displayName || ''
  }WithFeatures`;
  return EnhancedComponent;
};

export default withFeatures;
