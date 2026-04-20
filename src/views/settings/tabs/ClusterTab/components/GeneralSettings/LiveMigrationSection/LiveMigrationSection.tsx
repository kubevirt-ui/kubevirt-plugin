import React, { FCC } from 'react';

import { HyperConverged } from '@kubevirt-utils/hooks/useHyperConvergeConfiguration';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import ExpandSection from '@settings/ExpandSection/ExpandSection';
import { CLUSTER_TAB_IDS } from '@settings/search/constants';

import Limits from './Limits/Limits';
import Network from './Network/Network';

import './live-migration-section.scss';

type LiveMigrationSectionProps = {
  hyperConvergeConfiguration: [hyperConvergeConfig: HyperConverged, loaded: boolean, error: Error];
};

const LiveMigrationSection: FCC<LiveMigrationSectionProps> = ({ hyperConvergeConfiguration }) => {
  const { t } = useKubevirtTranslation();
  const [hyperConverge] = hyperConvergeConfiguration;

  return (
    <ExpandSection
      className="live-migration-tab"
      searchItemId={CLUSTER_TAB_IDS.liveMigration}
      toggleText={t('Live migration')}
    >
      <Limits hyperConverge={hyperConverge} />
      <Network hyperConverge={hyperConverge} />
    </ExpandSection>
  );
};

export default LiveMigrationSection;
