import React, { FCC } from 'react';

import SectionWithSwitch from '@kubevirt-utils/components/SectionWithSwitch/SectionWithSwitch';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { OLSPromptType } from '@lightspeed/utils/prompts';
import { useSettingsCluster } from '@settings/context/SettingsClusterContext';
import ExpandSection from '@settings/ExpandSection/ExpandSection';
import { CLUSTER_TAB_IDS } from '@settings/search/constants';

import useAdvancedCDROMFeatureFlag from './hooks/useAdvancedCDROMFeatureFlag';
import AdvancedCDROMPopoverContent from './AdvancedCDROMPopoverContent';

type AdvancedCDROMFeaturesProps = {
  newBadge?: boolean;
};

const AdvancedCDROMFeatures: FCC<AdvancedCDROMFeaturesProps> = ({ newBadge }) => {
  const { t } = useKubevirtTranslation();
  const cluster = useSettingsCluster();
  const { canEdit, featureEnabled, loading, toggleFeature } = useAdvancedCDROMFeatureFlag(cluster);

  return (
    <ExpandSection
      searchItemId={CLUSTER_TAB_IDS.advancedCDROMFeatures}
      toggleText={t('Advanced CD-ROM features')}
    >
      <SectionWithSwitch
        dataTestID="advanced-cdrom-features"
        helpTextIconContent={<AdvancedCDROMPopoverContent />}
        isDisabled={!canEdit}
        isLoading={loading}
        newBadge={newBadge}
        olsPromptType={OLSPromptType.ADVANCED_CDROM_FEATURES}
        switchIsOn={featureEnabled}
        title={t('Enable advanced CD-ROM features')}
        turnOnSwitch={toggleFeature}
      />
    </ExpandSection>
  );
};

export default AdvancedCDROMFeatures;
