import React, { FC } from 'react';
import { Link } from 'react-router-dom-v5-compat';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { Alert, AlertVariant, Stack, StackItem } from '@patternfly/react-core';

type ErrorAlertProps = {
  error: any | Error;
};

const ErrorAlert: FC<ErrorAlertProps> = ({ error }) => {
  const { t } = useKubevirtTranslation();
  if (isEmpty(error)) return null;

  return (
    <Alert isInline title={t('An error occurred')} variant={AlertVariant.danger}>
      <Stack hasGutter>
        <StackItem>{error.message}</StackItem>
        {error?.href && (
          <StackItem>
            <Link rel="noreferrer" target="_blank" to={error.href}>
              {error.href}
            </Link>
          </StackItem>
        )}
      </Stack>
    </Alert>
  );
};

export default ErrorAlert;
