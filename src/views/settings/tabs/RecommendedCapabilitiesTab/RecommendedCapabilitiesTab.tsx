import React, { FC, useMemo } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Gallery } from '@patternfly/react-core';

import CapabilityCard from './components/CapabilityCard/CapabilityCard';
import { RecommendedCapabilitiesContextProvider } from './context/RecommendedCapabilitiesContext';
import { getRecommendedCapabilityFeatures } from './utils/constants';

const RecommendedCapabilitiesTab: FC = () => {
  const { t } = useKubevirtTranslation();
  const features = useMemo(() => getRecommendedCapabilityFeatures(t), [t]);

  return (
    <RecommendedCapabilitiesContextProvider>
      <Gallery hasGutter minWidths={{ default: '280px' }}>
        {features.map((feature) => (
          <CapabilityCard key={feature.id} feature={feature} />
        ))}
      </Gallery>
    </RecommendedCapabilitiesContextProvider>
  );
};

export default RecommendedCapabilitiesTab;
