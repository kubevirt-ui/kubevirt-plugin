import React, { FC } from 'react';

import SectionWithSwitch from '@kubevirt-utils/components/SectionWithSwitch/SectionWithSwitch';
import { HIDE_YAML_TAB } from '@kubevirt-utils/hooks/useFeatures/constants';
import { useFeatures } from '@kubevirt-utils/hooks/useFeatures/useFeatures';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { OLSPromptType } from '@lightspeed/utils/prompts';
import { Alert, AlertVariant } from '@patternfly/react-core';
import { useSettingsCluster } from '@settings/context/SettingsClusterContext';
import ExpandSection from '@settings/ExpandSection/ExpandSection';
import { CLUSTER_TAB_IDS } from '@settings/search/constants';

type HideYamlTabProps = {
  newBadge?: boolean;
};

const HideYamlTab: FC<HideYamlTabProps> = ({ newBadge = false }) => {
  const { t } = useKubevirtTranslation();
  const cluster = useSettingsCluster();
  const { canEdit, error, featureEnabled, loading, toggleFeature } = useFeatures(
    HIDE_YAML_TAB,
    cluster,
  );

  const onChange = async (checked: boolean) => {
    await toggleFeature(checked);
  };

  return (
    <ExpandSection searchItemId={CLUSTER_TAB_IDS.hideYamlTab} toggleText={t('YAML tab visibility')}>
      <SectionWithSwitch
        helpTextIconContent={t(
          'Controls whether non-admin users can access YAML configurations for virtualization objects in the UI (VirtualMachines, VirtualMachineInstances, Templates, DataSources, DataImportCrons, MigrationPolicies, Checkups, and VM Networks).',
        )}
        dataTestID="hide-yaml-tab"
        isDisabled={!canEdit}
        isLoading={loading}
        newBadge={newBadge}
        olsPromptType={OLSPromptType.HIDE_YAML_TAB}
        switchIsOn={featureEnabled}
        title={t('Disable YAML tab for non-admins')}
        turnOnSwitch={onChange}
      />
      {error && (
        <Alert
          className="HideYamlTab--alert"
          isInline
          title={t('Error')}
          variant={AlertVariant.danger}
        >
          {error.message}
        </Alert>
      )}
    </ExpandSection>
  );
};

export default HideYamlTab;
