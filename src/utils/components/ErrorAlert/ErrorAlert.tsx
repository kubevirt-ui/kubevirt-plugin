import { type FC, type ReactElement, type ReactNode } from 'react';
import { Link } from 'react-router';

import { isForbiddenError } from '@kubevirt-utils/errors/clusterMetricsAccess';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { Alert, AlertVariant, Stack, StackItem } from '@patternfly/react-core';

type ErrorAlertError = {
  href?: string;
  message?: ReactNode;
};

type ErrorAlertProps = {
  error: ErrorAlertError | null | undefined;
};

const ErrorAlert: FC<ErrorAlertProps> = ({ error }): ReactElement | null => {
  const { t } = useKubevirtTranslation();
  if (isEmpty(error)) return null;

  const accessRestricted = isForbiddenError(error);
  const title = accessRestricted ? t('Access Restricted') : t('An error occurred');
  const variant = accessRestricted ? AlertVariant.warning : AlertVariant.danger;
  const message = accessRestricted
    ? t(
        'You do not have the required permissions to view this information. Please contact your OpenShift administrator if you need access.',
      )
    : error.message;

  return (
    <Alert isInline title={title} variant={variant}>
      <Stack hasGutter>
        <StackItem>{message}</StackItem>
        {error.href && (
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
