import * as React from 'react';

import FeatureHighlightsSection from './feature-highlights-section/FeatureHighlightsSection';
import RecommendedOperatorsSection from './recommended-operators-section/RecommendedOperatorsSection';
import { GettingStartedGrid } from './utils/getting-started-grid/GettingStartedGrid';

const GettingStartedCard: React.FC = () => (
  <div className="kv-overview-getting-started-section">
    <GettingStartedGrid>
      <FeatureHighlightsSection />
      <RecommendedOperatorsSection />
    </GettingStartedGrid>
  </div>
);

export default GettingStartedCard;
