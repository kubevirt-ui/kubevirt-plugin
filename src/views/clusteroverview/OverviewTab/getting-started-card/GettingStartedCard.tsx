import React, { FC } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';

import {
  GETTING_STARTED_SHOW_STATE,
  KUBEVIRT_QUICK_START_USER_SETTINGS_KEY,
} from '../../utils/constants';

import FeatureHighlightsSection from './feature-highlights-section/FeatureHighlightsSection';
import QuickStartsSection from './quick-starts-section/QuickStartsSection';
import RelatedOperatorsSection from './related-operators-section/RelatedOperatorsSection';
import { GettingStartedGrid } from './utils/getting-started-grid/GettingStartedGrid';
import useGettingStartedShowState from './utils/hooks/useGettingStartedShowState';

import './GettingStartedCard.scss';

const GettingStartedCard: FC = () => {
  const { t } = useKubevirtTranslation();
  const [showState, setShowState, showStateLoaded] = useGettingStartedShowState(
    KUBEVIRT_QUICK_START_USER_SETTINGS_KEY,
  );

  const showQuickStart = showStateLoaded && showState === GETTING_STARTED_SHOW_STATE.SHOW;

  return (
    showQuickStart && (
      <div className="kv-overview-getting-started-section">
        <GettingStartedGrid onHide={() => setShowState(GETTING_STARTED_SHOW_STATE.HIDE)}>
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
    )
  );
};

export default GettingStartedCard;
