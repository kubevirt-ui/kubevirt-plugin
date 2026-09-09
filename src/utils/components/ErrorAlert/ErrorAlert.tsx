import React, { type FC, type ReactElement, type ReactNode } from 'react';
import { Link } from 'react-router';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { Alert, AlertVariant, Stack, StackItem } from '@patternfly/react-core';

type ErrorAlertError = {
  href?: string;
  message?: ReactNode;
};

type ErrorAlertProps = {
  error: ErrorAlertError;
};

const ErrorAlert: FC<ErrorAlertProps> = ({ error }): ReactElement | null => {
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
