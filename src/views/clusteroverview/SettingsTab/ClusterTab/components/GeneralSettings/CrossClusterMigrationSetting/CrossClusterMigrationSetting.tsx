import React, { FC } from 'react';

import SectionWithSwitch from '@kubevirt-utils/components/SectionWithSwitch/SectionWithSwitch';
import { useFeatures } from '@kubevirt-utils/hooks/useFeatures/useFeatures';
import { useIsAdmin } from '@kubevirt-utils/hooks/useIsAdmin';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { FEATURE_KUBEVIRT_CROSS_CLUSTER_MIGRATION } from '@multicluster/constants';
import ExpandSection from '@overview/SettingsTab/ExpandSection/ExpandSection';
import { CLUSTER_TAB_IDS } from '@overview/SettingsTab/search/constants';
import { useIsFleetAvailable } from '@stolostron/multicluster-sdk';

const CrossClusterMigrationSetting: FC = () => {
  const { t } = useKubevirtTranslation();
  const isAdmin = useIsAdmin();
  const isFleetAvailable = useIsFleetAvailable();
  const {
    featureEnabled: crossClusterMigrationEnabled,
    loading,
    toggleFeature: toggleCrossClusterMigration,
  } = useFeatures(FEATURE_KUBEVIRT_CROSS_CLUSTER_MIGRATION);

  if (!isFleetAvailable) return null;

  return (
    <ExpandSection
      searchItemId={CLUSTER_TAB_IDS.crossClusterMigration}
      toggleText={t('Cross-cluster migration')}
    >
      <SectionWithSwitch
        dataTestID="cross-cluster-migration"
        id="cross-cluster-migration"
        isDisabled={!isAdmin}
        isLoading={loading}
        switchIsOn={crossClusterMigrationEnabled}
        title={t('Enable cross-cluster migration')}
        turnOnSwitch={toggleCrossClusterMigration}
      />
    </ExpandSection>
  );
};

export default CrossClusterMigrationSetting;
