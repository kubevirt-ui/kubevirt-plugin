import React, { FC } from 'react';

import { HyperConverged } from '@kubevirt-utils/hooks/useHyperConvergeConfiguration';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { CLUSTER_TAB_IDS } from '@overview/SettingsTab/search/constants';

import ExpandSection from '../../../../ExpandSection/ExpandSection';

import Limits from './Limits/Limits';
import Network from './Network/Network';

import './live-migration-section.scss';

type LiveMigrationSectionProps = {
  hyperConvergeConfiguration: [hyperConvergeConfig: HyperConverged, loaded: boolean, error: Error];
};

const LiveMigrationSection: FC<LiveMigrationSectionProps> = ({ hyperConvergeConfiguration }) => {
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
