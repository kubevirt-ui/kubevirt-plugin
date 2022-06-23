import * as React from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Alert, Stack, StackItem } from '@patternfly/react-core';

type FormErrorProps = {
  error?: Error & {
    href: string;
  };
};

export const FormError: React.FC<FormErrorProps> = ({ error }) => {
  const { t } = useKubevirtTranslation();

  if (!error?.message) return null;

  return (
    <StackItem>
      <Alert variant="danger" title={t('Create VirtualMachine error')} isInline>
        <Stack hasGutter>
          <StackItem>{error.message}</StackItem>
          {error?.href && (
            <StackItem>
              <a href={error.href} target="_blank" rel="noreferrer">
                {error.href}
              </a>
            </StackItem>
          )}
        </Stack>
      </Alert>
    </StackItem>
  );
};
