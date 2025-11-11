import React, { FC } from 'react';

import SectionWithSwitch from '@kubevirt-utils/components/SectionWithSwitch/SectionWithSwitch';
import { HIDE_CREDENTIALS_NON_PRIVILEGED } from '@kubevirt-utils/hooks/useFeatures/constants';
import { useFeatures } from '@kubevirt-utils/hooks/useFeatures/useFeatures';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Alert, AlertVariant } from '@patternfly/react-core';

type HideCredentialsProps = {
  newBadge?: boolean;
};

const HideCredentials: FC<HideCredentialsProps> = ({ newBadge = false }) => {
  const { t } = useKubevirtTranslation();
  const { canEdit, error, featureEnabled, loading, toggleFeature } = useFeatures(
    HIDE_CREDENTIALS_NON_PRIVILEGED,
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
        isDisabled={!canEdit}
        isLoading={loading}
        newBadge={newBadge}
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
          {error}
        </Alert>
      )}
    </>
  );
};

export default HideCredentials;
