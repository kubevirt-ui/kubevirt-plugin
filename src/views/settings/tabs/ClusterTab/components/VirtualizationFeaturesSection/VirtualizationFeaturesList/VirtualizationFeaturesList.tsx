import React, { FCC } from 'react';

import VirtualizationFeaturesSection from '@settings/tabs/ClusterTab/components/VirtualizationFeaturesSection/VirtualizationFeaturesList/VirtualizationFeaturesSection';

import { VirtualizationFeaturesContextProvider } from '../utils/VirtualizationFeaturesContext/VirtualizationFeaturesContext';

const VirtualizationFeaturesList: FCC = () => {
  return (
    <VirtualizationFeaturesContextProvider>
      <VirtualizationFeaturesSection />
    </VirtualizationFeaturesContextProvider>
  );
};

export default VirtualizationFeaturesList;
