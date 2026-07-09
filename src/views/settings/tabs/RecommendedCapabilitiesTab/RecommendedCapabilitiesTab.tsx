import React, { FC, useMemo } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Gallery } from '@patternfly/react-core';

import CapabilityCard from './components/CapabilityCard/CapabilityCard';
import { CapabilitiesDataProvider } from './context/CapabilitiesDataProvider';
import { getRecommendedCapabilityFeatures } from './utils/capabilityFeatures';

const RecommendedCapabilitiesTab: FC = () => {
  const { t } = useKubevirtTranslation();
  const features = useMemo(() => getRecommendedCapabilityFeatures(t), [t]);

  return (
    <CapabilitiesDataProvider>
      <Gallery hasGutter minWidths={{ default: '17.5rem' }}>
        {features.map((feature) => (
          <CapabilityCard key={feature.id} feature={feature} />
        ))}
      </Gallery>
    </CapabilitiesDataProvider>
  );
};

export default RecommendedCapabilitiesTab;
