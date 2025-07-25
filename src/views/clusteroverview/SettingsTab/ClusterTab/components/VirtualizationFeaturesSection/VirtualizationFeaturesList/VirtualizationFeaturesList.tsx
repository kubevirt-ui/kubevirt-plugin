import React, { FC } from 'react';

import VirtualizationFeaturesSection from '@overview/SettingsTab/ClusterTab/components/VirtualizationFeaturesSection/VirtualizationFeaturesList/VirtualizationFeaturesSection';

import { VirtualizationFeaturesContextProvider } from '../utils/VirtualizationFeaturesContext/VirtualizationFeaturesContext';

const VirtualizationFeaturesList: FC = () => {
  return (
    <VirtualizationFeaturesContextProvider>
      <VirtualizationFeaturesSection />
    </VirtualizationFeaturesContextProvider>
  );
};

export default VirtualizationFeaturesList;
