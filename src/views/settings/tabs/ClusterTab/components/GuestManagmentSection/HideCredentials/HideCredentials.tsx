import React, { FCC } from 'react';

import SectionWithSwitch from '@kubevirt-utils/components/SectionWithSwitch/SectionWithSwitch';
import { HIDE_CREDENTIALS_NON_PRIVILEGED } from '@kubevirt-utils/hooks/useFeatures/constants';
import { useFeatures } from '@kubevirt-utils/hooks/useFeatures/useFeatures';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { OLSPromptType } from '@lightspeed/utils/prompts';
import { Alert, AlertVariant } from '@patternfly/react-core';
import { useSettingsCluster } from '@settings/context/SettingsClusterContext';

type HideCredentialsProps = {
  newBadge?: boolean;
};

const HideCredentials: FCC<HideCredentialsProps> = ({ newBadge = false }) => {
  const { t } = useKubevirtTranslation();
  const cluster = useSettingsCluster();
  const { canEdit, error, featureEnabled, loading, toggleFeature } = useFeatures(
    HIDE_CREDENTIALS_NON_PRIVILEGED,
    cluster,
  );

  const onChange = async (checked: boolean) => {
    await toggleFeature(checked);
  };

  return (
    <>
      <SectionWithSwitch
        helpTextIconContent={t(
          'When enabled, non-privileged users cannot view VM credentials set via cloud-init',
        )}
        dataTestID="hide-credentials"
        isDisabled={!canEdit}
        isLoading={loading}
        newBadge={newBadge}
        olsPromptType={OLSPromptType.HIDE_GUEST_CREDENTIALS_FOR_NON_PRIV_USERS}
        switchIsOn={featureEnabled}
        title={t('Hide guest credentials for non-privileged users')}
        turnOnSwitch={onChange}
      />
      {error && (
        <Alert
          className="HideCredentials--alert"
          isInline
          title={t('Error')}
          variant={AlertVariant.danger}
        >
          {error.message}
        </Alert>
      )}
    </>
  );
};

export default HideCredentials;
