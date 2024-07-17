import React, { FC } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Alert, AlertVariant } from '@patternfly/react-core';

type GeneralSettingsErrorProps = {
  error: string;
  loading: string;
};

const GeneralSettingsError: FC<GeneralSettingsErrorProps> = ({ error, loading }) => {
  const { t } = useKubevirtTranslation();

  return (
    (error || loading) && (
      <Alert
        className="project-tab__main--error"
        isInline
        title={t('Error')}
        variant={AlertVariant.danger}
      >
        {error || loading}
      </Alert>
    )
  );
};

export default GeneralSettingsError;
