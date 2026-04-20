import React, { FCC } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Alert, AlertVariant } from '@patternfly/react-core';

type GeneralSettingsErrorProps = {
  error: unknown;
  loadingError?: unknown;
};

const toMessage = (value: unknown): string => {
  if (!value) return '';
  if (typeof value === 'string') return value;
  if (value instanceof Error) return value.message;
  if (typeof value === 'object' && value !== null && 'message' in value)
    return String((value as { message: unknown }).message);
  return String(value);
};

const GeneralSettingsError: FCC<GeneralSettingsErrorProps> = ({ error, loadingError }) => {
  const { t } = useKubevirtTranslation();
  const message = toMessage(error) || toMessage(loadingError);

  if (!message) return null;

  return (
    <Alert
      className="project-tab__main--error"
      isInline
      title={t('Error')}
      variant={AlertVariant.danger}
    >
      {message}
    </Alert>
  );
};

export default GeneralSettingsError;
