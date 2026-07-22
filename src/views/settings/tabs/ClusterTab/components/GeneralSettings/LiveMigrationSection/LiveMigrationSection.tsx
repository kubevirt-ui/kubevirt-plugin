import React, { FC } from 'react';

import { HyperConverged } from '@kubevirt-utils/hooks/useHyperConvergeConfiguration';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import ExpandSection from '@settings/ExpandSection/ExpandSection';
import { CLUSTER_TAB_IDS } from '@settings/search/constants';

import { getGeneralSettingsLabels } from '../consts/consts';

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
      dataTestID="live-migration"
      searchItemId={CLUSTER_TAB_IDS.liveMigration}
      toggleText={getGeneralSettingsLabels(t).liveMigration}
    >
      <Limits hyperConverge={hyperConverge} />
      <Network hyperConverge={hyperConverge} />
    </ExpandSection>
  );
};

export default LiveMigrationSection;
