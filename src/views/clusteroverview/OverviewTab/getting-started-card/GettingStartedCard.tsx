import React, { FC } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';

import FeatureHighlightsSection from './feature-highlights-section/FeatureHighlightsSection';
import QuickStartsSection from './quick-starts-section/QuickStartsSection';
import RelatedOperatorsSection from './related-operators-section/RelatedOperatorsSection';
import { GettingStartedGrid } from './utils/getting-started-grid/GettingStartedGrid';

import './GettingStartedCard.scss';

const GettingStartedCard: FC = () => {
  const { t } = useKubevirtTranslation();

  return (
    <div className="kv-overview-getting-started-section">
      <GettingStartedGrid>
        <QuickStartsSection
          description={t(
            'Learn how to create, import, and run virtual machines on OpenShift with step-by-step instructions and tasks.',
          )}
          featured={['explore-pipelines', 'connect-ext-net-to-vm', 'create-rhel-vm']}
          filter={(qs) => ['creating-virtual-machine-from-volume'].includes(qs.metadata.name)}
          title={t('Quick Starts')}
        />
        <FeatureHighlightsSection />
        <RelatedOperatorsSection />
      </GettingStartedGrid>
    </div>
  );
};

export default GettingStartedCard;
