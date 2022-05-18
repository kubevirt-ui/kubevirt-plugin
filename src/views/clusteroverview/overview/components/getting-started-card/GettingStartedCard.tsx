import * as React from 'react';

import FeatureHighlightsSection from './feature-highlights-section/FeatureHighlightsSection';
import RelatedOperatorsSection from './related-operators-section/RelatedOperatorsSection';
import { GettingStartedGrid } from './utils/getting-started-grid/GettingStartedGrid';

import './GettingStartedCard.scss';

const GettingStartedCard: React.FC = () => (
  <div className="kv-overview-getting-started-section">
    <GettingStartedGrid>
      <FeatureHighlightsSection />
      <RelatedOperatorsSection />
    </GettingStartedGrid>
  </div>
);

export default GettingStartedCard;
